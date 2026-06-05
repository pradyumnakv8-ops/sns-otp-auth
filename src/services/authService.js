/**
 * authService.js
 * All authentication API calls — React never touches AWS credentials directly.
 * Set VITE_MOCK_AUTH=true in .env to run without a backend (frontend dev only).
 */
import apiClient from './apiClient'

const MOCK = import.meta.env.VITE_MOCK_AUTH === 'true'

/* Fake DB stored in sessionStorage so it survives page refresh during dev */
const mockDb = {
  getUsers: () => JSON.parse(sessionStorage.getItem('_mockUsers') || '{}'),
  save: (users) => sessionStorage.setItem('_mockUsers', JSON.stringify(users)),
  get: (username) => mockDb.getUsers()[username.toLowerCase()],
  set: (username, data) => {
    const users = mockDb.getUsers()
    users[username.toLowerCase()] = data
    mockDb.save(users)
  },
}

const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms))
const mockOtp = () => Math.floor(100000 + Math.random() * 900000).toString()
const mask = (mobile) => mobile.slice(0, -4).replace(/\d/g, 'X') + mobile.slice(-4)

/** Login: validate username+password, then trigger OTP to registered mobile */
export const loginWithPassword = async (username, password) => {
  if (MOCK) {
    await delay()
    const user = mockDb.get(username)
    if (!user) return { success: false, message: 'User not found' }
    if (user.password !== password) return { success: false, message: 'Incorrect password' }
    const otp = mockOtp()
    mockDb.set(username, { ...user, pendingOtp: otp })
    console.info(`[MOCK] OTP for ${username}: ${otp}`)
    return { success: true, message: 'OTP sent to your registered mobile', mobileNumber: mask(user.mobileNumber) }
  }
  const { data } = await apiClient.post('/api/auth/login', { username, password })
  return data
}

/** Register: create account and trigger OTP to mobile */
export const register = async (username, password, mobileNumber) => {
  if (MOCK) {
    await delay()
    if (mockDb.get(username)) return { success: false, message: 'Username already exists' }
    const otp = mockOtp()
    mockDb.set(username, { username, password, mobileNumber, pendingOtp: otp })
    console.info(`[MOCK] OTP for ${username}: ${otp}`)
    return { success: true, message: 'Account created! OTP sent to your mobile', mobileNumber: mask(mobileNumber) }
  }
  const { data } = await apiClient.post('/api/auth/register', { username, password, mobileNumber })
  return data
}

/** Forgot password: look up username and trigger OTP to registered mobile */
export const forgotPassword = async (username) => {
  if (MOCK) {
    await delay()
    const user = mockDb.get(username)
    if (!user) return { success: false, message: 'User not found' }
    const otp = mockOtp()
    mockDb.set(username, { ...user, pendingOtp: otp })
    console.info(`[MOCK] OTP for ${username}: ${otp}`)
    return { success: true, message: 'OTP sent to your registered mobile', mobileNumber: mask(user.mobileNumber) }
  }
  const { data } = await apiClient.post('/api/auth/forgot-password', { username })
  return data
}

/** Verify OTP — backend returns JWT on success */
export const verifyOtpWithContext = async (mobileNumber, otp, context, username) => {
  if (MOCK) {
    await delay()
    const user = mockDb.get(username)
    if (!user) return { success: false, message: 'Session expired, please try again' }
    if (user.pendingOtp !== otp) return { success: false, message: 'Invalid OTP' }
    mockDb.set(username, { ...user, pendingOtp: null })
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: { id: username, name: username, mobileNumber: user.mobileNumber, role: 'User' },
    }
  }
  const { data } = await apiClient.post('/api/auth/verify-otp', { mobileNumber, otp, context })
  return data
}
