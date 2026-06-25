import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import AIChat from '../components/AIChat'
import { useSelector } from 'react-redux'

export default function CustomerLayout() {
  const { cartOpen, aiOpen } = useSelector(s => s.ui)
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {cartOpen && <CartDrawer />}
      {aiOpen && <AIChat />}
    </div>
  )
}
