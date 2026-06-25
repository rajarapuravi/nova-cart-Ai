import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { fetchProfile } from '../../store/slices/authSlice'
import { FiUser, FiLock, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi'

const BLANK_ADDR = {
  name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '', country: 'India',
  address_type: 'home', is_default: false,
}

export default function Profile() {
  const dispatch = useDispatch()
  const { user }  = useSelector(s => s.auth)
  const [tab, setTab]         = useState('info')
  const [addresses, setAddresses] = useState([])
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm] = useState(BLANK_ADDR)

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    phone:      user?.phone      || '',
  })
  const [pwForm, setPwForm] = useState({
    old_password: '', new_password: '', confirm_password: ''
  })

  const loadAddresses = () =>
    api.get('/auth/addresses/').then(r => {
      const data = Array.isArray(r.data) ? r.data : (r.data.results || [])
      setAddresses(data)
    })

  useEffect(() => { loadAddresses() }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      await api.patch('/auth/profile/', form)
      dispatch(fetchProfile())
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Passwords do not match'); return
    }
    try {
      await api.post('/auth/change-password/', pwForm)
      toast.success('Password changed!')
      setPwForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const saveAddress = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/addresses/', addrForm)
      toast.success('Address saved!')
      setShowAddrForm(false)
      setAddrForm(BLANK_ADDR)
      try { await loadAddresses() } catch (_) {}
    } catch (err) {
      const data = err.response?.data
      let msg = 'Could not save address'
      if (data) {
        if (typeof data === 'string') msg = data
        else if (data.detail) msg = data.detail
        else {
          const firstKey = Object.keys(data)[0]
          const firstVal = data[firstKey]
          msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal)
        }
      }
      toast.error(msg)
    }
  }

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return
    await api.delete(`/auth/addresses/${id}/`)
    toast.success('Address deleted')
    loadAddresses()
  }

  const tabs = [
    ['info',      'Personal Info', FiUser],
    ['security',  'Security',      FiLock],
    ['addresses', 'Addresses',     FiMapPin],
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md">
          {user?.first_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === id
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Personal Info ── */}
      {tab === 'info' && (
        <form onSubmit={saveProfile} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">First Name</label>
              <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Last Name</label>
              <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="input" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input value={user?.email} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" placeholder="9876543210" />
          </div>
          <button type="submit" className="btn-primary px-6">Save Changes</button>
        </form>
      )}

      {/* ── Security ── */}
      {tab === 'security' && (
        <form onSubmit={changePassword} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Change Password</h2>
          <div>
            <label className="text-sm font-medium block mb-1">Current Password</label>
            <input type="password" value={pwForm.old_password} onChange={e => setPwForm({...pwForm, old_password: e.target.value})} required className="input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">New Password</label>
            <input type="password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} required minLength={8} className="input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Confirm New Password</label>
            <input type="password" value={pwForm.confirm_password} onChange={e => setPwForm({...pwForm, confirm_password: e.target.value})} required className="input" />
          </div>
          <button type="submit" className="btn-primary px-6">Change Password</button>
        </form>
      )}

      {/* ── Addresses ── */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="card p-4 flex gap-3 items-start">
              <FiMapPin className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {addr.name}
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">{addr.address_type}</span>
                  {addr.is_default && <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                </p>
                <p className="text-sm text-gray-600">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
              </div>
              <button onClick={() => deleteAddress(addr.id)} className="text-red-400 hover:text-red-600 p-1.5">
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}

          {!showAddrForm && (
            <button onClick={() => setShowAddrForm(true)}
              className="w-full border-2 border-dashed border-purple-200 rounded-xl py-4 text-purple-600 text-sm font-medium hover:bg-purple-50 flex items-center justify-center gap-2">
              <FiPlus /> Add New Address
            </button>
          )}

          {showAddrForm && (
            <form onSubmit={saveAddress} className="card p-5 space-y-3 border-2 border-purple-100">
              <h3 className="font-semibold text-sm text-purple-700">New Address</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">Full Name *</label>
                  <input required value={addrForm.name} onChange={e => setAddrForm({...addrForm,name:e.target.value})} className="input text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Phone *</label>
                  <input required value={addrForm.phone} onChange={e => setAddrForm({...addrForm,phone:e.target.value})} className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Address Line 1 *</label>
                <input required value={addrForm.address_line1} onChange={e => setAddrForm({...addrForm,address_line1:e.target.value})} className="input text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Landmark</label>
                <input value={addrForm.address_line2} onChange={e => setAddrForm({...addrForm,address_line2:e.target.value})} className="input text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">City *</label>
                  <input required value={addrForm.city} onChange={e => setAddrForm({...addrForm,city:e.target.value})} className="input text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">State *</label>
                  <input required value={addrForm.state} onChange={e => setAddrForm({...addrForm,state:e.target.value})} className="input text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Pincode *</label>
                  <input required value={addrForm.pincode} onChange={e => setAddrForm({...addrForm,pincode:e.target.value})} className="input text-sm" maxLength={10} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select value={addrForm.address_type} onChange={e => setAddrForm({...addrForm,address_type:e.target.value})} className="input text-sm w-28">
                  <option value="home">🏠 Home</option>
                  <option value="work">💼 Work</option>
                  <option value="other">📍 Other</option>
                </select>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={addrForm.is_default} onChange={e => setAddrForm({...addrForm,is_default:e.target.checked})} className="accent-purple-600" />
                  Set as default
                </label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary text-sm px-5">Save</button>
                <button type="button" onClick={() => setShowAddrForm(false)} className="btn-secondary text-sm px-5">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
