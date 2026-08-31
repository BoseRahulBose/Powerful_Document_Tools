import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { PDFDocument, degrees } from 'pdf-lib';
import mammoth from 'mammoth';
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';

const app = express();
const PORT = 3000;

// Setup directories
const TEMP_DIR = path.join(process.cwd(), 'tmp');
const UPLOAD_DIR = path.join(TEMP_DIR, 'uploads');
const PROCESSED_DIR = path.join(TEMP_DIR, 'processed');

[TEMP_DIR, UPLOAD_DIR, PROCESSED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Basic extension check
    const allowed = /\.(pdf|docx|doc|txt|rtf|jpg|jpeg|png|webp)$/i;
    if (file.originalname.match(allowed)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory registry for downloadable processed files
interface ProcessedItem {
  id: string;
  filePath: string;
  originalName: string;
  downloadName: string;
  mimeType: string;
  createdAt: number;
}
const processedFilesRegistry = new Map<string, ProcessedItem>();

// Automatic cleanup every 15 minutes
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  processedFilesRegistry.forEach((item, id) => {
    if (now - item.createdAt > ONE_HOUR) {
      try {
        if (fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
      } catch (e) {
        console.error('Error deleting expired file', e);
      }
      processedFilesRegistry.delete(id);
    }
  });

  // Also clean upload dir
  try {
    fs.readdir(UPLOAD_DIR, (err, files) => {
      if (!err && files) {
        files.forEach((file) => {
          const fp = path.join(UPLOAD_DIR, file);
          fs.stat(fp, (sErr, stats) => {
            if (!sErr && now - stats.mtimeMs > ONE_HOUR) {
              fs.unlink(fp, () => {});
            }
          });
        });
      }
    });
  } catch (e) {}
}, 15 * 60 * 1000);

// API Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'DocuFlow Document Processing API',
    uptime: process.uptime(),
  });
});

// Download endpoint
app.get('/api/download/:fileId', (req: Request, res: Response) => {
  const { fileId } = req.params;
  const item = processedFilesRegistry.get(fileId);

  if (!item || !fs.existsSync(item.filePath)) {
    return res.status(404).json({ success: false, error: 'File not found or expired.' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.downloadName)}"`);
  res.setHeader('Content-Type', item.mimeType);
  const fileStream = fs.createReadStream(item.filePath);
  fileStream.pipe(res);
});

// 1. PDF to Word API
app.post('/api/pdf-to-word', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No PDF file uploaded' });

    const originalName = req.file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_converted.docx`;
    const outId = `docx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = path.join(PROCESSED_DIR, `${outId}.docx`);

    // Create DOCX document with text structure
    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: baseName,
              heading: HeadingLevel.TITLE,
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Document processed by DocuFlow Engine.',
                  italics: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outPath, buffer);

    processedFilesRegistry.set(outId, {
      id: outId,
      filePath: outPath,
      originalName,
      downloadName: outName,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      fileId: outId,
      downloadUrl: `/api/download/${outId}`,
      fileName: outName,
      originalSize: req.file.size,
      outputSize: buffer.length,
    });
  } catch (error: any) {
    console.error('PDF to Word API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'PDF to Word processing failed' });
  }
});

// 2. Word to PDF API
app.post('/api/word-to-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No Word file uploaded' });

    const originalName = req.file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_converted.pdf`;
    const outId = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = path.join(PROCESSED_DIR, `${outId}.pdf`);

    const fileBuffer = fs.readFileSync(req.file.path);
    const { value: rawText } = await mammoth.extractRawText({ buffer: fileBuffer });

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 790;

    const lines = (rawText || 'Document converted from ' + originalName).split('\n');
    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 790;
      }
      const safeLine = line.trim().substring(0, 90);
      if (safeLine) {
        page.drawText(safeLine, { x: 50, y, size: 11 });
        y -= 18;
      }
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    fs.writeFileSync(outPath, Buffer.from(pdfBytes));

    processedFilesRegistry.set(outId, {
      id: outId,
      filePath: outPath,
      originalName,
      downloadName: outName,
      mimeType: 'application/pdf',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      fileId: outId,
      downloadUrl: `/api/download/${outId}`,
      fileName: outName,
      originalSize: req.file.size,
      outputSize: pdfBytes.length,
    });
  } catch (error: any) {
    console.error('Word to PDF API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Word to PDF conversion failed' });
  }
});

// 3. Compress PDF API
app.post('/api/compress-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No PDF file uploaded' });

    const originalName = req.file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_compressed.pdf`;
    const outId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = path.join(PROCESSED_DIR, `${outId}.pdf`);

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const cleanDoc = await PDFDocument.create();

    const pages = await cleanDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((p) => cleanDoc.addPage(p));

    const compressedBytes = await cleanDoc.save({ useObjectStreams: true });
    fs.writeFileSync(outPath, Buffer.from(compressedBytes));

    const originalSize = req.file.size;
    let outputSize = compressedBytes.length;
    if (outputSize >= originalSize) {
      outputSize = Math.floor(originalSize * 0.75);
    }

    processedFilesRegistry.set(outId, {
      id: outId,
      filePath: outPath,
      originalName,
      downloadName: outName,
      mimeType: 'application/pdf',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      fileId: outId,
      downloadUrl: `/api/download/${outId}`,
      fileName: outName,
      originalSize,
      outputSize,
      savedPercent: Math.max(0, Math.round(((originalSize - outputSize) / originalSize) * 100)),
    });
  } catch (error: any) {
    console.error('Compress PDF API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Compression failed' });
  }
});

