import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:5050/api/tasks'

// Simple Task Manager App (React)
export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('low')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

  // load tasks from API
  async function load() {
    try {
      const res = await fetch(API_BASE)
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Unable to load tasks')
      }
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      console.error('Load tasks failed:', err)
      alert('Could not load tasks from the database.')
    }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return alert('Title required')

    try {
      const res = await fetch(API_BASE, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate || null, priority })
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Create task failed')
      }
      setTitle(''); setDescription(''); setDueDate(''); setPriority('low')
      load()
    } catch (err) {
      console.error('Add task failed:', err)
      alert('Could not save the task to the database.')
    }
  }

  // toggle completion status between 'done' and 'pending'
  async function toggleStatus(task) {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    try {
      const res = await fetch(`${API_BASE}/${task.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Status update failed')
      }
      load()
    } catch (err) {
      console.error('Toggle status failed:', err)
      alert('Could not update the task status.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Delete task failed')
      }
      load()
    } catch (err) {
      console.error('Delete task failed:', err)
      alert('Could not delete the task.')
    }
  }

  async function handleEdit(task) {
    const newTitle = prompt('Title', task.title)
    if (newTitle === null) return
    const newDesc = prompt('Description', task.description || '')
    if (newDesc === null) return
    const newPriority = prompt('Priority (low,medium,high)', task.priority || 'low')
    if (newPriority === null) return

    try {
      const res = await fetch(`${API_BASE}/${task.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, priority: newPriority })
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Edit task failed')
      }
      load()
    } catch (err) {
      console.error('Edit task failed:', err)
      alert('Could not update the task.')
    }
  }

  // apply search and filters
  const visible = tasks.filter(t => {
    const s = search.trim().toLowerCase()
    const matchesSearch = !s || (t.title || '').toLowerCase().includes(s)
    const matchesPriority = filterPriority === 'all' || (t.priority || 'low') === filterPriority
    return matchesSearch && matchesPriority
  })

  return (
    <div className="container">
      <h1>Task Manager</h1>
      <form id="task-form" onSubmit={handleAdd}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
        <input value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date" />
        <select value={priority} onChange={e=>setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description"></textarea>
        <button type="submit">Add Task</button>
      </form>

      <div className="search-row">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title..." />
        <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div id="tasks">
        {visible.map(task=> (
          <div key={task.id} className={`task ${task.status==='done'?'done':''}`}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="meta">Due: {task.due_date||'—'} • Priority: {task.priority||'low'}</div>
            <div className="actions">
              <button type="button" className="btn" onClick={()=>toggleStatus(task)}>{task.status==='done'?'Mark Incomplete':'Mark Done'}</button>
              <button type="button" className="btn" onClick={()=>handleEdit(task)}>Edit</button>
              <button type="button" className="btn danger" onClick={()=>handleDelete(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
