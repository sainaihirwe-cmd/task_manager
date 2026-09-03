import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
const router = express.Router();

// GET /api/tasks - list tasks
router.get('/', getTasks);

// POST /api/tasks - create task
router.post('/', createTask);

// PUT/PATCH /api/tasks/:id - update task
router.put('/:id', updateTask);
router.patch('/:id', updateTask);

// DELETE /api/tasks/:id - delete task
router.delete('/:id', deleteTask);

export default router; // export the router
