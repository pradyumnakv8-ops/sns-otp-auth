import { useState, useEffect } from 'react'

/**
 * Counts down from `seconds` to 0.
 * Calls onExpire when done. Resets when the `key` prop changes.
 */
export default function CountdownTimer({ seconds = 60, onExpire }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    if (seconds === 0) return
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) { clearInterval(id); onExpire?.(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [seconds, onExpire])

  if (remaining === 0) return null

  return (
    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
      Resend OTP in <strong style={{ color: 'var(--accent)' }}>{remaining}s</strong>
    </span>
  )
}
