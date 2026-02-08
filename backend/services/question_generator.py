import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

load_dotenv()

EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')

async def generate_questions_with_answers(
    text_content: str,
    question_types: list,
    difficulty: str,
    num_questions: int
) -> list:
    """
    Generate questions using OpenAI GPT via Emergent LLM integration
    """
    
    # Truncate text if too long
    max_chars = 8000
    if len(text_content) > max_chars:
        text_content = text_content[:max_chars] + "..."
    
    system_message = f"""You are an expert educational assessment designer. Generate {num_questions} high-quality academic questions from the provided text.

Difficulty Level: {difficulty}
Question Types Needed: {', '.join(question_types)}

For each question:
1. Create a clear, well-structured question
2. Provide a comprehensive answer
3. Ensure questions test understanding, not just memorization
4. Make questions exam-worthy and academically rigorous

Return ONLY a valid JSON array with this exact format:
[
  {{
    "type": "MCQ" or "Short Answer" or "Long Answer" or "Case Study",
    "question": "The question text here",
    "answer": "The detailed answer here"
  }}
]

IMPORTANT: Return ONLY the JSON array, no other text."""
    
    user_prompt = f"""Text Content:
{text_content}

Generate {num_questions} questions with answers based on this content."""
    
    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=f"qgen_{os.urandom(8).hex()}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    message = UserMessage(text=user_prompt)
    response = await chat.send_message(message)
    
    # Parse JSON response
    try:
        # Extract JSON from response
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
        
        questions_data = json.loads(response_text)
        
        # Validate and ensure correct types
        valid_questions = []
        for q in questions_data:
            if 'question' in q and 'answer' in q:
                if 'type' not in q:
                    q['type'] = question_types[0] if question_types else 'Short Answer'
                valid_questions.append(q)
        
        return valid_questions[:num_questions]
    
    except json.JSONDecodeError:
        # Fallback: parse manually if JSON fails
        return [{
            "type": question_types[0] if question_types else "Short Answer",
            "question": "Generated question based on content",
            "answer": response[:500]
        }]