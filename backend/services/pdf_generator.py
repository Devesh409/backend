from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

def generate_assignment_pdf(
    questions: list,
    student_name: str,
    roll_number: str,
    subject: str,
    handwriting_style: str,
    pen_color: str
) -> bytes:
    """
    Generate a PDF assignment with questions and answers
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Title Page
    title_style = styles['Title']
    title_style.alignment = TA_CENTER
    title = Paragraph(f"<b>{subject}</b>", title_style)
    story.append(title)
    story.append(Spacer(1, 0.3*inch))
    
    subtitle_style = styles['Heading2']
    subtitle_style.alignment = TA_CENTER
    subtitle = Paragraph("Assignment", subtitle_style)
    story.append(subtitle)
    story.append(Spacer(1, 0.5*inch))
    
    # Student Details
    normal_style = styles['Normal']
    normal_style.alignment = TA_CENTER
    
    details = [
        f"<b>Student Name:</b> {student_name}",
        f"<b>Roll Number:</b> {roll_number}",
        f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}",
        f"<b>Handwriting Style:</b> {handwriting_style}",
        f"<b>Pen Color:</b> {pen_color.capitalize()}"
    ]
    
    for detail in details:
        story.append(Paragraph(detail, normal_style))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(PageBreak())
    
    # Questions and Answers
    question_style = styles['Heading3']
    answer_style = styles['Normal']
    
    for idx, q in enumerate(questions, 1):
        # Question
        q_text = f"<b>Q{idx}. [{q['question_type']}]</b> {q['question']}"
        story.append(Paragraph(q_text, question_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Answer
        a_text = f"<b>Answer:</b> {q['answer']}"
        story.append(Paragraph(a_text, answer_style))
        story.append(Spacer(1, 0.4*inch))
    
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes