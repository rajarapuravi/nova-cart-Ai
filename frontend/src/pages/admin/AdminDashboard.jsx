import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FiShoppingBag, FiDollarSign, FiUsers, FiPackage, FiAlertCircle, FiClock } from 'react-icons/fi'

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}><Icon size={18} className="text-white" /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.get('/admin-panel/dashboard/').then(r => setStats(r.data)) }, [])

  if (!stats) return <div className="p-6 animate-pulse"><div className="grid grid-cols-4 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}</div></div>

  const cards = [
    { title: 'Total Revenue', value: `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-green-500', sub: `Today: ₹${Number(stats.today_revenue).toLocaleString('en-IN')}` },
    { title: 'Total Orders', value: stats.total_orders, icon: FiShoppingBag, color: 'bg-blue-500', sub: `Today: ${stats.today_orders}` },
    { title: 'Total Users', value: stats.total_users, icon: FiUsers, color: 'bg-purple-500' },
    { title: 'Active Products', value: stats.total_products, icon: FiPackage, color: 'bg-orange-500' },
    { title: 'Low Stock', value: stats.low_stock_count, icon: FiAlertCircle, color: 'bg-red-500', sub: 'Items below 10 units' },
    { title: 'Pending Orders', value: stats.pending_orders, icon: FiClock, color: 'bg-yellow-500' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(c => <StatCard key={c.title} {...c} />)}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4">Revenue (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={[...(stats.weekly_revenue || [])].reverse()}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v.toLocaleString()}`} />
            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#6C3FC5" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
