import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

const blank = { code:'', description:'', discount_type:'percent', discount_value:'', minimum_order:0, maximum_discount:'', usage_limit:100, valid_from:'', valid_to:'', is_active:true }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)

  const load = () => api.get('/admin-panel/coupons/').then(r => setCoupons(r.data.results || r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin-panel/coupons/', form)
      toast.success('Coupon created!'); setShowForm(false); setForm(blank); load()
    } catch (e) { toast.error(JSON.stringify(e.response?.data) || 'Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete coupon?')) return
    await api.delete(`/admin-panel/coupons/${id}/`)
    toast.success('Deleted'); load()
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
          <FiPlus /> New Coupon
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Code','Type','Value','Min Order','Limit','Used','Valid Until','Active',''].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-purple-700">{c.code}</td>
                <td className="px-4 py-3 capitalize">{c.discount_type}</td>
                <td className="px-4 py-3">{c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                <td className="px-4 py-3">₹{c.minimum_order}</td>
                <td className="px-4 py-3">{c.usage_limit}</td>
                <td className="px-4 py-3">{c.used_count || 0}</td>
                <td className="px-4 py-3 text-xs">{new Date(c.valid_to).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Yes' : 'No'}</span></td>
                <td className="px-4 py-3"><button onClick={() => del(c.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 overflow-y-auto max-h-screen">
            <h2 className="font-bold text-lg mb-4">New Coupon</h2>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Code</label><input {...f('code')} required className="w-full border rounded-lg px-3 py-2 text-sm uppercase" /></div>
                <div><label className="text-sm font-medium block mb-1">Type</label>
                  <select {...f('discount_type')} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="percent">Percentage</option><option value="flat">Flat Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Value</label><input type="number" {...f('discount_value')} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-sm font-medium block mb-1">Min Order (₹)</label><input type="number" {...f('minimum_order')} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Valid From</label><input type="datetime-local" {...f('valid_from')} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-sm font-medium block mb-1">Valid To</label><input type="datetime-local" {...f('valid_to')} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="text-sm font-medium block mb-1">Description</label><input {...f('description')} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
