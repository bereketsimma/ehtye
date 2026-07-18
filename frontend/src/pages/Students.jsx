import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Students() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '' })
  const [error, setError] = useState('')

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/')
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchStudents() }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/students/', form)
      setForm({ first_name: '', last_name: '' })
      setShowForm(false)
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add student')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Students</h1>
          <p>{user?.role === 'parent' ? 'Your children' : 'Students you teach'}</p>
        </div>
        {user?.role === 'parent' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h3>Add Student</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
              </div>
            </div>
            <button className="btn btn-success">Save</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>{user?.role === 'parent' ? 'Your Children' : 'Your Students'}</h3>
        {students.length === 0 ? (
          <p style={{ color: '#78909c' }}>
            {user?.role === 'parent' ? 'No children added yet.' : 'No students yet.'}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.first_name} {s.last_name}</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
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
