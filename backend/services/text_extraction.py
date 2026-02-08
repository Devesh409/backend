import PyPDF2
from docx import Document
import io
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

async def extract_text_from_file(file_content: bytes, file_type: str) -> str:
    """
    Extract text from various file formats
    """
    if file_type == 'pdf':
        return extract_from_pdf(file_content)
    elif file_type == 'docx':
        return extract_from_docx(file_content)
    elif file_type == 'txt':
        return file_content.decode('utf-8', errors='ignore')
    elif file_type == 'epub':
        return extract_from_epub(file_content)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def extract_from_pdf(file_content: bytes) -> str:
    pdf_file = io.BytesIO(file_content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()

def extract_from_docx(file_content: bytes) -> str:
    doc_file = io.BytesIO(file_content)
    doc = Document(doc_file)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()

def extract_from_epub(file_content: bytes) -> str:
    book = epub.read_epub(io.BytesIO(file_content))
    text = ""
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            soup = BeautifulSoup(item.get_content(), 'html.parser')
            text += soup.get_text() + "\n"
    return text.strip()