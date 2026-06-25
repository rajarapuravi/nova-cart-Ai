import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../../store/slices/authSlice'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', password2: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(register(form))
    if (!res.error) navigate('/')
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({...form, [key]: e.target.value}) })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-700">Create Account</h1>
          <p className="text-gray-500 mt-1">Join NovaCart AI today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
              <input {...f('first_name')} required className="input" placeholder="John" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
              <input {...f('last_name')} className="input" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input type="email" {...f('email')} required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            <input type="tel" {...f('phone')} className="input" placeholder="9876543210" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input type="password" {...f('password')} required minLength={8} className="input" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
            <input type="password" {...f('password2')} required className="input" placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-purple-700 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
