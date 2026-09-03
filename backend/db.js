import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
dotenv.config();

// create a new pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER, // db user
  host: process.env.DB_HOST, // db host
  database: process.env.DB_NAME, // database name
  password: process.env.DB_PASSWORD, // db password
  port: Number(process.env.DB_PORT) || 5432 // db port
});

export default pool; // export the pool for use in controllers
