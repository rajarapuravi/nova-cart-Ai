import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/slices/authSlice'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(login(form))
    if (!res.error) navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-700">NovaCart AI</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-purple-600 hover:underline">Forgot?</Link>
            </div>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              required className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 p-3 bg-purple-50 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">Demo Accounts:</p>
          <p>User: user@novacart.ai / User@123</p>
          <p>Admin: admin@novacart.ai / Admin@123</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-purple-700 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
