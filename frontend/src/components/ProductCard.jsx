import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { motion } from 'framer-motion'

// Category-matched images (same as backend)
const CATEGORY_IMG = {
  mobile:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=70',
  phone:     'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=70',
  laptop:    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=70',
  tablet:    'https://images.unsplash.com/photo-1542751110-97427bbecfd1?w=300&q=70',
  watch:     'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70',
  camera:    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=70',
  headphone: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=70',
  earphone:  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=70',
  speaker:   'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=70',
  fashion:   'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=70',
  men:       'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300&q=70',
  women:     'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=70',
  kids:      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=300&q=70',
  beauty:    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=70',
  makeup:    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=70',
  skin:      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=70',
  home:      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70',
  kitchen:   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70',
  sport:     'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=70',
  fitness:   'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=70',
  book:      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=70',
  toy:       'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&q=70',
  shoe:      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=70',
  bag:       'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=300&q=70',
  trimmer:   'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&q=70',
}

function getProductImage(product) {
  if (product.primary_image && product.primary_image.startsWith('http')) {
    return product.primary_image
  }
  const name = ((product.name || '') + ' ' + (product.category_name || '')).toLowerCase()
  for (const [key, url] of Object.entries(CATEGORY_IMG)) {
    if (name.includes(key)) return url
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70'
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { isAuthenticated }  = useSelector(s => s.auth)
  const { data: wishlist }   = useSelector(s => s.wishlist)
  const inWishlist = wishlist?.items?.some(i => i.product.id === product.id)

  const img           = getProductImage(product)
  const discountPrice = parseFloat(product.discounted_price || product.price)
  const origPrice     = parseFloat(product.price)
  const savings       = product.discount_percent > 0 ? Math.round(origPrice - discountPrice) : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    dispatch(addToCart({ product_id: product.id, quantity: 1 }))
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!isAuthenticated) { window.location.href = '/login'; return }
    dispatch(toggleWishlist(product.id))
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/products/${product.slug}`} className="card flex flex-col h-full group">

        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              e.target.onerror = null
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70'
            }}
          />
          {product.discount_percent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              -{Math.round(product.discount_percent)}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
            }`}
          >
            <FiHeart size={13} className={inWishlist ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          {product.brand_name && (
            <p className="text-xs text-purple-600 font-semibold mb-0.5 uppercase tracking-wide">{product.brand_name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1 mb-2 leading-snug">
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <FiStar key={s} size={11}
                className={s <= Math.round(product.average_rating || 0)
                  ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            {product.review_count > 0 && (
              <span className="text-xs text-gray-400 ml-0.5">({product.review_count})</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-3 flex-wrap">
            <span className="text-base font-bold text-gray-900">
              ₹{discountPrice.toLocaleString('en-IN')}
            </span>
            {savings > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  ₹{origPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-green-600 font-medium">save ₹{savings}</span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-1.5 bg-purple-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiShoppingCart size={13} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

      </Link>
    </motion.div>
  )
}
