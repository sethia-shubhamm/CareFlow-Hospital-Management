import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use /tmp for Vercel serverless compatibility, or ./uploads for local development
const uploadDir = process.env.VERCEL ? '/tmp' : './uploads';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create directory only when needed (lazy creation)
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
            } catch (error) {
                console.error('Failed to create upload directory:', error);
            }
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, and PNG image files are allowed!'));
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

export default upload;
