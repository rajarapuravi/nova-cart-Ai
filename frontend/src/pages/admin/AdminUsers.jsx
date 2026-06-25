import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { api.get('/admin-panel/users/').then(r => setUsers(r.data.results || r.data)) }, [])

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.first_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customers ({users.length})</h1>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
        className="border rounded-lg px-3 py-2 text-sm w-full max-w-sm mb-4 outline-none focus:ring-2 focus:ring-purple-300" />
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Name','Email','Phone','Verified','Joined','Status'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.phone || '-'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${u.is_email_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.is_email_verified ? 'Yes' : 'No'}</span></td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.date_joined).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.is_active ? 'Active' : 'Blocked'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
