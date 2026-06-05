/**
 * Login.jsx
 * Welcome screen with three flows:
 *   LOGIN       — username + password → OTP → JWT
 *   REGISTER    — username + password + mobile → save to DB → OTP → JWT
 *   FORGOT      — username → OTP → JWT (password reset handled by backend)
 */
import { useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  loginWithPassword,
  register,
  forgotPassword,
  verifyOtpWithContext,
} from '../services/authService'
import OTPInput from '../components/OTPInput'
import CountdownTimer from '../components/CountdownTimer'

const TABS  = { LOGIN: 'LOGIN', REGISTER: 'REGISTER', FORGOT: 'FORGOT' }
const STEPS = { FORM: 'FORM', OTP: 'OTP' }

const COUNTRY_CODES = [
  { code: '+91',  label: '🇮🇳 +91'  },
  { code: '+1',   label: '🇺🇸 +1'   },
  { code: '+44',  label: '🇬🇧 +44'  },
  { code: '+61',  label: '🇦🇺 +61'  },
  { code: '+971', label: '🇦🇪 +971' },
]

export default function Login() {
  const { isAuthenticated, login } = useAuth()

  const [tab,         setTab]         = useState(TABS.LOGIN)
  const [step,        setStep]        = useState(STEPS.FORM)
  const [username,    setUsername]    = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [countryCode, setCountryCode] = useState('+91')
  const [mobile,      setMobile]      = useState('')
  const [otp,         setOtp]         = useState('')
  const [maskedMobile,setMaskedMobile]= useState('')   // returned by backend after login/forgot
  const [timerKey,    setTimerKey]    = useState(0)
  const [canResend,   setCanResend]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const fullMobile = `${countryCode}${mobile}`

  const reset = (newTab) => {
    setTab(newTab)
    setStep(STEPS.FORM)
    setUsername(''); setPassword(''); setMobile(''); setOtp('')
    setError(''); setSuccess(''); setCanResend(false)
  }

  const goToOtp = (masked) => {
    setMaskedMobile(masked || fullMobile)
    setOtp(''); setCanResend(false)
    setTimerKey((k) => k + 1)
    setStep(STEPS.OTP)
  }

  /* ── Submit form (step 1) ── */
  const handleFormSubmit = async () => {
    setError(''); setSuccess(''); setLoading(true)
    try {
      let res
      if (tab === TABS.LOGIN) {
        res = await loginWithPassword(username, password)
      } else if (tab === TABS.REGISTER) {
        res = await register(username, password, fullMobile)
      } else {
        res = await forgotPassword(username)
      }
      if (res.success) {
        setSuccess(res.message || 'OTP sent successfully')
        goToOtp(res.mobileNumber)
      } else {
        setError(res.message || 'Something went wrong')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Verify OTP (step 2) ── */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    setError(''); setSuccess(''); setLoading(true)
    try {
      const mobileForVerify =
        tab === TABS.REGISTER ? fullMobile : maskedMobile
      const res = await verifyOtpWithContext(mobileForVerify, otp, tab.toLowerCase(), username)
      if (res.success) {
        login(res.token, res.user)
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
    handleFormSubmit()
  }

  const handleTimerExpire = useCallback(() => setCanResend(true), [])

  /* ── Form validity ── */
  const isFormValid = () => {
    if (tab === TABS.LOGIN)    return username.trim() && password.length >= 6
    if (tab === TABS.REGISTER) return username.trim() && password.length >= 6 && /^\d{7,15}$/.test(mobile)
    if (tab === TABS.FORGOT)   return username.trim()
    return false
  }

  const tabLabel = { LOGIN: 'Sign In', REGISTER: 'Create Account', FORGOT: 'Forgot Password' }
  const submitLabel = { LOGIN: 'Continue', REGISTER: 'Create Account', FORGOT: 'Send OTP' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left: Lion Image ── */}
      <div className="lion-panel" style={{
        flex: 1,
        backgroundImage: 'url(https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=800&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: 40,
      }}>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: '#ff9900', fontSize: '2rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wildlife of Karnataka</h2>
          <p style={{ color: '#e5e7eb', fontSize: '1.1rem', maxWidth: 320, lineHeight: 1.6, fontStyle: 'italic' }}>
            One State, Many World
          </p>
        </div>
      </div>

      {/* ── Right: Login Card ── */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'linear-gradient(135deg,#232f3e 0%,#37475a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
      }}>
        <div style={{ width: '100%' }}>

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
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>Welcome</h1>
            <p style={{ color: '#ff9900', marginTop: 4, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Karnataka&#39;s Wildlife
            </p>
          </div>

        {/* ── Card ── */}
        <div className="card">

          {/* ── Tab switcher (only on form step) ── */}
          {step === STEPS.FORM && (
            <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1.5px solid var(--border)' }}>
              {Object.values(TABS).map((t) => (
                <button
                  key={t}
                  onClick={() => reset(t)}
                  style={{
                    flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 4px', fontSize: '0.82rem', fontWeight: 600,
                    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                    borderBottom: tab === t ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                    marginBottom: -1.5, transition: 'color 0.2s',
                  }}
                >
                  {tabLabel[t]}
                </button>
              ))}
            </div>
          )}

          {/* ══ STEP 1: Form ══ */}
          {step === STEPS.FORM && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Username */}
              <div className="field">
                <label>User ID</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              {/* Password — not shown for Forgot */}
              {tab !== TABS.FORGOT && (
                <div className="field">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input"
                      placeholder={tab === TABS.REGISTER ? 'Create a password (min 6 chars)' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: 44 }}
                      autoComplete={tab === TABS.REGISTER ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '0.8rem', padding: 0,
                      }}
                    >
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile — only for Register */}
              {tab === TABS.REGISTER && (
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
                      style={{ flex: 1 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Format: {countryCode}XXXXXXXXXX
                  </span>
                </div>
              )}

              {error   && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <button
                className="btn btn-primary btn-full"
                onClick={handleFormSubmit}
                disabled={!isFormValid() || loading}
              >
                {loading ? <><span className="spinner" /> Sending OTP…</> : submitLabel[tab]}
              </button>

              {/* Footer links */}
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {tab === TABS.LOGIN && (
                  <>
                    <button className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '4px 8px' }} onClick={() => reset(TABS.FORGOT)}>
                      Forgot Password?
                    </button>
                    &nbsp;·&nbsp;
                    <button className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '4px 8px' }} onClick={() => reset(TABS.REGISTER)}>
                      Create Account
                    </button>
                  </>
                )}
                {tab === TABS.REGISTER && (
                  <button className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '4px 8px' }} onClick={() => reset(TABS.LOGIN)}>
                    Already have an account? Sign In
                  </button>
                )}
                {tab === TABS.FORGOT && (
                  <button className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '4px 8px' }} onClick={() => reset(TABS.LOGIN)}>
                    Back to Sign In
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 2: OTP Verification ══ */}
          {step === STEPS.OTP && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  {tab === TABS.FORGOT ? 'Reset Password' : tab === TABS.REGISTER ? 'Verify Account' : 'Verify Login'}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  OTP sent to <strong style={{ color: 'var(--text)' }}>{maskedMobile}</strong>
                </p>
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

              {/* Resend */}
              <div style={{ textAlign: 'center', minHeight: 24 }}>
                {canResend ? (
                  <button className="btn btn-outline" onClick={handleResend} disabled={loading}
                    style={{ fontSize: '0.875rem', padding: '8px 20px' }}>
                    Resend OTP
                  </button>
                ) : (
                  <CountdownTimer key={timerKey} seconds={60} onExpire={handleTimerExpire} />
                )}
              </div>

              <button
                className="btn btn-ghost btn-full"
                style={{ fontSize: '0.85rem' }}
                onClick={() => { setStep(STEPS.FORM); setError(''); setSuccess('') }}
              >
                ← Back
              </button>
            </div>
          )}

        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', marginTop: 20 }}>
          Secured by AWS SNS · JWT Authentication
        </p>

        </div>
      </div>
    </div>
  )
}
