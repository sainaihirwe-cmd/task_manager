# Task Manager (Postgres + Express + Vanilla Frontend)

Quick start

1. Create the database in pgAdmin or psql named `taskmanager_db` (or change name in `.env`).
2. Run the SQL in `sql/create_table.sql` to create the table and insert sample rows.
3. Backend: open `backend` and create a `.env` file (copy `.env.example`).
4. Install and run backend:

```bash
cd backend
npm install
npm run dev
```

5. Open `frontend/index.html` in the browser (or serve the folder with a static server).

Notes
- API runs on port `5000` by default.
- Fill DB credentials in `backend/.env` before starting backend.
