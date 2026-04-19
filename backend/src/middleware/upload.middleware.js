const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { ApiError } = require('../utils/api-error');

const uploadsDir = path.resolve(process.cwd(), 'backend', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.xlsx', '.xls'];
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(extension)) {
    cb(new ApiError(400, 'Only .xlsx and .xls files are allowed.'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { upload };
