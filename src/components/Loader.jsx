/** Full-screen loading overlay */
export default function Loader({ text = 'Loading…' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(255,255,255,0.75)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, gap: 12,
    }}>
      <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 4 }} />
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{text}</p>
    </div>
  )
}
