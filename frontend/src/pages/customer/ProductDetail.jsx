import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct } from '../../store/slices/productSlice'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiRefreshCw, FiShare2 } from 'react-icons/fi'

export default function ProductDetail() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { detail, loading } = useSelector(s => s.products)
  const { isAuthenticated } = useSelector(s => s.auth)
  const { data: wishlist } = useSelector(s => s.wishlist)
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => { dispatch(fetchProduct(slug)) }, [slug])

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 animate-pulse bg-gray-100 rounded-xl" /></div>
  if (!detail) return null

  const inWishlist = wishlist?.items?.some(i => i.product.id === detail.id)
  const discountedPrice = detail.discounted_price || detail.price
  const rawImages = detail.images?.length ? detail.images.map(i => i.image).filter(Boolean) : []
  const FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
  const images = rawImages.length ? rawImages : [FALLBACK]

  const handleAddToCart = () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    dispatch(addToCart({ product_id: detail.id, quantity: qty }))
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    dispatch(addToCart({ product_id: detail.id, quantity: qty }))
    window.location.href = '/checkout'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-purple-700">Home</Link> /
        <Link to="/products" className="hover:text-purple-700 mx-1">Products</Link> /
        <span className="text-gray-800 ml-1">{detail.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden mb-4 aspect-square flex items-center justify-center">
            <img src={images[selectedImg]} alt={detail.name}
              className="max-h-full object-contain p-8"
              onError={e => { e.target.onerror = null; e.target.src = FALLBACK }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImg(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-purple-600' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-contain p-1 bg-gray-50"
                  onError={e => { e.target.onerror = null; e.target.src = FALLBACK }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {detail.brand && <p className="text-purple-600 font-medium mb-1">{detail.brand.name}</p>}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{detail.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={14} className={i < Math.floor(detail.average_rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm font-medium">{detail.average_rating || 0}</span>
            <span className="text-sm text-gray-500">({detail.review_count || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-extrabold text-gray-900">₹{Number(discountedPrice).toLocaleString('en-IN')}</span>
            {detail.discount_percent > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{Number(detail.price).toLocaleString('en-IN')}</span>
                <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded">{detail.discount_percent}% OFF</span>
              </>
            )}
          </div>
          {detail.discount_percent > 0 && (
            <p className="text-green-600 text-sm mb-4">You save ₹{Math.round(detail.price - discountedPrice).toLocaleString('en-IN')}</p>
          )}

          {/* Stock */}
          <p className={`text-sm font-medium mb-4 ${detail.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {detail.stock > 0 ? `✓ In Stock (${detail.stock} left)` : '✗ Out of Stock'}
          </p>

          {/* Variants */}
          {detail.variants?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Variants</p>
              <div className="flex flex-wrap gap-2">
                {detail.variants.map(v => (
                  <button key={v.id} className="border border-gray-200 px-3 py-1 rounded-lg text-sm hover:border-purple-600 hover:text-purple-600 transition-colors">
                    {v.name}: {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium">Qty:</span>
            <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1.5 hover:bg-gray-100 font-bold">−</button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(detail.stock, qty + 1))} className="px-3 py-1.5 hover:bg-gray-100 font-bold">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={detail.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={detail.stock === 0}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
              Buy Now
            </button>
            <button onClick={() => dispatch(toggleWishlist(detail.id))}
              className={`p-3 rounded-xl border-2 transition-colors ${inWishlist ? 'bg-red-50 border-red-500 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-400'}`}>
              <FiHeart />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[['Free Delivery', FiTruck], ['1 Year Warranty', FiShield], ['Easy Returns', FiRefreshCw]].map(([label, Icon]) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                <Icon size={18} className="text-purple-600" />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500 hover:text-gray-800'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'description' && <p className="text-gray-700 leading-relaxed">{detail.description}</p>}
          {activeTab === 'specifications' && (
            <div className="space-y-2">
              {Object.entries(detail.specifications || {}).map(([k, v]) => (
                <div key={k} className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-600 w-48 flex-shrink-0">{k}</span>
                  <span className="text-gray-800">{String(v)}</span>
                </div>
              ))}
              {!Object.keys(detail.specifications || {}).length && <p className="text-gray-500">No specifications available.</p>}
            </div>
          )}
          {activeTab === 'reviews' && (
            <p className="text-gray-500">{detail.review_count ? `${detail.review_count} reviews — Average: ${detail.average_rating}/5` : 'No reviews yet.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
