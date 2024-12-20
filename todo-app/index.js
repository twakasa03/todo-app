require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// CORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://todo-app-twakasa03.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// デルスチェックエンドポイント
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// タスク一覧取得
app.get('/tasks', async (req, res) => {
  try {
    const { status, sort, search, category } = req.query;
    let query = 'SELECT * FROM tasks';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('completed = $' + (params.length + 1));
      params.push(status === 'completed');
    }

    if (category) {
      conditions.push('category = $' + (params.length + 1));
      params.push(category);
    }

    if (search) {
      conditions.push('title ILIKE $' + (params.length + 1));
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (sort) {
      const [field, direction] = sort.split(':');
      if (field === 'position') {
        query += ' ORDER BY position';
      } else {
        query += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
      }
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 新規タスク作成
app.post('/tasks', async (req, res) => {
  try {
    const { title, due_date, priority, category, tags, total_steps, group_id } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, due_date, priority, category, tags, total_steps, group_id, completed, progress) VALUES ($1, $2, $3, $4, $5, $6, $7, false, 0) RETURNING *',
      [title, due_date, priority, category, tags, total_steps, group_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// タスク更新
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// タスク削除
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// タスク進捗更新
app.patch('/tasks/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET progress = $1 WHERE id = $2 RETURNING *',
      [progress, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});