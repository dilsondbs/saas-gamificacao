"""Robust PDF Content Extraction"""
import logging
from typing import BinaryIO
import pdfplumber
from app.models.schemas import ExtractedContent

logger = logging.getLogger(__name__)


class PDFExtractor:
    """Extract and analyze content from PDF files"""

    async def extract(self, pdf_file: BinaryIO) -> ExtractedContent:
        """Extract content from PDF"""
        logger.info("📄 Extracting PDF content...")

        try:
            text_parts = []
            page_count = 0

            with pdfplumber.open(pdf_file) as pdf:
                page_count = len(pdf.pages)

                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)

                    if page_num % 10 == 0:
                        logger.info(f"   Processed {page_num}/{page_count} pages")

            full_text = "\n\n".join(text_parts)
            char_count = len(full_text)
            word_count = len(full_text.split())

            # Quality score heuristics
            quality_score = self._calculate_quality(full_text, page_count)

            logger.info(
                f"✅ Extracted: {page_count} pages, {char_count} chars, "
                f"{word_count} words, quality: {quality_score:.0%}"
            )

            return ExtractedContent(
                text=full_text,
                char_count=char_count,
                word_count=word_count,
                page_count=page_count,
                quality_score=quality_score
            )

        except Exception as e:
            logger.error(f"❌ PDF extraction failed: {e}")
            raise ValueError(f"Failed to extract PDF content: {str(e)}")

    def _calculate_quality(self, text: str, page_count: int) -> float:
        """Calculate content quality score"""
        score = 0.5  # Base score

        # More pages = higher quality (up to 20 pages)
        if page_count >= 5:
            score += 0.1
        if page_count >= 10:
            score += 0.1

        # More words = better content
        word_count = len(text.split())
        if word_count >= 500:
            score += 0.1
        if word_count >= 2000:
            score += 0.1

        # Check for structure (headings, bullets)
        if any(marker in text for marker in ['\n•', '\n-', '\n*']):
            score += 0.1

        return min(score, 1.0)


pdf_extractor = PDFExtractor()
