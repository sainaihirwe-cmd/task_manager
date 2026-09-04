import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:5050/api/tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('low')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

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

  const visible = tasks.filter(t => {
    const s = search.trim().toLowerCase()
    const matchesSearch = !s || (t.title || '').toLowerCase().includes(s)
    const matchesPriority = filterPriority === 'all' || (t.priority || 'low') === filterPriority
    return matchesSearch && matchesPriority
  })

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(task => task.status === 'done').length
  const pendingTasks = totalTasks - doneTasks

  function formatDate(dateString) {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Productivity</p>
          <h1>Task Manager</h1>
        </div>
        <div className="status-pill">{pendingTasks} left to do</div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total tasks</span>
          <strong>{totalTasks}</strong>
        </div>
        <div className="stat-card">
          <span>Completed</span>
          <strong>{doneTasks}</strong>
        </div>
        <div className="stat-card">
          <span>Pending</span>
          <strong>{pendingTasks}</strong>
        </div>
      </section>

      <section className="panel">
        <form id="task-form" onSubmit={handleAdd} className="task-form">
          <div className="field field-title">
            <label>Task title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to be done?" required />
          </div>

          <div className="field field-date">
            <label>Due date</label>
            <input value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date" />
          </div>

          <div className="field field-priority">
            <label>Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="field field-description">
            <label>Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Add more details..."></textarea>
          </div>

          <button type="submit" className="primary-btn">Add Task</button>
        </form>
      </section>

      <section className="panel task-panel">
        <div className="toolbar">
          <div className="search-wrap">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search task titles..." />
          </div>

          <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} className="filter-select">
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div id="tasks" className="task-list">
          {visible.length === 0 ? (
            <div className="empty-state">
              <p>No tasks match your current filter.</p>
            </div>
          ) : (
            visible.map(task => (
              <article key={task.id} className={`task-card ${task.status === 'done' ? 'done' : ''}`}>
                <div className="task-card-header">
                  <h3>{task.title}</h3>
                  <span className={`priority-badge ${task.priority || 'low'}`}>{task.priority || 'low'}</span>
                </div>

                <p className="task-description">{task.description || 'No description added yet.'}</p>

                <div className="task-meta">
                  <span>Due: {formatDate(task.due_date)}</span>
                  <span className={`status-badge ${task.status === 'done' ? 'done' : 'pending'}`}>
                    {task.status === 'done' ? 'Completed' : 'Active'}
                  </span>
                </div>

                <div className="actions">
                  <button type="button" className="btn primary" onClick={()=>toggleStatus(task)}>
                    {task.status === 'done' ? 'Mark Incomplete' : 'Mark Done'}
                  </button>
                  <button type="button" className="btn secondary" onClick={()=>handleEdit(task)}>Edit</button>
                  <button type="button" className="btn danger" onClick={()=>handleDelete(task.id)}>Delete</button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
