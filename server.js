const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Set the storage destination and filename for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        
        // Ensure the 'uploads' directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Correct path to uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Keep the original file name
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: function (req, file, cb) {
        // Accept only PDF files
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'));
        }
        cb(null, true);
    }
}).single('file');

// Handle file upload via POST request
app.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).send({ message: `Multer error: ${err.message}` });
        } else if (err) {
            return res.status(500).send({ message: `File upload failed: ${err.message}` });
        }

        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded!' });
        }

        res.send({ message: 'File uploaded successfully!', filename: req.file.filename });
    });
});

// Endpoint to get the list of uploaded documents
app.get('/documents', (req, res) => {
    const uploadPath = path.join(__dirname, 'uploads');
    
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Unable to scan directory' });
        }
        res.send(files);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});