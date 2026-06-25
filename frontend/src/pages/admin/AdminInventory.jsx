import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminInventory() {
  const [data, setData] = useState(null)

  useEffect(() => { api.get('/admin-panel/inventory/').then(r => setData(r.data)) }, [])

  if (!data) return <div className="p-6 animate-pulse"><div className="h-64 bg-gray-100 rounded-xl" /></div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Inventory</h1>
      <p className="text-gray-500 text-sm mb-6">Total: {data.total_products} products</p>

      {data.out_of_stock?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-red-600 mb-3">⚠️ Out of Stock ({data.out_of_stock.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.out_of_stock.map(p => (
              <div key={p.id} className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category__name} • {p.brand__name}</p>
                <p className="text-red-600 font-bold text-xs mt-1">Out of Stock</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.low_stock?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-orange-600 mb-3">⚡ Low Stock ({data.low_stock.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.low_stock.filter(p => p.stock > 0).map(p => (
              <div key={p.id} className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category__name}</p>
                <p className="text-orange-600 font-bold text-xs mt-1">Only {p.stock} left</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-3">All Products</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Product','Category','Brand','Stock','Status'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data.all_products || []).slice(0, 50).map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium truncate max-w-xs">{p.name}</td>
                <td className="px-4 py-2 text-gray-500">{p.category__name}</td>
                <td className="px-4 py-2 text-gray-500">{p.brand__name}</td>
                <td className="px-4 py-2 font-bold">
                  <span className={p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-orange-500' : 'text-green-600'}>{p.stock}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
