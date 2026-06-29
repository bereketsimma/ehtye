import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Tutors() {
  const { user } = useAuth()
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'parent') return
    const fetchTutors = async () => {
      try {
        const lessonsRes = await api.get('/lessons/')
        const tutorIds = [...new Set(lessonsRes.data.map(l => l.tutor))]
        setTutors(lessonsRes.data.filter((l, i, arr) =>
          arr.findIndex(t => t.tutor === l.tutor) === i
        ).map(l => ({ id: l.tutor, name: l.tutor_name })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTutors()
  }, [user])

  return (
    <div>
      <div className="page-header">
        <h1>Tutors</h1>
        <p>{user?.role === 'tutor' ? 'Your tutor profile' : 'Tutors teaching your children'}</p>
      </div>

      {user?.role === 'tutor' ? (
        <div className="card">
          <h3>Your Profile</h3>
          <p style={{ color: '#546e7a' }}>You are registered as a tutor. Manage your lessons from the Sessions page.</p>
        </div>
      ) : (
        <div className="card">
          <h3>Your Tutors</h3>
          {loading ? <p>Loading...</p> : tutors.length === 0 ? (
            <p style={{ color: '#78909c' }}>No tutors assigned yet. Book a session first.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Lessons</th></tr>
                </thead>
                <tbody>
                  {tutors.map((t, i) => (
                    <tr key={i}><td>{t.name}</td><td>—</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
