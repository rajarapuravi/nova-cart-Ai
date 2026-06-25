import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from './store/slices/authSlice'
import { fetchCart } from './store/slices/cartSlice'
import { fetchWishlist } from './store/slices/wishlistSlice'

// Layouts
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'

// Customer pages
import Home from './pages/customer/Home'
import Products from './pages/customer/Products'
import ProductDetail from './pages/customer/ProductDetail'
import Cart from './pages/customer/Cart'
import Wishlist from './pages/customer/Wishlist'
import Checkout from './pages/customer/Checkout'
import Orders from './pages/customer/Orders'
import OrderDetail from './pages/customer/OrderDetail'
import Profile from './pages/customer/Profile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import About from './pages/customer/About'
import Contact from './pages/customer/Contact'
import AISettings from './pages/customer/AISettings'
import Coupons from './pages/customer/Coupons'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminInventory from './pages/admin/AdminInventory'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminAIAssistant from './pages/admin/AdminAIAssistant'

// Guards
const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
const RequireAdmin = ({ children }) => {
  const { user, isAuthenticated } = useSelector(s => s.auth)
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (!user?.is_staff) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    if (localStorage.getItem('access')) {
      dispatch(fetchProfile())
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
    }
  }, [isAuthenticated])

  return (
    <Routes>
      {/* Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="/orders/:order_id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/ai-settings" element={<RequireAuth><AISettings /></RequireAuth>} />
        <Route path="/coupons" element={<Coupons />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="ai" element={<AdminAIAssistant />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
