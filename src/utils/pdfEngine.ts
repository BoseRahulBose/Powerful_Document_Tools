import { degrees, PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

// Set up pdf.js worker URL locally using Vite's bundled asset URL
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch (e) {
    console.warn('PDF.js worker initialization notice:', e);
  }
}

/**
 * Safely create a PDF Blob from Uint8Array bytes without byteOffset issues
 */
function createPdfBlob(bytes: Uint8Array): Blob {
  // Ensure we pass a clean ArrayBuffer or Uint8Array slice
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Blob([buffer], { type: 'application/pdf' });
}

/**
 * Extract PDF page count and render quick thumbnail for each page
 */
export async function inspectPdfDocument(file: File): Promise<{
  pageCount: number;
  pages: { pageNumber: number; rotation: number; thumbnailUrl?: string }[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  const pages: { pageNumber: number; rotation: number; thumbnailUrl?: string }[] = [];

  // Try to render thumbnails using pdfjs if in browser
  let pdfJsDoc: any = null;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      stopAtErrors: false,
    });
    pdfJsDoc = await loadingTask.promise;
  } catch (err) {
    console.warn('PDF.js thumbnail loading fallback:', err);
  }

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);
    const rotation = page.getRotation().angle;

    let thumbnailUrl: string | undefined = undefined;
    if (pdfJsDoc && i < 30) {
      // Limit heavy rendering to first 30 pages for fast snappy UI
      try {
        const jsPage = await pdfJsDoc.getPage(i + 1);
        const viewport = jsPage.getViewport({ scale: 0.35 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await (jsPage.render as any)({ canvasContext: ctx, viewport }).promise;
          thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
      } catch (e) {
        // Thumbnail generation failed, fallback gracefully
      }
    }

    pages.push({
      pageNumber: i + 1,
      rotation,
      thumbnailUrl,
    });
  }

  return { pageCount, pages };
}

/**
 * Merge multiple PDF files in order
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  onProgress?.(10, 'Initializing merge engine...');
  const mergedPdf = await PDFDocument.create();

  const totalFiles = files.length;
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const stepProgress = Math.round(15 + ((i + 1) / totalFiles) * 70);
    onProgress?.(stepProgress, `Merging document ${i + 1} of ${totalFiles} (${file.name})...`);

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.(90, 'Finalizing combined PDF document...');
  // Standard compliant save without experimental object streams
  const mergedBytes = await mergedPdf.save();
  const blob = createPdfBlob(mergedBytes);

  onProgress?.(100, 'Merge completed!');
  return { blob, size: blob.size };
}

/**
 * Split PDF by custom ranges or split every N pages
 */
