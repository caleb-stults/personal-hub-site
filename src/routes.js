const express = require('express');
const db = require('./db');
const renderDashboard = require('./views/dashboard');

const router = express.Router();

// HTML Dashboard Route
router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Database error loading tasks.');
    }
    res.send(renderDashboard(rows));
  });
});

// REST API Endpoints
router.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/api/tasks', (req, res) => {
  const { title, status, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  db.run(`INSERT INTO tasks (title, status, content) VALUES (?, ?, ?)`, [title, status || 'todo', content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, status: status || 'todo', content });
  });
});

router.put('/api/tasks/:id', (req, res) => {
  const { title, status, content } = req.body;
  const taskId = req.params.id;

  db.get(`SELECT * FROM tasks WHERE id = ?`, [taskId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Task not found' });

    const updatedTitle = title !== undefined ? title : row.title;
    const updatedStatus = status !== undefined ? status : row.status;
    const updatedContent = content !== undefined ? content : row.content;

    db.run(
      `UPDATE tasks SET title = ?, status = ?, content = ? WHERE id = ?`,
      [updatedTitle, updatedStatus, updatedContent, taskId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
      }
    );
  });
});

router.delete('/api/tasks/:id', (req, res) => {
  db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  db.get('SELECT 1', (err) => {
    if (err) {
      res.status(500).json({ status: 'unhealthy', error: err.message });
    } else {
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    }
  });
});

module.exports = router;