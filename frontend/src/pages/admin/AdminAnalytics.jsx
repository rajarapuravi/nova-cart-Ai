import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    api.get(`/analytics/sales/?period=${period}`).then(r => setData(r.data))
  }, [period])

  if (!data) return <div className="p-6 animate-pulse"><div className="h-96 bg-gray-100 rounded-xl" /></div>

  const dailyReversed = [...(data.daily_data || [])].reverse()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `₹${Number(data.total_revenue).toLocaleString('en-IN')}`, color: 'text-green-600' },
          { label: 'Total Orders', value: data.total_orders, color: 'text-blue-600' },
          { label: 'Avg Order Value', value: `₹${Number(data.avg_order_value).toFixed(0)}`, color: 'text-purple-600' },
          { label: 'New Customers', value: data.new_customers, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Daily Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyReversed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#6C3FC5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Daily Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyReversed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#6C3FC5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Top Products</h2>
          <div className="space-y-2">
            {(data.top_products || []).slice(0,8).map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.product_name}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(p.total_sold / (data.top_products[0]?.total_sold || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600">{p.total_sold} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Top Categories</h2>
          <div className="space-y-2">
            {(data.top_categories || []).map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm">{c.product__category__name}</span>
                <span className="text-sm font-bold text-purple-700">₹{Number(c.revenue || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
