/**
 * Login.jsx
 * Step 1 — enter mobile number → click "Send OTP" → backend calls AWS SNS.
 * Step 2 — enter 6-digit OTP   → click "Verify"  → receive JWT → redirect.
 */
import { useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { sendOtp, verifyOtp } from '../services/authService'
import OTPInput from '../components/OTPInput'
import CountdownTimer from '../components/CountdownTimer'

/* Country codes list (extend as needed) */
const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1',  label: '🇺🇸 +1'  },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+971',label: '🇦🇪 +971' },
]

const STEPS = { MOBILE: 'MOBILE', OTP: 'OTP' }

export default function Login() {
  const { isAuthenticated, login } = useAuth()

  const [step,        setStep]        = useState(STEPS.MOBILE)
  const [countryCode, setCountryCode] = useState('+91')
  const [mobile,      setMobile]      = useState('')
  const [otp,         setOtp]         = useState('')
  const [timerKey,    setTimerKey]    = useState(0)   // bump to reset timer
  const [canResend,   setCanResend]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const fullNumber = `${countryCode}${mobile}`

  /* ── Validate mobile ── */
  const isMobileValid = /^\d{7,15}$/.test(mobile)

  /* ── Send OTP ── */
  const handleSendOtp = async () => {
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await sendOtp(fullNumber)
      if (res.success) {
        setSuccess(res.message || 'OTP sent successfully')
        setStep(STEPS.OTP)
        setOtp('')
        setCanResend(false)
        setTimerKey((k) => k + 1)
      } else {
        setError(res.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await verifyOtp(fullNumber, otp)
      if (res.success) {
        login(res.token, res.user)  // saves to sessionStorage & redirects
      } else {
        setError(res.message || 'Invalid OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setCanResend(false)
    handleSendOtp()
  }

  const handleTimerExpire = useCallback(() => setCanResend(true), [])

  return (
    <div className="page-center" style={{ background: 'linear-gradient(135deg,#232f3e 0%,#37475a 100%)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* ── Brand header ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: '#ff9900', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <path d="M8 28c6-4 18-4 24 0M20 8v14M14 16l6-8 6 8" stroke="#232f3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700 }}>Welcome Back</h1>
          <p style={{ color: '#9ca3af', marginTop: 4, fontSize: '0.9rem' }}>
            Secure login via AWS SNS OTP
          </p>
        </div>

        {/* ── Card ── */}
        <div className="card">

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['Mobile', 'Verify OTP'].map((label, i) => {
              const active = (i === 0 && step === STEPS.MOBILE) || (i === 1 && step === STEPS.OTP)
              const done   = i === 0 && step === STEPS.OTP
              return (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: 4, borderRadius: 4,
                    background: active || done ? 'var(--accent)' : 'var(--border)',
                    marginBottom: 6, transition: 'background 0.3s',
                  }}/>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: active || done ? 'var(--accent)' : 'var(--text-muted)',
                  }}>{label}</span>
                </div>
              )
            })}
          </div>

          {/* ── Step 1: Mobile number ── */}
          {step === STEPS.MOBILE && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="field">
                <label>Mobile Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="input"
                    style={{ width: 110, flexShrink: 0 }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="input"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    maxLength={15}
                    onKeyDown={(e) => e.key === 'Enter' && isMobileValid && !loading && handleSendOtp()}
                    style={{ flex: 1 }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Format: {countryCode}XXXXXXXXXX
                </span>
              </div>

              {error   && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <button
                className="btn btn-primary btn-full"
                onClick={handleSendOtp}
                disabled={!isMobileValid || loading}
              >
                {loading ? <><span className="spinner" /> Sending OTP…</> : 'Send OTP via SMS'}
              </button>
            </div>
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === STEPS.OTP && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: '#f9fafb', borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  OTP sent to <strong style={{ color: 'var(--text)' }}>{fullNumber}</strong>
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  onClick={() => { setStep(STEPS.MOBILE); setError(''); setSuccess('') }}
                >
                  Change
                </button>
              </div>

              <div className="field">
                <label>Enter 6-digit OTP</label>
                <OTPInput value={otp} onChange={setOtp} disabled={loading} />
              </div>

              {error   && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <button
                className="btn btn-primary btn-full"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? <><span className="spinner" /> Verifying…</> : 'Verify OTP'}
              </button>

              {/* Resend row */}
              <div style={{ textAlign: 'center', minHeight: 24 }}>
                {canResend ? (
                  <button
                    className="btn btn-outline"
                    onClick={handleResend}
                    disabled={loading}
                    style={{ fontSize: '0.875rem', padding: '8px 20px' }}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <CountdownTimer
                    key={timerKey}
                    seconds={60}
                    onExpire={handleTimerExpire}
                  />
                )}
              </div>
            </div>
          )}

        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', marginTop: 20 }}>
          Secured by AWS SNS · JWT Authentication
        </p>
      </div>
    </div>
  )
}
