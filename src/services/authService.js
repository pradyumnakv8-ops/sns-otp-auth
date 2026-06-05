/**
 * authService.js
 * Wraps all authentication API calls.
 * The backend (Lambda / API Gateway) is responsible for invoking AWS SNS.
 * React never touches AWS credentials or SNS directly.
 */
import apiClient from './apiClient'

/**
 * Ask the backend to generate an OTP and deliver it via AWS SNS SMS.
 * @param {string} mobileNumber - E.164 format, e.g. "+919876543210"
 */
export const sendOtp = async (mobileNumber) => {
  const { data } = await apiClient.post('/api/auth/send-otp', { mobileNumber })
  return data // { success, message }
}

/**
 * Verify the OTP entered by the user.
 * On success the backend returns a signed JWT.
 * @param {string} mobileNumber
 * @param {string} otp - 6-digit code
 */
export const verifyOtp = async (mobileNumber, otp) => {
  const { data } = await apiClient.post('/api/auth/verify-otp', { mobileNumber, otp })
  return data // { success, token, user }
}
