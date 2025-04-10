const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// API Route
app.post('/api/users', (req, res) => {
  const { name, email, phone, location, photo } = req.body;
  const sql = 'INSERT INTO users (name, email, phone, location, photo) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phone, location, photo], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'User stored successfully' });
  });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
