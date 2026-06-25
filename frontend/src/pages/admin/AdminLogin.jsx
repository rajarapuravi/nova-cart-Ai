import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../store/slices/authSlice'

export default function AdminLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(login(form))
    if (!res.error && res.payload?.user?.is_staff) navigate('/admin')
    else if (!res.error) alert('This account does not have admin access.')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-700">NovaCart AI</h1>
          <p className="text-gray-500">Admin Panel Login</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Admin Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required className="input" /></div>
          <div><label className="text-sm font-medium block mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required className="input" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
        <p className="text-xs text-center text-gray-400 mt-4">admin@novacart.ai / Admin@123</p>
      </div>
    </div>
  )
}
