import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ lessons: 0, students: 0, reviews: 0 })
  const [recentLessons, setRecentLessons] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, studentsRes, reviewsRes] = await Promise.allSettled([
          api.get('/lessons/'),
          api.get('/students/'),
          api.get('/lessons/'),
        ])
        const lessons = lessonsRes.value?.data || []
        const students = studentsRes.value?.data || []
        const allReviews = lessons.filter(l => l.review)

        setStats({
          lessons: lessons.length,
          students: user?.role === 'tutor'
            ? new Set(lessons.map(l => l.student)).size
            : students.length,
          reviews: allReviews.length,
        })
        setRecentLessons(lessons.slice(-5).reverse())
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
    }
    fetchData()
  }, [user])

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.username}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.lessons}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
          <div className="stat-icon">
            {user?.role === 'tutor' ? '👨‍🏫' : '👩‍🎓'}
          </div>
          <div className="stat-value">{stats.students}</div>
          <div className="stat-label">{user?.role === 'tutor' ? 'Students Taught' : 'My Children'}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ffc107' }}>
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.reviews}</div>
          <div className="stat-label">Reviews</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#7b1fa2' }}>
          <div className="stat-icon">💳</div>
          <div className="stat-value">—</div>
          <div className="stat-label">Payments</div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Sessions</h3>
        {recentLessons.length === 0 ? (
          <p style={{ color: '#78909c' }}>No sessions yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Student / Tutor</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>{lesson.subject}</td>
                    <td>{user?.role === 'tutor' ? lesson.student_name : lesson.tutor_name}</td>
                    <td><span className={`badge badge-${lesson.status}`}>{lesson.status.replace('_', ' ')}</span></td>
                    <td>{new Date(lesson.scheduled_at).toLocaleDateString()}</td>
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
