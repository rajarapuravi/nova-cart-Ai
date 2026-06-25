import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiBarChart2, FiBox, FiCpu, FiLogOut } from 'react-icons/fi'

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
  { to: '/admin/inventory', label: 'Inventory', icon: FiBox },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/ai', label: 'AI Assistant', icon: FiCpu },
]

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-purple-400">NovaCart AI</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full px-3 py-2">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
