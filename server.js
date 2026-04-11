const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new Database('awcfis.db');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// --- Database Initialization ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    maxScore INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER,
    inspector_id INTEGER,
    overall_comment TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_virtual INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS report_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    item_id INTEGER,
    score INTEGER,
    status TEXT,
    comment TEXT,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );
`);

// Insert default admin if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)')
    .run('admin', 'admin123', '최고관리자', 'ADMIN');
}

// --- API Endpoints ---

// Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } else {
    res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
  }
});

// Users
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, username, name, role FROM users').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { username, password, name, role } = req.body;
  try {
    const info = db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)').run(username, password, name, role);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ success: false, message: '중복된 아이디이거나 오류가 발생했습니다.' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Items
app.get('/api/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items').all();
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const { category, title, description, maxScore } = req.body;
  const info = db.prepare('INSERT INTO items (category, title, description, maxScore) VALUES (?, ?, ?, ?)').run(category, title, description, maxScore);
  res.json({ success: true, id: info.lastInsertRowid });
});

app.delete('/api/items/:id', (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Reports
app.get('/api/reports', (req, res) => {
  const reports = db.prepare(`
    SELECT r.*, u.name as farm_name 
    FROM reports r 
    LEFT JOIN users u ON r.farm_id = u.id 
    WHERE r.is_virtual = 0
    ORDER BY r.date DESC
  `).all();
  
  reports.forEach(r => {
    r.results = db.prepare('SELECT * FROM report_results WHERE report_id = ?').all(r.id);
  });
  
  res.json(reports);
});

app.post('/api/reports', (req, res) => {
  const { farm_id, inspector_id, overall_comment, results, is_virtual } = req.body;
  const insertReport = db.prepare('INSERT INTO reports (farm_id, inspector_id, overall_comment, is_virtual) VALUES (?, ?, ?, ?)');
  const insertResult = db.prepare('INSERT INTO report_results (report_id, item_id, score, status, comment) VALUES (?, ?, ?, ?, ?)');

  const transaction = db.transaction((data) => {
    const info = insertReport.run(data.farm_id, data.inspector_id, data.overall_comment, data.is_virtual ? 1 : 0);
    const reportId = info.lastInsertRowid;
    for (const res of data.results) {
      insertResult.run(reportId, res.itemId, res.score, res.status || '', res.comment || '');
    }
    return reportId;
  });

  const reportId = transaction({ farm_id, inspector_id, overall_comment, results, is_virtual });
  res.json({ success: true, id: reportId });
});

// For Farm Owner Virtual Scoring History
app.get('/api/reports/virtual/:userId', (req, res) => {
  const reports = db.prepare('SELECT * FROM reports WHERE farm_id = ? AND is_virtual = 1 ORDER BY date DESC').all(req.params.userId);
  reports.forEach(r => {
    r.results = db.prepare('SELECT * FROM report_results WHERE report_id = ?').all(r.id);
  });
  res.json(reports);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AWCFIS Server running at http://0.0.0.0:${port}`);
});
