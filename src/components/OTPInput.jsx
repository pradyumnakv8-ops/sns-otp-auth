import { useRef, useEffect } from 'react'

const OTP_LENGTH = 6

/**
 * Renders 6 individual digit boxes for OTP entry.
 * Supports paste, backspace navigation, and keyboard focus management.
 */
export default function OTPInput({ value = '', onChange, disabled }) {
  const inputs = useRef([])
  const digits = value.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH)

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const update = (index, char) => {
    const arr = digits.slice()
    arr[index] = char.replace(/\D/g, '')
    onChange(arr.join('').trim())
    if (char && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        update(index, '')
      } else if (index > 0) {
        inputs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(pasted)
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputs.current[nextIndex]?.focus()
  }

  return (
    <div className="otp-row">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          className={digits[i] ? 'filled' : ''}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}
