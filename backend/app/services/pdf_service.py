from pathlib import Path


def extract_pdf_text(pdf_source: str | Path | bytes) -> str:
    import fitz

    if isinstance(pdf_source, bytes):
        document = fitz.open(stream=pdf_source, filetype="pdf")
    else:
        document = fitz.open(pdf_source)
    with document:
        pages = [page.get_text("text") for page in document]
    return clean_resume_text("\n".join(pages))


def clean_resume_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)
