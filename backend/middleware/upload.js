import multer from 'multer';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB (Vercel body limit se neeche)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Sirf image file allowed hai'));
  },
});

// Multer ke errors ko clean JSON message mein badalta hai
export const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Image 4MB se chhoti honi chahiye' : err.message;
    res.status(400).json({ success: false, message });
  });
};