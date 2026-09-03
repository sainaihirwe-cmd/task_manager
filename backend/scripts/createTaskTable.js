import fs from 'fs';
import path from 'path';
import pool from '../db.js';

async function run() {
  try {
    const sqlPath = path.resolve('..', 'sql', 'create_task_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Table `task` created (or already existed).');

    // confirm by checking pg_tables
    const res = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='task';");
    if (res.rows.length) console.log('Confirmed: table `task` exists.');
    else console.log('Warning: table `task` not found after creation.');
  } catch (err) {
    console.error('Error creating task table:', err.message || err);
  } finally {
    await pool.end();
  }
}

run();
