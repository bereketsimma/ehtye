import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Sessions() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState([])
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ student: '', subject: '', scheduled_at: '' })
  const [error, setError] = useState('')

  const fetchLessons = async () => {
    try {
      const res = await api.get('/lessons/')
      setLessons(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/')
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchLessons(); if (user?.role === 'tutor') fetchStudents() }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/lessons/', {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      })
      setForm({ student: '', subject: '', scheduled_at: '' })
      setShowForm(false)
      fetchLessons()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(', ') : 'Failed to create session')
    }
  }

  const handleStart = async (id) => {
    try {
      await api.post(`/lessons/${id}/start/`)
      fetchLessons()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start')
    }
  }

  const handleEnd = async (id) => {
    try {
      await api.post(`/lessons/${id}/end/`)
      fetchLessons()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to end')
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this session?')) return
    try {
      await api.post(`/lessons/${id}/cancel/`)
      fetchLessons()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Sessions</h1>
          <p>{user?.role === 'tutor' ? 'Manage your tutoring sessions' : 'Your children\'s sessions'}</p>
        </div>
        {user?.role === 'tutor' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Session'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'tutor' && (
        <div className="card">
          <h3>Create Session</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate} style={{ maxWidth: 500 }}>
            <div className="form-group">
              <label>Student</label>
              <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Scheduled Date & Time</label>
              <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} required />
            </div>
            <button className="btn btn-success">Create Session</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Sessions</h3>
        {lessons.length === 0 ? (
          <p style={{ color: '#78909c' }}>No sessions found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>{user?.role === 'tutor' ? 'Student' : 'Tutor'}</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>{lesson.subject}</td>
                    <td>{user?.role === 'tutor' ? lesson.student_name : lesson.tutor_name}</td>
                    <td>{new Date(lesson.scheduled_at).toLocaleString()}</td>
                    <td><span className={`badge badge-${lesson.status}`}>{lesson.status.replace('_', ' ')}</span></td>
                    <td>
                      {user?.role === 'tutor' && lesson.status === 'scheduled' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleStart(lesson.id)} style={{ marginRight: 6 }}>Start</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(lesson.id)}>Cancel</button>
                        </>
                      )}
                      {user?.role === 'tutor' && lesson.status === 'in_progress' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleEnd(lesson.id)}>End</button>
                      )}
                      {lesson.status === 'completed' && <span style={{ color: '#2e7d32' }}>✓ Done</span>}
                      {lesson.status === 'cancelled' && <span style={{ color: '#c62828' }}>✗ Cancelled</span>}
                      {lesson.status === 'scheduled' && user?.role !== 'tutor' && <span style={{ color: '#e65100' }}>Awaiting tutor</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
