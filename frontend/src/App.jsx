import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tutors from './pages/Tutors'
import Courses from './pages/Courses'
import Students from './pages/Students'
import Sessions from './pages/Sessions'
import Reviews from './pages/Reviews'
import Payments from './pages/Payments'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tutors" element={<Tutors />} />
          <Route path="courses" element={<Courses />} />
          <Route path="students" element={<Students />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
