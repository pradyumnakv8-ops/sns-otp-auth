/**
 * AuthContext.jsx
 * Provides authentication state and helpers to the entire app.
 * Token and user are persisted in sessionStorage so a page refresh
 * keeps the session alive (tab-scoped — closes with the tab).
 */
import { createContext, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [auth, setAuth] = useState(() => {
    const token = sessionStorage.getItem('token')
    const user  = sessionStorage.getItem('user')
    return token ? { token, user: JSON.parse(user) } : null
  })

  /** Called after successful OTP verification */
  const login = useCallback((token, user) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    setAuth({ token, user })
    navigate('/dashboard')
  }, [navigate])

  /** Clears session and redirects to login */
  const logout = useCallback(() => {
    sessionStorage.clear()
    setAuth(null)
    navigate('/login')
  }, [navigate])

  const value = useMemo(
    () => ({ auth, login, logout, isAuthenticated: !!auth }),
    [auth, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
