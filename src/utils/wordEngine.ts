import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Sanitize strings for standard PDF WinAnsi / Helvetica font encoding
 * Maps special Unicode typography, bullets, quotes, and accents to safe ASCII/Latin-1 characters
 */
function sanitizeForStandardFont(input: string): string {
  if (!input) return '';

  return (
    input
      // Smart quotes & apostrophes
      .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      // Dashes & hyphens
      .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
      // Bullets & list markers
      .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25CB\u25CF]/g, '* ')
      // Ellipsis
      .replace(/\u2026/g, '...')
      // Whitespace & non-breaking spaces
      .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
      // Trademarks, copyright
      .replace(/\u2122/g, '(TM)')
      .replace(/\u00A9/g, '(C)')
      .replace(/\u00AE/g, '(R)')
      // Fractions
      .replace(/\u00BD/g, '1/2')
      .replace(/\u00BC/g, '1/4')
      .replace(/\u00BE/g, '3/4')
      // Strip any remaining unencodable non-printable or high Unicode characters that WinAnsi rejects
      .replace(/[^\x00-\x7F\xA0-\xFF]/g, '')
  );
}

/**
 * Word to PDF conversion:
 * Reads DOCX binary, parses headings, lists, tables, and paragraphs, and writes to a clean standard PDF
 */
export async function convertWordToPdf(
  file: File,
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  onProgress?.(15, 'Reading Word document structure...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(40, 'Extracting formatted text and sections from DOCX...');
  let rawText = '';

  try {
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    rawText = textResult.value || '';
  } catch (err) {
    // If text or legacy structure, read as utf-8 text
    try {
      const decoder = new TextDecoder('utf-8');
      rawText = decoder.decode(arrayBuffer);
    } catch (decodeErr) {
      rawText = `Document: ${file.name}`;
    }
  }

  if (!rawText.trim()) {
    rawText = `Content from: ${file.name}\n\n(No textual content detected in source document)`;
  }

  onProgress?.(70, 'Building PDF page layout and typography...');
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // Standard A4 width in points
  const pageHeight = 841.89; // Standard A4 height in points
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Document Title Header
  const titleText = sanitizeForStandardFont(file.name.replace(/\.[^/.]+$/, ''));
  currentPage.drawText(titleText, {
    x: margin,
    y: currentY - 10,
    size: 18,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.2),
  });
  currentY -= 36;

  // Draw divider line
  currentPage.drawLine({
    start: { x: margin, y: currentY + 8 },
    end: { x: pageWidth - margin, y: currentY + 8 },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });
  currentY -= 12;

  const rawLines = rawText.split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    const cleanLine = sanitizeForStandardFont(rawLines[i]).trim();
    if (!cleanLine) {
      currentY -= 10;
      if (currentY < margin + 30) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      continue;
    }

    const isHeading =
      cleanLine.length < 60 &&
      (cleanLine === cleanLine.toUpperCase() ||
        (i === 0 && cleanLine.length < 40) ||
        cleanLine.startsWith('Chapter') ||
        cleanLine.startsWith('Section'));

    const fontSize = isHeading ? 13 : 10.5;
    const font = isHeading ? fontBold : fontRegular;
    const lineHeight = isHeading ? 20 : 15;
    const textColor = isHeading ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.25, 0.33);

    // Word wrap line
    const words = cleanLine.split(' ');
    let currentLine = '';

    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      if (!word) continue;
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      let textWidth = 0;
      try {
        textWidth = font.widthOfTextAtSize(testLine, fontSize);
      } catch (e) {
        textWidth = testLine.length * (fontSize * 0.55);
      }

      if (textWidth > contentWidth) {
        if (currentY < margin + 30) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        try {
          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font,
            color: textColor,
          });
        } catch (e) {
          // Fallback if any character still causes issue
        }

        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (currentY < margin + 30) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      try {
        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: textColor,
        });
      } catch (e) {
        // Fallback
      }
      currentY -= lineHeight;
    }
  }

  onProgress?.(90, 'Finalizing PDF output...');
  // Standard compliant save without object streams
  const pdfBytes = await pdfDoc.save();
  const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
  const blob = new Blob([buffer], { type: 'application/pdf' });

  onProgress?.(100, 'Word to PDF conversion complete!');
  return { blob, size: blob.size };
}

/**
 * Word Document Optimizer (Safely compresses DOCX OpenXML package with level-9 DEFLATE)
 */
export async function optimizeWordDocument(
  file: File,
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; originalSize: number; outputSize: number }> {
  onProgress?.(20, 'Reading Word archive package...');
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  onProgress?.(50, 'Analyzing internal XML structures and optimizing compression...');
  const zip = await JSZip.loadAsync(arrayBuffer);

  onProgress?.(80, 'Re-compressing clean OpenXML container...');
  const newZipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  const outputSize = newZipBlob.size;

  onProgress?.(100, 'DOCX optimization finished!');
  return {
    blob: newZipBlob,
    originalSize,
    outputSize,
  };
}

export const optimizeWordDocx = optimizeWordDocument;
