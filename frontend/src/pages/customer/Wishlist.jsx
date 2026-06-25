import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleWishlist, moveToCart } from '../../store/slices/wishlistSlice'
import { FiTrash2, FiShoppingCart } from 'react-icons/fi'

export default function Wishlist() {
  const dispatch = useDispatch()
  const { data: wishlist } = useSelector(s => s.wishlist)
  const items = wishlist?.items || []

  if (!items.length) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">❤️</p>
      <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
      <Link to="/products" className="btn-primary mt-4 inline-block">Explore Products</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="card overflow-hidden">
            <Link to={`/products/${item.product.slug}`}>
              <img src={item.product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=60'}
                alt={item.product.name}
                className="w-full aspect-square object-cover bg-gray-50"
                onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=60' }} />
            </Link>
            <div className="p-3">
              <p className="text-sm font-medium line-clamp-2 mb-1">{item.product.name}</p>
              <p className="text-purple-700 font-bold mb-3">₹{Number(item.product.discounted_price || item.product.price).toLocaleString('en-IN')}</p>
              <div className="flex gap-2">
                <button onClick={() => dispatch(moveToCart(item.id))}
                  className="flex-1 flex items-center justify-center gap-1 bg-purple-600 text-white text-xs py-2 rounded-lg hover:bg-purple-700">
                  <FiShoppingCart size={12} /> Move to Cart
                </button>
                <button onClick={() => dispatch(toggleWishlist(item.product.id))}
                  className="p-2 text-red-400 hover:text-red-600 border rounded-lg">
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
