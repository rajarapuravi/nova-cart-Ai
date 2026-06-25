import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/', { email })
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch { toast.error('Email not found') } finally { setLoading(false) }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/reset-password/', { email, otp, new_password: newPassword, confirm_password: newPassword })
      toast.success('Password reset successfully!')
      setStep(3)
    } catch { toast.error('Invalid OTP') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-center mb-6">Reset Password</h1>
        {step === 1 && (
          <form onSubmit={sendOTP} className="space-y-4">
            <div><label className="text-sm font-medium block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div><label className="text-sm font-medium block mb-1">OTP (sent to {email})</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} required className="input" maxLength={6} /></div>
            <div><label className="text-sm font-medium block mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="input" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
        {step === 3 && (
          <div className="text-center">
            <p className="text-green-600 mb-4 text-lg">✓ Password reset successfully!</p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mt-4"><Link to="/login" className="text-purple-700">Back to Login</Link></p>
      </div>
    </div>
  )
}
