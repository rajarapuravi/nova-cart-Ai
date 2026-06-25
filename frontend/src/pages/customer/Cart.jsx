import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateCartItem, removeCartItem } from '../../store/slices/cartSlice'
import { FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi'

export default function Cart() {
  const dispatch = useDispatch()
  const { data: cart } = useSelector(s => s.cart)
  const items = cart?.items?.filter(i => !i.saved_for_later) || []

  if (!items.length) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add items to get started</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img src={item.product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=60'}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-xl bg-gray-50"
                onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=60' }} />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-medium hover:text-purple-700 line-clamp-2 text-sm">{item.product.name}</Link>
                <p className="text-purple-700 font-bold mt-1">₹{Number(item.product.discounted_price).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                    <button onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity - 1 }))} className="px-2 py-1 hover:bg-gray-100"><FiMinus size={12} /></button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity + 1 }))} className="px-2 py-1 hover:bg-gray-100"><FiPlus size={12} /></button>
                  </div>
                  <button onClick={() => dispatch(removeCartItem(item.id))} className="text-red-400 hover:text-red-600"><FiTrash2 size={16} /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{Number(item.subtotal).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card p-4 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-600">Items ({items.length})</span><span>₹{Number(cart?.total || 0).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="text-green-600">{cart?.total >= 499 ? 'FREE' : '₹49'}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{Number((cart?.total || 0) + (cart?.total >= 499 ? 0 : 49)).toLocaleString('en-IN')}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center flex items-center justify-center gap-2">
            Checkout <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  )
}
