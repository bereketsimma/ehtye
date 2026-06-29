import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''}`}
          onClick={() => !readonly && onChange(star)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function Reviews() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({})
  const [submitting, setSubmitting] = useState({})

  const fetchData = async () => {
    try {
      const res = await api.get('/lessons/')
      setLessons(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user])

  const completedLessons = lessons.filter(l => l.status === 'completed')
  const hasReview = (lessonId) => lessons.find(l => l.id === lessonId)?.review

  const handleRate = (lessonId, rating) => {
    setReviewForm(prev => ({ ...prev, [lessonId]: { ...prev[lessonId], rating } }))
  }

  const handleComment = (lessonId, comment) => {
    setReviewForm(prev => ({ ...prev, [lessonId]: { ...prev[lessonId], comment } }))
  }

  const handleSubmitReview = async (lessonId) => {
    const form = reviewForm[lessonId]
    if (!form?.rating) return alert('Please select a rating')

    setSubmitting(prev => ({ ...prev, [lessonId]: true }))
    try {
      await api.post(`/lessons/${lessonId}/review/`, {
        rating: form.rating,
        comment: form.comment || '',
      })
      setReviewForm(prev => ({ ...prev, [lessonId]: {} }))
      fetchData()
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.join(', ') || 'Failed to submit review')
    } finally {
      setSubmitting(prev => ({ ...prev, [lessonId]: false }))
    }
  }

  const handleUpdateReview = async (lessonId) => {
    const form = reviewForm[lessonId]
    if (!form?.rating) return alert('Please select a rating')

    setSubmitting(prev => ({ ...prev, [lessonId]: true }))
    try {
      await api.put(`/lessons/${lessonId}/review/`, {
        rating: form.rating,
        comment: form.comment || '',
      })
      setReviewForm(prev => ({ ...prev, [lessonId]: {} }))
      fetchData()
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.join(', ') || 'Failed to update review')
    } finally {
      setSubmitting(prev => ({ ...prev, [lessonId]: false }))
    }
  }

  const loadExistingReview = async (lessonId) => {
    if (reviewForm[lessonId]?.loaded) return
    try {
      const res = await api.get(`/lessons/${lessonId}/review/`)
      if (res.data.rating) {
        setReviewForm(prev => ({
          ...prev,
          [lessonId]: {
            rating: res.data.rating,
            comment: res.data.comment || '',
            loaded: true,
            existingId: res.data.id,
          }
        }))
      }
    } catch (err) {
      // No review yet
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reviews</h1>
        <p>{user?.role === 'parent' ? 'Rate your children\'s tutoring sessions' : 'See your reviews from parents'}</p>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {user?.role === 'parent' && completedLessons.length === 0 && (
            <div className="card">
              <p style={{ color: '#78909c' }}>No completed sessions to review yet.</p>
            </div>
          )}

          {user?.role === 'tutor' && (
            <div className="card">
              <h3>My Reviews</h3>
              {lessons.filter(l => l.review).length === 0 ? (
                <p style={{ color: '#78909c' }}>No reviews yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Lesson</th><th>Student</th><th>Rating</th></tr>
                    </thead>
                    <tbody>
                      {lessons.filter(l => l.review).map((lesson) => (
                        <tr key={lesson.id}>
                          <td>{lesson.subject}</td>
                          <td>{lesson.student_name}</td>
                          <td><StarRating value={lesson.review.rating} readonly /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {user?.role === 'parent' && completedLessons.map((lesson) => (
            <div className="card" key={lesson.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{lesson.subject}</h3>
                  <p style={{ color: '#546e7a', fontSize: 14 }}>
                    Tutor: {lesson.tutor_name} &middot; {new Date(lesson.scheduled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#37474f', marginBottom: 8 }}>
                  Your Rating
                </label>
                <StarRating
                  value={reviewForm[lesson.id]?.rating || 0}
                  onChange={(v) => handleRate(lesson.id, v)}
                />
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Comment (optional)</label>
                <textarea
                  value={reviewForm[lesson.id]?.comment || ''}
                  onChange={(e) => handleComment(lesson.id, e.target.value)}
                  placeholder="How was the session?"
                  style={{ maxWidth: 500 }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleSubmitReview(lesson.id)}
                disabled={submitting[lesson.id]}
              >
                {submitting[lesson.id] ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