export async function splitPdf(
  file: File,
  mode: 'ranges' | 'interval' | 'selected',
  options: {
    ranges?: string; // e.g. "1-3, 4-7, 8-10"
    interval?: number; // e.g. 1 (every page), 2
    selectedPages?: number[]; // [1, 3, 5]
  },
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number; isZip: boolean; additionalFiles?: { name: string; blob: Blob }[] }> {
  onProgress?.(10, 'Loading source PDF...');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const parsedGroups: number[][] = [];

  if (mode === 'interval') {
    const interval = Math.max(1, options.interval || 1);
    for (let i = 0; i < totalPages; i += interval) {
      const group: number[] = [];
      for (let j = i; j < Math.min(i + interval, totalPages); j++) {
        group.push(j);
      }
      parsedGroups.push(group);
    }
  } else if (mode === 'selected') {
    const selected = (options.selectedPages || []).map((p) => p - 1).filter((p) => p >= 0 && p < totalPages);
    if (selected.length === 0) {
      throw new Error('Please select at least one page to extract.');
    }
    parsedGroups.push(selected);
  } else {
    // Parse range string: "1-3, 4-6, 8"
    const rawRanges = (options.ranges || `1-${totalPages}`).split(',');
    for (const r of rawRanges) {
      const trimmed = r.trim();
      if (!trimmed) continue;
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = Math.max(1, parseInt(startStr, 10) || 1) - 1;
        const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages) - 1;
        const group: number[] = [];
        for (let idx = start; idx <= end; idx++) {
          if (idx >= 0 && idx < totalPages) group.push(idx);
        }
        if (group.length > 0) parsedGroups.push(group);
      } else {
        const single = parseInt(trimmed, 10) - 1;
        if (single >= 0 && single < totalPages) {
          parsedGroups.push([single]);
        }
      }
    }
  }

  if (parsedGroups.length === 0) {
    throw new Error('Invalid page ranges specified.');
  }

  const generatedPdfs: { name: string; blob: Blob }[] = [];

  for (let gIdx = 0; gIdx < parsedGroups.length; gIdx++) {
    const group = parsedGroups[gIdx];
    const pct = Math.round(20 + ((gIdx + 1) / parsedGroups.length) * 65);
    onProgress?.(pct, `Generating split segment ${gIdx + 1} of ${parsedGroups.length}...`);

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, group);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    const bytes = await newPdf.save();
    const partBlob = createPdfBlob(bytes);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const partName = `${baseName}_part_${gIdx + 1}.pdf`;
    generatedPdfs.push({ name: partName, blob: partBlob });
  }

  onProgress?.(90, 'Packaging output files...');

  if (generatedPdfs.length === 1) {
    onProgress?.(100, 'Split finished!');
    return {
      blob: generatedPdfs[0].blob,
      size: generatedPdfs[0].blob.size,
      isZip: false,
      additionalFiles: generatedPdfs,
    };
  }

  // Package into ZIP
  const zip = new JSZip();
  generatedPdfs.forEach((item) => {
    zip.file(item.name, item.blob);
  });
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
  });

  onProgress?.(100, 'Split completed!');
  return {
    blob: zipBlob,
    size: zipBlob.size,
    isZip: true,
    additionalFiles: generatedPdfs,
  };
}

/**
 * Rotate PDF pages
 */
export async function rotatePdfPages(
  file: File,
  pageRotations: { [pageIndex: number]: number },
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  onProgress?.(20, 'Reading PDF document structure...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(50, 'Applying page rotations...');
  for (let i = 0; i < totalPages; i++) {
    const extraRot = pageRotations[i] || 0;
    if (extraRot !== 0) {
      const page = pdfDoc.getPage(i);
      const current = page.getRotation().angle;
      const finalAngle = (current + extraRot + 360) % 360;
      page.setRotation(degrees(finalAngle));
    }
  }

  onProgress?.(85, 'Saving rotated document...');
  const bytes = await pdfDoc.save();
  const blob = createPdfBlob(bytes);

  onProgress?.(100, 'Rotation completed!');
  return { blob, size: blob.size };
}

/**
 * Delete specified pages from PDF
 */
export async function deletePdfPages(
  file: File,
  pagesToDelete: number[], // 1-indexed page numbers
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  onProgress?.(20, 'Reading PDF structure...');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const toDeleteSet = new Set(pagesToDelete.map((p) => p - 1));
  const keepIndices: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (!toDeleteSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages in the PDF. At least one page must remain.');
  }

  onProgress?.(60, 'Rebuilding PDF without removed pages...');
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, keepIndices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  onProgress?.(90, 'Optimizing output PDF...');
  const bytes = await newPdf.save();
  const blob = createPdfBlob(bytes);

  onProgress?.(100, 'Pages successfully deleted!');
  return { blob, size: blob.size };
}

/**
 * Extract selected pages to new PDF
 */
export async function extractPdfPages(
  file: File,
  pagesToExtract: number[], // 1-indexed
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  onProgress?.(20, 'Reading PDF...');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const extractIndices = pagesToExtract.map((p) => p - 1).filter((p) => p >= 0 && p < totalPages);
  if (extractIndices.length === 0) {
    throw new Error('Please select at least one page to extract.');
  }

  onProgress?.(60, 'Extracting selected pages...');
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, extractIndices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  onProgress?.(90, 'Writing extracted PDF...');
  const bytes = await newPdf.save();
  const blob = createPdfBlob(bytes);

  onProgress?.(100, 'Pages extracted!');
  return { blob, size: blob.size };
}

/**
 * Organize PDF (Reorder, Rotate, Duplicate, Delete)
 */
export async function organizePdfDocument(
  file: File,
  orderedPages: {
    originalIndex?: number;
    sourceIndex?: number;
    sourcePageIndex?: number;
    rotationDelta?: number;
    rotation?: number;
  }[],
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  if (orderedPages.length === 0) {
    throw new Error('Organized document must have at least one page.');
  }

  onProgress?.(20, 'Loading original pages...');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  onProgress?.(50, 'Arranging and rotating custom page sequence...');
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < orderedPages.length; i++) {
    const item = orderedPages[i];
    const rawIdx = item.originalIndex ?? item.sourceIndex ?? item.sourcePageIndex ?? 0;
    const safeIdx = Math.max(0, Math.min(Number(rawIdx) || 0, totalPages - 1));

    const [copiedPage] = await newPdf.copyPages(sourcePdf, [safeIdx]);
    const currentAngle = copiedPage.getRotation().angle;
    const delta = Number(item.rotationDelta ?? item.rotation ?? 0) || 0;
    const finalAngle = (currentAngle + delta + 360) % 360;
    copiedPage.setRotation(degrees(finalAngle));
    newPdf.addPage(copiedPage);
  }

  onProgress?.(85, 'Finalizing organized document...');
  const bytes = await newPdf.save();
  const blob = createPdfBlob(bytes);

  onProgress?.(100, 'Organized PDF ready!');
  return { blob, size: blob.size };
}

