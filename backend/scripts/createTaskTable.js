import fs from 'fs';
import path from 'path';
import pool from '../db.js';

async function run() {
  try {
    const sqlPath = path.resolve(process.cwd(), 'sql', 'create_task_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Table `tasks` created (or already existed).');

    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks';");
    if (res.rows.length) console.log('Confirmed: table `tasks` exists.');
    else console.log('Warning: table `tasks` not found after creation.');
  } catch (err) {
    console.error('Error creating task table:', err.message || err);
  } finally {
    await pool.end();
  }
}

run();
