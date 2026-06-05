import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { auth } = useAuth()
  const { user, token } = auth
  const loginTime = new Date().toLocaleString()

  return (
    <>
      <Navbar />
      <div className="page-content">

        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg,#232f3e,#37475a)',
          borderRadius: 'var(--radius)',
          padding: '28px 32px',
          color: '#fff',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: 4 }}>Welcome back,</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{user.name}</h1>
            <p style={{ color: '#9ca3af', marginTop: 6, fontSize: '0.9rem' }}>
              {user.mobileNumber}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
              ✓ JWT Authenticated
            </span>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 8 }}>
              Session started<br />{loginTime}
            </p>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          <StatCard label="User ID"       value={user.id}           icon="🆔" />
          <StatCard label="Role"          value={user.role}         icon="🔐" />
          <StatCard label="Mobile Number" value={user.mobileNumber} icon="📱" />
          <StatCard label="Auth Method"   value="OTP via AWS SNS"   icon="📨" />
        </div>

        {/* Token preview */}
        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            🔑 JWT Token
          </h2>
          <code style={{
            display: 'block',
            background: '#f3f4f6',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: '0.8rem',
            wordBreak: 'break-all',
            color: '#374151',
            lineHeight: 1.6,
          }}>
            {token}
          </code>
          <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Token is stored in <code>sessionStorage</code> and expires with the browser session.
          </p>
        </div>

      </div>
    </>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: '#fff7ed', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>{value}</p>
      </div>
    </div>
  )
}