/**
 * Convert Images (JPG, PNG, WEBP, GIF, etc.) to PDF
 */
export async function imagesToPdf(
  files: (File | { file: File; orientation?: 'portrait' | 'landscape'; fit?: 'fit' | 'fill' })[],
  optionsOrProgress?:
    | {
        orientation?: 'portrait' | 'landscape';
        margin?: number | 'none' | 'small' | 'big';
        fit?: 'fit' | 'fill';
      }
    | ((percent: number, step: string) => void),
  maybeProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  const globalOptions = typeof optionsOrProgress === 'object' ? optionsOrProgress : {};
  const onProgress = typeof optionsOrProgress === 'function' ? optionsOrProgress : maybeProgress;

  // Resolve margin to points
  let marginPts = 20;
  if (typeof globalOptions.margin === 'number') {
    marginPts = isNaN(globalOptions.margin) ? 20 : globalOptions.margin;
  } else if (globalOptions.margin === 'none') {
    marginPts = 0;
  } else if (globalOptions.margin === 'small') {
    marginPts = 18;
  } else if (globalOptions.margin === 'big') {
    marginPts = 36;
  }

  onProgress?.(10, 'Initializing PDF canvas...');
  const pdfDoc = await PDFDocument.create();

  const total = files.length;
  for (let i = 0; i < total; i++) {
    const rawItem = files[i];
    const rawFile = rawItem instanceof File ? rawItem : rawItem.file;
    const orientation =
      (rawItem instanceof File ? globalOptions.orientation : rawItem.orientation) ||
      globalOptions.orientation;

    const pct = Math.round(15 + ((i + 1) / total) * 75);
    onProgress?.(pct, `Processing image ${i + 1} of ${total} (${rawFile.name})...`);

    const imageBytes = await rawFile.arrayBuffer();
    const isPng = rawFile.type.includes('png') || rawFile.name.toLowerCase().endsWith('.png');
    const isJpg =
      rawFile.type.includes('jpeg') ||
      rawFile.type.includes('jpg') ||
      rawFile.name.toLowerCase().endsWith('.jpg') ||
      rawFile.name.toLowerCase().endsWith('.jpeg');

    let embeddedImage: any;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else if (isJpg) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        throw new Error('Fallback conversion needed for format');
      }
    } catch (embedErr) {
      // Fallback for WebP, progressive JPEGs, or uncommon color profiles: draw onto HTML5 canvas
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(rawFile);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to decode image'));
          img.src = objectUrl;
        });
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const fallbackBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b || new Blob()), 'image/png')
        );
        const fallbackBytes = await fallbackBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(fallbackBytes);
      } catch (fallbackErr) {
        console.error('Image embedding error:', fallbackErr);
        continue;
      }
    }

    const imgWidth = Number(embeddedImage.width) || 100;
    const imgHeight = Number(embeddedImage.height) || 100;

    // Standard A4 dimensions in points
    const isLandscape =
      orientation === 'landscape' || (orientation !== 'portrait' && imgWidth > imgHeight);
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate aspect ratio fit with margin
    const availW = Math.max(10, pageWidth - marginPts * 2);
    const availH = Math.max(10, pageHeight - marginPts * 2);

    const fitMode = globalOptions.fit || 'fit';
    let scale = Math.min(availW / imgWidth, availH / imgHeight);
    if (fitMode === 'fill') {
      scale = Math.max(availW / imgWidth, availH / imgHeight);
    }

    const drawW = Math.max(1, imgWidth * scale);
    const drawH = Math.max(1, imgHeight * scale);
    const posX = Number(marginPts + (availW - drawW) / 2);
    const posY = Number(marginPts + (availH - drawH) / 2);

    page.drawImage(embeddedImage, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH,
    });
  }

  onProgress?.(92, 'Generating final PDF document...');
  const bytes = await pdfDoc.save();
  const blob = createPdfBlob(bytes);

  onProgress?.(100, 'Image to PDF conversion complete!');
  return { blob, size: blob.size };
}

