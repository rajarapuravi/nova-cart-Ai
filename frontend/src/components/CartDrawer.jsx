import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleCart } from '../store/slices/uiSlice'
import { updateCartItem, removeCartItem } from '../store/slices/cartSlice'
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { data: cart } = useSelector(s => s.cart)
  const items = cart?.items?.filter(i => !i.saved_for_later) || []

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => dispatch(toggleCart())} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Cart ({items.length})</h2>
          <button onClick={() => dispatch(toggleCart())} className="p-2 hover:bg-gray-100 rounded-full"><FiX /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <FiShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Your cart is empty</p>
              <Link to="/products" onClick={() => dispatch(toggleCart())}
                className="btn-primary mt-4 inline-block text-sm">Shop Now</Link>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <img src={item.product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60'}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg bg-white"
                onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                <p className="text-purple-700 font-bold text-sm">₹{Number(item.product.discounted_price).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity - 1 }))}
                    className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-200 text-xs">
                    <FiMinus size={10} />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity + 1 }))}
                    className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-200 text-xs">
                    <FiPlus size={10} />
                  </button>
                  <button onClick={() => dispatch(removeCartItem(item.id))} className="ml-auto text-red-400 hover:text-red-600">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">₹{Number(cart?.total || 0).toLocaleString('en-IN')}</span>
            </div>
            <Link to="/checkout" onClick={() => dispatch(toggleCart())}
              className="btn-primary w-full text-center block">Proceed to Checkout</Link>
            <Link to="/cart" onClick={() => dispatch(toggleCart())}
              className="btn-secondary w-full text-center block text-sm">View Full Cart</Link>
          </div>
        )}
      </motion.div>
    </>
  )
}
