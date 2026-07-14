const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage instead of diskStorage to validate magic bytes before writing to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const validateAndSave = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Dynamic import for file-type (since newer versions are pure ESM)
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(req.file.buffer);

    // doc/docx might sometimes fail simple magic byte checks depending on the library version,
    // but file-type usually handles docx (zip based) well.
    const allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];

    if (!type || !allowedTypes.includes(type.ext)) {
      return res.status(400).json({ message: 'Invalid file content. Only JPG, PNG, WEBP, PDF, and DOC/DOCX are allowed.' });
    }

    // Generate random filename + validated server-determined extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '.' + type.ext;
    const filepath = path.join(uploadDir, filename);

    // Save to disk
    fs.writeFileSync(filepath, req.file.buffer);

    // Update req.file properties to mimic diskStorage so subsequent code works transparently
    req.file.filename = filename;
    req.file.path = filepath;
    req.file.mimetype = type.mime; // replace potentially spoofed mimetype with actual detected one

    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({ message: 'Error processing file upload' });
  }
};

const uploadDoc = {
  single: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large (max 10MB)' });
          }
          return next(err);
        }
        validateAndSave(req, res, next);
      });
    };
  }
};

module.exports = uploadDoc;
