
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/env.js';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure directory exists
        const dir = 'public/images/company';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: company-[timestamp].[ext]
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'company-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (Images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

// Upload Controller
export const uploadCompanyLogo = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Construct public URL
        let fileUrl;
        
        const host = req.get('host');
        
        // Priority 1: If access is via localhost, ALWAYS use dynamic URL (handles local dev with prod env var)
        if (host && host.includes('localhost')) {
            const protocol = req.protocol;
            fileUrl = `${protocol}://${host}/api/public/images/company/${req.file.filename}`;
        } 
        // Priority 2: Production Config
        else if (config.env === 'production' && config.serverUrl) {
            fileUrl = `${config.serverUrl}/api/public/images/company/${req.file.filename}`;
        } 
        // Priority 3: Default/Fallback
        else {
            const protocol = req.protocol;
            fileUrl = `${protocol}://${host}/api/public/images/company/${req.file.filename}`;
        }

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadMiddleware = upload.single('file'); // 'file' is the field name
