import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generatePageObject } from './generator';

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Setup multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '..', '.temp'),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// In-memory store for generated files (short-lived)
const generatedFiles = new Map<string, { code: string; className: string; timestamp: number }>();

// API endpoint for generating Page Object
app.post('/api/generate', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let htmlContent = '';

    if (req.file) {
      // File upload
      htmlContent = fs.readFileSync(req.file.path, 'utf-8');
      // Clean up temp file
      fs.unlinkSync(req.file.path);
    } else if (req.body.html) {
      // Inline HTML
      htmlContent = req.body.html;
    } else {
      return res.status(400).json({ error: 'No HTML content provided' });
    }

    const language = req.body.language || 'typescript';
    const className = req.body.className || undefined;
    const includeSampleTest = req.body.includeSampleTest === 'true' || req.body.includeSampleTest === true;

    // Generate Page Object
    const result = generatePageObject(htmlContent, {
      language: language as 'typescript' | 'javascript' | 'python' | 'java',
      className,
      includeSampleTest,
    });

    // Store generated file with unique ID for download
    const fileId = generateId();
    generatedFiles.set(fileId, {
      code: result.code,
      className: result.className,
      timestamp: Date.now(),
    });

    // Clean up old files (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, data] of generatedFiles.entries()) {
      if (data.timestamp < oneHourAgo) {
        generatedFiles.delete(id);
      }
    }

    res.json({
      code: result.code,
      className: result.className,
      extractedElements: result.extractedElements,
      warnings: result.warnings,
      downloadId: fileId,
    });
  } catch (error) {
    console.error('Error generating Page Object:', error);
    res.status(500).json({
      error: 'Failed to generate Page Object',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API endpoint for downloading generated file
app.get('/api/download/:id', (req: Request, res: Response) => {
  const fileData = generatedFiles.get(req.params.id);

  if (!fileData) {
    return res.status(404).json({ error: 'File not found or expired' });
  }

  const filename = `${fileData.className}.ts`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(fileData.code);

  // Clean up after download
  generatedFiles.delete(req.params.id);
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Start server
app.listen(PORT, () => {
  console.log(`Page Object Generator is running at http://localhost:${PORT}/`);
});
