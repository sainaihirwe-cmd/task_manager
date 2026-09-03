import pool from '../db.js';

// get all tasks
export async function getTasks(req, res) {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    return res.json(result.rows); // send rows back
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// create a new task
export async function createTask(req, res) {
  try {
    const { title, description, due_date, status, priority } = req.body; // read body
    const result = await pool.query(
      'INSERT INTO tasks (title, description, due_date, status, priority) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, description, due_date, status || 'pending', priority || 'low']
    );
    return res.status(201).json(result.rows[0]); // return created task
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// update a task (partial or full)
export async function updateTask(req, res) {
  try {
    const { id } = req.params; // task id
    const { title, description, due_date, status, priority } = req.body; // fields to update
    const result = await pool.query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         due_date = COALESCE($3, due_date),
         status = COALESCE($4, status),
         priority = COALESCE($5, priority),
         updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, description, due_date, status, priority, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// delete a task
export async function deleteTask(req, res) {
  try {
    const { id } = req.params; // task id
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
