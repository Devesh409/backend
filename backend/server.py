from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import io
from fastapi.responses import StreamingResponse

from services.text_extraction import extract_text_from_file
from services.question_generator import generate_questions_with_answers
from services.pdf_generator import generate_assignment_pdf

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.environ.get('JWT_SECRET', 'eduqg_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EBookCreate(BaseModel):
    title: str
    file_type: str

class EBook(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    file_type: str
    file_path: str
    extracted_text: str
    word_count: int
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EBookSummary(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    title: str
    file_type: str
    file_path: str
    word_count: int
    uploaded_at: datetime

class QuestionGenerationRequest(BaseModel):
    ebook_id: str
    question_types: List[str]
    difficulty: str
    num_questions: int

class GeneratedQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    ebook_id: str
    question_type: str
    difficulty: str
    question: str
    answer: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssignmentGenerateRequest(BaseModel):
    question_ids: List[str]
    student_name: str
    roll_number: str
    subject: str
    handwriting_style: str
    pen_color: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, name=user_data.name)
    doc = user.model_dump()
    doc['password'] = hashed_password
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop('password')
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    token = jwt.encode(
        {"user_id": user_doc['id'], "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return {"token": token, "user": User(**user_doc)}

@api_router.post("/ebooks/upload")
async def upload_ebook(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    allowed_types = ['pdf', 'docx', 'txt', 'epub']
    file_ext = file.filename.split('.')[-1].lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type not supported. Allowed: {allowed_types}")
    
    file_content = await file.read()
    
    try:
        extracted_text = await extract_text_from_file(file_content, file_ext)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")
    
    word_count = len(extracted_text.split())
    
    upload_dir = Path("/app/uploads")
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / f"{uuid.uuid4()}_{file.filename}"
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    ebook = EBook(
        user_id=current_user.id,
        title=file.filename,
        file_type=file_ext,
        file_path=str(file_path),
        extracted_text=extracted_text[:50000],
        word_count=word_count
    )
    
    doc = ebook.model_dump()
    doc['uploaded_at'] = doc['uploaded_at'].isoformat()
    
    await db.ebooks.insert_one(doc)
    
    return ebook

@api_router.get("/ebooks", response_model=List[EBookSummary])
async def get_ebooks(current_user: User = Depends(get_current_user)):
    ebooks = await db.ebooks.find({"user_id": current_user.id}, {"_id": 0, "extracted_text": 0}).to_list(100)
    
    for ebook in ebooks:
        if isinstance(ebook['uploaded_at'], str):
            ebook['uploaded_at'] = datetime.fromisoformat(ebook['uploaded_at'])
    
    return ebooks

@api_router.post("/questions/generate")
async def generate_questions(request: QuestionGenerationRequest, current_user: User = Depends(get_current_user)):
    ebook = await db.ebooks.find_one({"id": request.ebook_id, "user_id": current_user.id}, {"_id": 0})
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book not found")
    
    try:
        questions_data = await generate_questions_with_answers(
            ebook['extracted_text'],
            request.question_types,
            request.difficulty,
            request.num_questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")
    
    saved_questions = []
    for q_data in questions_data:
        question = GeneratedQuestion(
            user_id=current_user.id,
            ebook_id=request.ebook_id,
            question_type=q_data['type'],
            difficulty=request.difficulty,
            question=q_data['question'],
            answer=q_data['answer']
        )
        doc = question.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.questions.insert_one(doc)
        saved_questions.append(question)
    
    return saved_questions

@api_router.get("/questions", response_model=List[GeneratedQuestion])
async def get_questions(ebook_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if ebook_id:
        query["ebook_id"] = ebook_id
    
    questions = await db.questions.find(query, {"_id": 0}).to_list(1000)
    
    for q in questions:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    
    return questions

@api_router.post("/assignments/generate")
async def generate_assignment(request: AssignmentGenerateRequest, current_user: User = Depends(get_current_user)):
    questions = []
    for qid in request.question_ids:
        q = await db.questions.find_one({"id": qid, "user_id": current_user.id}, {"_id": 0})
        if q:
            questions.append(q)
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found")
    
    try:
        pdf_bytes = generate_assignment_pdf(
            questions,
            request.student_name,
            request.roll_number,
            request.subject,
            request.handwriting_style,
            request.pen_color
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=assignment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"}
    )

@api_router.get("/")
async def root():
    return {"message": "EduQG AI Backend Running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()