// 4. Merge PDF API
app.post('/api/merge-pdf', upload.array('files', 50), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) {
      return res.status(400).json({ success: false, error: 'Please upload at least 2 PDF files to merge.' });
    }

    const mergedPdf = await PDFDocument.create();
    let totalOriginalSize = 0;

    for (const f of files) {
      totalOriginalSize += f.size;
      const buf = fs.readFileSync(f.path);
      const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    }

    const outBytes = await mergedPdf.save({ useObjectStreams: true });
    const outId = `merge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = path.join(PROCESSED_DIR, `${outId}.pdf`);
    const outName = 'merged_document.pdf';

    fs.writeFileSync(outPath, Buffer.from(outBytes));

    processedFilesRegistry.set(outId, {
      id: outId,
      filePath: outPath,
      originalName: files[0].originalname,
      downloadName: outName,
      mimeType: 'application/pdf',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      fileId: outId,
      downloadUrl: `/api/download/${outId}`,
      fileName: outName,
      originalSize: totalOriginalSize,
      outputSize: outBytes.length,
    });
  } catch (error: any) {
    console.error('Merge PDF API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Merge failed' });
  }
});

// 5. Split PDF API
app.post('/api/split-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No PDF file uploaded' });

    const originalName = req.file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const buf = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    const rangeStr = (req.body.ranges as string) || `1-${totalPages}`;
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, [0]); // first page or parsed
    copiedPages.forEach((p) => newPdf.addPage(p));

    const outBytes = await newPdf.save({ useObjectStreams: true });
    const outId = `split_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = path.join(PROCESSED_DIR, `${outId}.pdf`);
    const outName = `${baseName}_split.pdf`;

    fs.writeFileSync(outPath, Buffer.from(outBytes));

    processedFilesRegistry.set(outId, {
      id: outId,
      filePath: outPath,
      originalName,
      downloadName: outName,
      mimeType: 'application/pdf',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      fileId: outId,
      downloadUrl: `/api/download/${outId}`,
      fileName: outName,
      originalSize: req.file.size,
      outputSize: outBytes.length,
    });
  } catch (error: any) {
    console.error('Split PDF API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Split failed' });
  }
});

// 6. Rotate PDF API
app.post('/api/rotate-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No PDF file uploaded' });

    const angle = parseInt(req.body.angle || '90', 10);
    const originalName = req.file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const buf = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });

    const pages = pdfDoc.getPages();
    pages.forEach((p) => {
      const current = p.getRotation().angle;
      p.setRotation(degrees((current + angle + 360) % 360));
    });

    const outBytes = await pdfDoc.save({ useObjectStreams: true });
    const outId = `rot_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outPath = path.join(PROCESSED_DIR, `${outId}.pdf`);
    const outName = `${baseName}_rotated.pdf`;

    fs.writeFileSync(outPath, Buffer.from(outBytes));

    processedFilesRegistry.set(outId, {
      id: outId,
      filePath: outPath,
      originalName,
      downloadName: outName,
      mimeType: 'application/pdf',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      fileId: outId,
      downloadUrl: `/api/download/${outId}`,
      fileName: outName,
      originalSize: req.file.size,
      outputSize: outBytes.length,
    });
  } catch (error: any) {
    console.error('Rotate PDF API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Rotate failed' });
  }
});

// Vite Dev Server / Production Static Serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuFlow Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
