import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['confirmed','packed','shipped','out_for_delivery','delivered','cancelled']
const statusColors = { pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700', packed:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700', out_for_delivery:'bg-orange-100 text-orange-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [message, setMessage] = useState('')

  const load = () => api.get('/admin-panel/orders/').then(r => setOrders(r.data.results || r.data))
  useEffect(() => { load() }, [])

  const updateStatus = async () => {
    if (!newStatus) return
    try {
      await api.post(`/admin-panel/orders/${selected.order_id}/status/`, { status: newStatus, message })
      toast.success('Order status updated')
      setSelected(null); setNewStatus(''); setMessage('')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders ({orders.length})</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Order ID','Customer','Items','Total','Payment','Status','Action'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-medium">{o.order_id}</td>
                <td className="px-4 py-3 text-xs">{o.user_email}</td>
                <td className="px-4 py-3">{o.items?.length || 0}</td>
                <td className="px-4 py-3 font-medium">₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.payment_status}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs capitalize ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status?.replace('_',' ')}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => { setSelected(o); setNewStatus(o.status) }}
                    className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-100">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold mb-1">Update Order {selected.order_id}</h2>
            <p className="text-sm text-gray-500 mb-4">Current: <span className="font-medium capitalize">{selected.status?.replace('_',' ')}</span></p>
            <div className="mb-3">
              <label className="text-sm font-medium block mb-1">New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Message (optional)</label>
              <input value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g. Shipped via Delhivery" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={updateStatus} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">Update</button>
              <button onClick={() => setSelected(null)} className="flex-1 border py-2 rounded-lg font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
