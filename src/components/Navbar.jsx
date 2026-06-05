import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AWS_ICON = (
  <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect width="40" height="40" rx="8" fill="#FF9900"/>
    <path d="M12 26l4-12 4 12m-7-3h6M28 14v12M24 14h6" stroke="#232F3E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Navbar() {
  const { logout, auth } = useAuth()

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        {AWS_ICON}
        SNS Auth
      </NavLink>

      <div className="navbar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Profile
        </NavLink>
        <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: 8 }}>
          {auth?.user?.name}
        </span>
        <button className="btn btn-ghost" onClick={logout} style={{ marginLeft: 4 }}>
          Logout
        </button>
      </div>
    </nav>
  )
}