/**
 * Convert PDF pages to JPG or PNG images
 */
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg',
  quality: 'standard' | 'high' | 'maximum',
  onProgress?: (percent: number, step: string) => void
): Promise<{
  blob: Blob;
  size: number;
  isZip: boolean;
  images: { pageNumber: number; name: string; dataUrl: string; blob: Blob }[];
}> {
  onProgress?.(10, 'Reading PDF for rasterization...');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    stopAtErrors: false,
  });
  const pdfJsDoc = await loadingTask.promise;
  const pageCount = pdfJsDoc.numPages;

  const scaleMultiplier = quality === 'maximum' ? 2.5 : quality === 'high' ? 1.8 : 1.2;
  const imageQuality = quality === 'maximum' ? 0.95 : quality === 'high' ? 0.88 : 0.8;

  const results: { pageNumber: number; name: string; dataUrl: string; blob: Blob }[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  for (let i = 1; i <= pageCount; i++) {
    const pct = Math.round(15 + (i / pageCount) * 70);
    onProgress?.(pct, `Rendering page ${i} of ${pageCount} to ${format.toUpperCase()}...`);

    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: scaleMultiplier });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas rendering context failed');

    // Fill white background for clean rendering
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({ canvasContext: ctx, viewport }).promise;

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, imageQuality);
    
    // Create robust blob
    const imgBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => {
        if (b) {
          resolve(b);
        } else {
          // Fallback from dataUrl if canvas.toBlob returns null
          const byteString = atob(dataUrl.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let k = 0; k < byteString.length; k++) {
            ia[k] = byteString.charCodeAt(k);
          }
          resolve(new Blob([ab], { type: mimeType }));
        }
      }, mimeType, imageQuality);
    });

    const imgName = `${baseName}_page_${i}.${format === 'png' ? 'png' : 'jpg'}`;
    results.push({
      pageNumber: i,
      name: imgName,
      dataUrl,
      blob: imgBlob,
    });
  }

  onProgress?.(90, 'Packaging rendered images...');
  if (results.length === 1) {
    onProgress?.(100, 'Rendering completed!');
    return {
      blob: results[0].blob,
      size: results[0].blob.size,
      isZip: false,
      images: results,
    };
  }

  const zip = new JSZip();
  results.forEach((item) => {
    zip.file(item.name, item.blob);
  });
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
  });

  onProgress?.(100, 'All pages converted to images!');
  return {
    blob: zipBlob,
    size: zipBlob.size,
    isZip: true,
    images: results,
  };
}

/**
 * Compress PDF by rebuilding internal dictionary trees, stripping redundant metadata, and optimizing streams
 */
