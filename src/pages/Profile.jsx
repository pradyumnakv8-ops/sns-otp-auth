/**
 * Profile.jsx
 * Displays authenticated user details from the JWT session.
 * Structured to accept future API calls (e.g. GET /api/user/profile).
 */
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function Profile() {
  const { auth } = useAuth()
  const { user } = auth

  const fields = [
    { label: 'User ID',       value: user.id },
    { label: 'Full Name',     value: user.name },
    { label: 'Mobile Number', value: user.mobileNumber },
    { label: 'Role',          value: user.role },
    { label: 'Auth Method',   value: 'OTP via AWS SNS' },
    { label: 'Session Store', value: 'sessionStorage (JWT)' },
  ]

  return (
    <>
      <Navbar />
      <div className="page-content" style={{ maxWidth: 720 }}>

        {/* Avatar block */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#ff9900,#e88b00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{user.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{user.mobileNumber}</p>
            <span className="badge badge-blue" style={{ marginTop: 8 }}>{user.role}</span>
          </div>
        </div>

        {/* Detail fields */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Account Details</h2>
          <div className="info-grid">
            {fields.map(({ label, value }) => (
              <div key={label} className="info-item">
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Profile editing via API — ready for future integration
        </p>
      </div>
    </>
  )
}
