import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchHomeData } from '../../store/slices/productSlice'
import ProductCard from '../../components/ProductCard'
import { motion } from 'framer-motion'
import { FiArrowRight, FiZap, FiTrendingUp, FiStar, FiTruck } from 'react-icons/fi'

const HeroSlide = ({ title, subtitle, cta, bg }) => (
  <div className={`${bg} rounded-2xl p-8 md:p-14 flex flex-col justify-center min-h-64 relative overflow-hidden`}>
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{title}</h1>
      <p className="text-white/80 text-lg mb-6 max-w-md">{subtitle}</p>
      <Link to="/products" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-6 py-3 rounded-full hover:shadow-lg transition-shadow">
        {cta} <FiArrowRight />
      </Link>
    </motion.div>
  </div>
)

const SectionHeader = ({ title, icon: Icon, link }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={20} className="text-purple-600" />}
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
    </div>
    {link && <Link to={link} className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">View All <FiArrowRight /></Link>}
  </div>
)

export default function Home() {
  const dispatch = useDispatch()
  const { homeData } = useSelector(s => s.products)

  useEffect(() => { dispatch(fetchHomeData()) }, [dispatch])

  const heroes = [
    { title: 'AI-Powered Shopping', subtitle: 'Get personalized recommendations with our AI assistant', cta: 'Shop Now', bg: 'bg-gradient-to-r from-purple-700 to-purple-900' },
    { title: 'Flash Deals Today', subtitle: 'Up to 70% off on top brands. Limited time only!', cta: 'Grab Deals', bg: 'bg-gradient-to-r from-orange-500 to-pink-600' },
    { title: 'New Arrivals', subtitle: 'Latest tech, fashion, and more — just landed!', cta: 'Explore', bg: 'bg-gradient-to-r from-blue-600 to-cyan-500' },
  ]

  const features = [
    { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹499' },
    { icon: FiZap, title: 'AI Recommendations', desc: 'Smart picks just for you' },
    { icon: FiStar, title: 'Quality Assured', desc: 'Only verified products' },
    { icon: FiTrendingUp, title: '1 Cr+ Products', desc: 'Biggest selection online' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <HeroSlide {...heroes[0]} />

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <f.icon size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {homeData?.categories?.length > 0 && (
        <section>
          <SectionHeader title="Shop by Category" link="/products" />
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-3">
            {homeData.categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-purple-50 transition-colors text-center group">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors text-2xl">
                  {['📱','💻','👗','💄','🏠','🏋️','📚','🧸','🚗','🥬'][homeData.categories.indexOf(cat) % 10]}
                </div>
                <span className="text-xs font-medium text-gray-700 line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals */}
      {homeData?.flash_deals?.length > 0 && (
        <section>
          <SectionHeader title="⚡ Flash Deals" icon={FiZap} link="/products" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {homeData.flash_deals.map(deal => deal.product && <ProductCard key={deal.id} product={deal.product} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      {homeData?.trending?.length > 0 && (
        <section>
          <SectionHeader title="🔥 Trending Now" icon={FiTrendingUp} link="/products?is_trending=true" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homeData.trending.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {homeData?.new_arrivals?.length > 0 && (
        <section>
          <SectionHeader title="✨ New Arrivals" link="/products?is_new_arrival=true" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homeData.new_arrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {homeData?.best_sellers?.length > 0 && (
        <section>
          <SectionHeader title="⭐ Best Sellers" icon={FiStar} link="/products?is_best_seller=true" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homeData.best_sellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {!homeData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      )}
    </div>
  )
}