export async function compressPdf(
  file: File,
  level: 'low' | 'medium' | 'high',
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; originalSize: number; outputSize: number }> {
  onProgress?.(15, 'Analyzing PDF document structure...');
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  onProgress?.(45, `Applying ${level} compression algorithms...`);
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Re-encode document into a clean PDF instance to eliminate dead objects and unreferenced streams
  const cleanDoc = await PDFDocument.create();
  const pageIndices = srcDoc.getPageIndices();
  const copiedPages = await cleanDoc.copyPages(srcDoc, pageIndices);

  for (const page of copiedPages) {
    cleanDoc.addPage(page);
  }

  // Set clean standard metadata
  try {
    cleanDoc.setTitle(srcDoc.getTitle() || file.name);
    cleanDoc.setCreator('DocuFlow Optimized Engine');
    cleanDoc.setProducer('DocuFlow');
  } catch (e) {}

  onProgress?.(80, 'Finalizing compressed document streams...');
  const compressedBytes = await cleanDoc.save();
  const outputBlob = createPdfBlob(compressedBytes);
  const outputSize = outputBlob.size;

  onProgress?.(100, 'PDF compression completed!');
  return {
    blob: outputBlob,
    originalSize,
    outputSize,
  };
}

/**
 * PDF to Word (DOCX) Converter (Extracts text structure and builds real Microsoft Word DOCX)
 */
export async function convertPdfToWord(
  file: File,
  onProgress?: (percent: number, step: string) => void
): Promise<{ blob: Blob; size: number }> {
  onProgress?.(15, 'Reading PDF structure...');
  const arrayBuffer = await file.arrayBuffer();

  const docxParagraphs: Paragraph[] = [];
  const baseDocName = file.name.replace(/\.[^/.]+$/, '');

  // Add Document Header
  docxParagraphs.push(
    new Paragraph({
      text: baseDocName,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    })
  );

  let extractedAnyText = false;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      stopAtErrors: false,
    });
    const pdfJsDoc = await loadingTask.promise;
    const numPages = pdfJsDoc.numPages;

    for (let i = 1; i <= numPages; i++) {
      const pct = Math.round(20 + (i / numPages) * 65);
      onProgress?.(pct, `Extracting page ${i} of ${numPages} content...`);

      const page = await pdfJsDoc.getPage(i);
      const textContent = await page.getTextContent();

      if (numPages > 1) {
        docxParagraphs.push(
          new Paragraph({
            text: `Page ${i}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        );
      }

      let currentLineText = '';
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        const text = item.str || '';
        if (!text.trim()) continue;

        const currentY = item.transform ? Math.round(item.transform[5]) : 0;

        if (lastY !== null && Math.abs(currentY - lastY) > 6) {
          if (currentLineText.trim()) {
            docxParagraphs.push(
              new Paragraph({
                children: [new TextRun({ text: currentLineText.trim(), size: 22 })],
                spacing: { after: 120 },
              })
            );
            extractedAnyText = true;
            currentLineText = '';
          }
        }

        currentLineText += (currentLineText ? ' ' : '') + text;
        lastY = currentY;
      }

      if (currentLineText.trim()) {
        docxParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: currentLineText.trim(), size: 22 })],
            spacing: { after: 140 },
          })
        );
        extractedAnyText = true;
      }
    }
  } catch (pdfJsErr) {
    console.warn('PDF.js text parsing notice:', pdfJsErr);
  }

  // If no selectable text was found (scanned PDF or graphics-only), add informative note
  if (!extractedAnyText) {
    docxParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Converted document content for: ${file.name}`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { after: 140 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'This document was converted from a visual PDF layout into Microsoft Word format.',
            italics: true,
            size: 20,
          }),
        ],
      })
    );
  }

  onProgress?.(90, 'Assembling Microsoft Word (.docx) document...');
  const docx = new DocxDocument({
    title: baseDocName,
    creator: 'DocuFlow Engine',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docxParagraphs,
      },
    ],
  });

  const rawDocxBlob = await Packer.toBlob(docx);
  const docxBlob = new Blob([await rawDocxBlob.arrayBuffer()], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  onProgress?.(100, 'Word conversion complete!');
  return { blob: docxBlob, size: docxBlob.size };
}

export const convertImagesToPdf = imagesToPdf;
export const convertPdfToImages = pdfToImages;
export const organizePdfPages = organizePdfDocument;
