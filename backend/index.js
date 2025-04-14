const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files (for downloading resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Apple1234@', // your MySQL password
  database: 'userdb'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected');
});

// Resume Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
  }
});

// Route: Store users
app.post('/api/users', (req, res) => {
  const { name, email, phone, location, photo } = req.body;
  const sql = 'INSERT INTO users (name, email, phone, location, photo) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phone, location, photo], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'User stored successfully', userId: result.insertId });
  });
});

// ✅ Route: Upload Resume (return relative path!)
app.post('/users/:id/upload-resume', upload.single('resume'), (req, res) => {
  const userId = req.params.id;
  const filename = req.file.filename;
  const filePath = `uploads/${filename}`; // return relative path
  const uploadedAt = new Date();

  const sql = 'INSERT INTO resumes (user_id, file_path, uploaded_at) VALUES (?, ?, ?)';
  db.query(sql, [userId, filePath, uploadedAt], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Resume uploaded successfully', file_path: filePath, uploaded_at: uploadedAt });
  });
});

// Route: Get all resumes (Admin)
app.get('/resumes', (req, res) => {
  const sql = `
    SELECT resumes.id, users.name, users.email, resumes.file_path, resumes.uploaded_at
    FROM resumes
    JOIN users ON resumes.user_id = users.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// Route: Download resume by ID
app.get('/resumes/:id/download', (req, res) => {
  const resumeId = req.params.id;
  const sql = 'SELECT file_path FROM resumes WHERE id = ?';

  db.query(sql, [resumeId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send({ message: 'Resume not found' });

    const filePath = path.join(__dirname, results[0].file_path);
    res.download(filePath);
  });
});

// Route: Get resume for a specific user
app.get('/users/:id/resume', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT file_path, uploaded_at FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1';

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send({ message: 'No resume found for this user' });

    res.send(results[0]); // file_path here will be like "uploads/resume-xxxx.pdf"
  });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
// Route: Get user by ID
// Route: Get all users (Admin)
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

