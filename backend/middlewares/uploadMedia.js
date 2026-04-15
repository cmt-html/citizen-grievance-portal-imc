const multer = require('multer');

// Use memory storage - works reliably on Vercel serverless (no ephemeral disk dependency)
// Files will be in req.files[fieldname][0].buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept image and video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only images and videos are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB limit (Vercel serverless memory constraint)
    }
});

module.exports = upload;
