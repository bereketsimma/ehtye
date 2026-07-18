import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [tutorCourses, setTutorCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const coursesRes = await api.get('/courses/')
        setCourses(coursesRes.data)
        if (user?.role === 'tutor') {
          const tutorRes = await api.get('/tutor/courses/')
          setTutorCourses(tutorRes.data.map(c => c.course_id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user])

  const toggleCourse = async (courseId) => {
    const isAdded = tutorCourses.includes(courseId)
    try {
      if (isAdded) {
        const course = courses.find(c => c.course_id === courseId)
        await api.delete(`/tutor/courses/${course.id}/`)
        setTutorCourses(prev => prev.filter(id => id !== courseId))
      } else {
        await api.post('/tutor/courses/', { course_id: courseId })
        setTutorCourses(prev => [...prev, courseId])
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Courses</h1>
        <p>{user?.role === 'tutor' ? 'Select the courses you teach' : 'Available courses'}</p>
      </div>

      <div className="card">
        <h3>All Courses</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Rate (per hour)</th>
                {user?.role === 'tutor' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td><strong>{course.course_id}</strong></td>
                  <td>{course.course_name}</td>
                  <td>ETB {course.rate}</td>
                  {user?.role === 'tutor' && (
                    <td>
                      <button
                        className={`btn ${tutorCourses.includes(course.course_id) ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => toggleCourse(course.course_id)}
                        style={{ padding: '4px 12px', fontSize: 13 }}
                      >
                        {tutorCourses.includes(course.course_id) ? 'Remove' : 'Add'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
