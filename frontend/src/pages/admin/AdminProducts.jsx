import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', price:'', discount_percent:0, stock:0, is_active:true, is_featured:false, is_trending:false, is_new_arrival:false, is_best_seller:false, description:'' })

  const load = () => api.get('/admin-panel/products/').then(r => setProducts(r.data.results || r.data))
  useEffect(() => { load() }, [])

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, price: p.price, discount_percent: p.discount_percent, stock: p.stock, is_active: p.is_active, is_featured: p.is_featured, is_trending: p.is_trending, is_new_arrival: p.is_new_arrival, is_best_seller: p.is_best_seller, description: p.description })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      if (editing) await api.patch(`/admin-panel/products/${editing.id}/`, form)
      else await api.post('/admin-panel/products/', form)
      toast.success(editing ? 'Product updated' : 'Product created')
      setShowForm(false); setEditing(null); load()
    } catch { toast.error('Failed to save') }
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/admin-panel/products/${id}/`)
    toast.success('Deleted'); load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <button onClick={() => { setEditing(null); setForm({ name:'',price:'',discount_percent:0,stock:0,is_active:true,is_featured:false,is_trending:false,is_new_arrival:false,is_best_seller:false,description:'' }); setShowForm(true) }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="pl-9 pr-4 py-2 border rounded-lg w-full max-w-sm text-sm outline-none focus:ring-2 focus:ring-purple-300" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Name','Price','Discount','Stock','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{p.name}</td>
                <td className="px-4 py-3">₹{Number(p.price).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">{p.discount_percent}%</td>
                <td className="px-4 py-3"><span className={`font-medium ${p.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                    <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={save} className="space-y-3">
              <div><label className="text-sm font-medium block mb-1">Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-sm font-medium block mb-1">Price</label><input type="number" value={form.price} onChange={e => setForm({...form,price:e.target.value})} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-sm font-medium block mb-1">Discount%</label><input type="number" value={form.discount_percent} onChange={e => setForm({...form,discount_percent:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-sm font-medium block mb-1">Stock</label><input type="number" value={form.stock} onChange={e => setForm({...form,stock:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="text-sm font-medium block mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" /></div>
              <div className="flex flex-wrap gap-3">
                {['is_active','is_featured','is_trending','is_new_arrival','is_best_seller'].map(k => (
                  <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={form[k]} onChange={e => setForm({...form,[k]:e.target.checked})} className="accent-purple-600" />
                    {k.replace('is_','').replace('_',' ')}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
