import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiTag, FiCopy, FiCheck, FiShoppingCart } from 'react-icons/fi'

// All available coupons — shown to users
const ALL_COUPONS = [
  { code:'WELCOME10', discount:'10% OFF',  min:'₹999',   desc:'New users',          color:'from-purple-500 to-purple-700',  tag:'🎁' },
  { code:'FIRST20',   discount:'20% OFF',  min:'₹1,999', desc:'First purchase',      color:'from-blue-500 to-blue-700',      tag:'🥇' },
  { code:'NOVA50',    discount:'₹50 OFF',  min:'₹500',   desc:'All users',           color:'from-indigo-500 to-purple-600',  tag:'✨' },
  { code:'NOVA100',   discount:'₹100 OFF', min:'₹1,000', desc:'Weekend offer',        color:'from-pink-500 to-rose-600',      tag:'🗓️' },
  { code:'AI150',     discount:'₹150 OFF', min:'₹2,000', desc:'AI Recommended',       color:'from-cyan-500 to-blue-600',      tag:'🤖' },
  { code:'SHOP20',    discount:'20% OFF',  min:'₹2,499', desc:'Fashion',              color:'from-fuchsia-500 to-pink-600',   tag:'👗' },
  { code:'TECH15',    discount:'15% OFF',  min:'₹5,000', desc:'Electronics',          color:'from-green-500 to-emerald-600',  tag:'📱' },
  { code:'HOME10',    discount:'10% OFF',  min:'₹1,500', desc:'Home & Kitchen',       color:'from-orange-400 to-amber-500',   tag:'🏠' },
  { code:'FREEDEL',   discount:'Free Delivery', min:'₹499', desc:'All categories',   color:'from-teal-500 to-cyan-600',      tag:'🚚' },
  { code:'BUYMORE',   discount:'₹300 OFF', min:'₹4,999', desc:'Bulk purchase',        color:'from-violet-500 to-purple-700',  tag:'🛒' },
  { code:'FLASH25',   discount:'25% OFF',  min:'₹3,000', desc:'Flash sale',           color:'from-red-500 to-orange-500',     tag:'⚡' },
  { code:'SUMMER20',  discount:'20% OFF',  min:'₹2,000', desc:'Seasonal',             color:'from-yellow-400 to-orange-500',  tag:'☀️' },
  { code:'FESTIVE30', discount:'30% OFF',  min:'₹3,999', desc:'Festival sale',        color:'from-amber-500 to-yellow-500',   tag:'🎉' },
  { code:'DIWALI40',  discount:'40% OFF',  min:'₹5,999', desc:'Diwali',               color:'from-orange-500 to-red-600',     tag:'🪔' },
  { code:'BIGSALE50', discount:'50% OFF',  min:'Selected', desc:'Mega sale',          color:'from-red-600 to-pink-600',       tag:'🔥' },
  { code:'STUDENT15', discount:'15% OFF',  min:'₹999',   desc:'Student offer',        color:'from-sky-500 to-blue-600',       tag:'🎓' },
  { code:'SAVE500',   discount:'₹500 OFF', min:'₹8,000', desc:'Premium orders',       color:'from-purple-600 to-indigo-700',  tag:'💎' },
  { code:'VIP25',     discount:'25% OFF',  min:'₹6,000', desc:'Premium members',      color:'from-yellow-500 to-amber-600',   tag:'👑' },
  { code:'REFER200',  discount:'₹200 OFF', min:'₹1,500', desc:'Referral reward',      color:'from-green-400 to-teal-500',     tag:'🤝' },
  { code:'LOYAL10',   discount:'10% OFF',  min:'No Min',  desc:'Repeat customers',    color:'from-rose-400 to-pink-500',      tag:'❤️' },
]

export default function Coupons() {
  const navigate   = useNavigate()
  const [copied,   setCopied]   = useState(null)
  const [verified, setVerified] = useState({})
  const [filter,   setFilter]   = useState('all')

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    toast.success(`Copied ${code}!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const useCoupon = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    toast.success(`${code} copied — redirecting to checkout!`)
    setTimeout(() => navigate('/checkout'), 800)
  }

  const filters = [
    { id: 'all',       label: 'All Coupons' },
    { id: 'flat',      label: 'Flat Off' },
    { id: 'percent',   label: '% Discount' },
    { id: 'free',      label: 'Free Delivery' },
  ]

  const filtered = ALL_COUPONS.filter(c => {
    if (filter === 'flat')    return c.discount.includes('₹') && !c.discount.includes('Delivery')
    if (filter === 'percent') return c.discount.includes('%')
    if (filter === 'free')    return c.discount.includes('Delivery')
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-2">🏷️ All Coupons & Offers</h1>
        <p className="text-gray-500">Copy a coupon code and use it at checkout to save money!</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} coupons</span>
      </div>

      {/* Coupon grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.code}
            className="card overflow-hidden hover:shadow-md transition-shadow">
            {/* Colored top bar */}
            <div className={`bg-gradient-to-r ${c.color} px-4 py-3 flex items-center justify-between`}>
              <div>
                <span className="text-2xl">{c.tag}</span>
                <p className="text-white font-extrabold text-xl leading-tight">{c.discount}</p>
                <p className="text-white/80 text-xs">{c.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Min order</p>
                <p className="text-white font-bold text-sm">{c.min}</p>
              </div>
            </div>

            {/* Dashed separator */}
            <div className="relative px-4">
              <div className="border-t-2 border-dashed border-gray-200 my-0"></div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border border-gray-200"></div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border border-gray-200"></div>
            </div>

            {/* Bottom */}
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FiTag size={13} className="text-purple-500 flex-shrink-0" />
                <code className="text-purple-700 font-bold text-sm tracking-widest truncate">{c.code}</code>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => copyCoupon(c.code)}
                  title="Copy code"
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    copied === c.code
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700'
                  }`}>
                  {copied === c.code ? <FiCheck size={11} /> : <FiCopy size={11} />}
                  {copied === c.code ? 'Copied' : 'Copy'}
                </button>
                <button onClick={() => useCoupon(c.code)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
                  <FiShoppingCart size={11} /> Use
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* T&C */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Terms & Conditions</p>
        <ul className="space-y-0.5 list-disc ml-4">
          <li>Only one coupon can be used per order.</li>
          <li>Coupons are valid for limited time. Check validity before use.</li>
          <li>Minimum order amount must be met before applying coupon.</li>
          <li>NovaCart AI reserves the right to withdraw offers at any time.</li>
        </ul>
      </div>
    </div>
  )
}
