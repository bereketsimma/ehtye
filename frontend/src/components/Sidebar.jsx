import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/tutors', label: 'Tutors', icon: '👨‍🏫' },
  { path: '/courses', label: 'Courses', icon: '📚' },
  { path: '/students', label: 'Students', icon: '👩‍🎓' },
  { path: '/sessions', label: 'Sessions', icon: '📅' },
  { path: '/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/payments', label: 'Payments', icon: '💳' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Ehtye</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          {user?.username} ({user?.role})
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </aside>
  )
}
