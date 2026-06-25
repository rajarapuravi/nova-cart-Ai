import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { toggleCart, toggleAI } from '../store/slices/uiSlice'
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiCpu, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector(s => s.auth)
  const { data: cart } = useSelector(s => s.cart)
  const { data: wishlist } = useSelector(s => s.wishlist)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const cartCount = cart?.item_count || 0
  const wishCount = wishlist?.items?.length || 0

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white text-xs py-1.5 text-center">
        Free delivery on orders above ₹499 | Use code WELCOME10 for 10% off!
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-purple-700">Nova<span className="text-orange-500">Cart</span> <span className="text-sm font-medium text-gray-500">AI</span></span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full border border-gray-200 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-purple-400">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 px-4 py-2 outline-none text-sm" />
              <button type="submit" className="bg-purple-600 text-white px-4 hover:bg-purple-700 transition-colors">
                <FiSearch size={16} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* AI Chat */}
            <button onClick={() => dispatch(toggleAI())}
              className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors hidden sm:flex">
              <FiCpu size={14} /> AI Chat
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-purple-700">
              <FiHeart size={20} />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{wishCount}</span>}
            </Link>

            {/* Cart */}
            <button onClick={() => dispatch(toggleCart())} className="relative p-2 text-gray-600 hover:text-purple-700">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-purple-700 font-medium">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm">{user?.first_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"><FiUser size={14} /> Profile</Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"><FiPackage size={14} /> Orders</Link>
                      <Link to="/ai-settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"><FiSettings size={14} /> AI Settings</Link>
                      {user?.is_staff && <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-purple-700 hover:bg-purple-50">Admin Panel</Link>}
                      <button onClick={() => { dispatch(logout()); setUserMenuOpen(false) }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5 px-4">Sign In</Link>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-6 pb-2 text-sm font-medium text-gray-600 border-t border-gray-100 pt-2">
          {['Electronics','Fashion','Beauty','Home','Sports','Books','Toys','Groceries'].map(cat => (
            <Link key={cat} to={`/products?category=${cat.toLowerCase()}`}
              className="hover:text-purple-700 transition-colors whitespace-nowrap">{cat}</Link>
          ))}
          <Link to="/coupons" className="hover:text-purple-700 transition-colors whitespace-nowrap text-orange-500 font-semibold">🏷️ Coupons</Link>
        </nav>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex border border-gray-200 rounded-full overflow-hidden">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..." className="flex-1 px-4 py-2 outline-none text-sm" />
          <button type="submit" className="bg-purple-600 text-white px-4"><FiSearch size={14} /></button>
        </form>
      </div>
    </header>
  )
}
