import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
dotenv.config();

const app = express(); // create express app
app.use(cors()); // enable CORS for all origins
app.use(express.json()); // parse JSON bodies

// health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// tasks API
app.use('/api/tasks', taskRoutes);

// start server with graceful fallback if port is in use
const DEFAULT_PORT = Number(process.env.PORT) || 5000; // preferred port

function startServer(port) {
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const alt = port === 5000 ? 5050 : port + 1; // choose an alternate port
      // eslint-disable-next-line no-console
      console.warn(`Port ${port} in use, trying ${alt}...`);
      setTimeout(() => startServer(alt), 200);
    } else {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
