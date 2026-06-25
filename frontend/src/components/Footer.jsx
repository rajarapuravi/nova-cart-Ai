import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">NovaCart <span className="text-purple-400">AI</span></h3>
          <p className="text-sm text-gray-400">India's smartest AI-powered shopping platform. Find the best deals with AI assistance.</p>
          <div className="flex gap-3 mt-4">
            {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"><Icon size={14} /></a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Shopping</h4>
          <ul className="space-y-2 text-sm">
            {['Electronics','Fashion','Beauty','Home','Sports'].map(c => (
              <li key={c}><Link to={`/products?category=${c.toLowerCase()}`} className="hover:text-purple-400">{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm">
            {[['FAQ', '/faq'], ['Contact Us', '/contact'], ['Coupons & Offers', '/coupons'], ['Returns', '#'], ['Track Order', '/orders'], ['Privacy Policy', '#']].map(([l, h]) => (
              <li key={l}><Link to={h} className="hover:text-purple-400">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Account</h4>
          <ul className="space-y-2 text-sm">
            {[['My Profile', '/profile'], ['Orders', '/orders'], ['Wishlist', '/wishlist'], ['AI Settings', '/ai-settings']].map(([l, h]) => (
              <li key={l}><Link to={h} className="hover:text-purple-400">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © 2024 NovaCart AI. All rights reserved. | Made with ❤️ in India
      </div>
    </footer>
  )
}
