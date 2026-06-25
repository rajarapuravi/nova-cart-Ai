import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleAI } from '../store/slices/uiSlice'
import api from '../api/axios'
import { FiX, FiSend, FiCpu, FiMic } from 'react-icons/fi'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'


export default function AIChat() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: `Hi ${user?.first_name || 'there'}! 👋 I'm NovaCart AI. Ask me about products, deals, or your orders!\n\n💡 Tip: Try "recommend a gaming phone under ₹30,000" or "best headphones under ₹5,000"`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [products, setProducts] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { sender: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await api.post('/ai/chat/', { message: msg, session_id: sessionId })
      setMessages(prev => [...prev, { sender: 'assistant', content: res.data.message }])
      if (res.data.products?.length) setProducts(res.data.products)
    } catch (err) {
      const errMsg = err.response?.status === 401
        ? 'Please log in to use the AI assistant.'
        : 'Sorry, I had trouble connecting. Please try again.'
      setMessages(prev => [...prev, { sender: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  const voiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { alert('Voice not supported in this browser'); return }
    const rec = new window.webkitSpeechRecognition()
    rec.lang = 'en-IN'
    rec.onresult = (e) => setInput(e.results[0][0].transcript)
    rec.start()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => dispatch(toggleAI())} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><FiCpu size={16} /></div>
          <div className="flex-1">
            <p className="font-semibold text-sm">NovaCart AI Assistant</p>
            <p className="text-xs opacity-75">Powered by {user?.ai_provider === 'openai' ? 'ChatGPT' : 'Gemini'}</p>
          </div>
          <button onClick={() => dispatch(toggleAI())} className="hover:bg-white/20 rounded-full p-1"><FiX size={16} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                m.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-gray-500">
                <span className="animate-pulse">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Product suggestions */}
        {products.length > 0 && (
          <div className="px-4 py-2 border-t">
            <p className="text-xs text-gray-500 mb-2">Suggested products:</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {products.slice(0, 3).map(p => (
                <div key={p.id} className="flex-shrink-0 w-28 text-xs border rounded-lg p-2">
                  <p className="font-medium line-clamp-2">{p.name}</p>
                  <p className="text-purple-700 font-bold">₹{Number(p.discounted_price || p.price).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={send} className="p-3 border-t flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about products, budget..."
            className="flex-1 border border-gray-200 rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300" />
          <button type="button" onClick={voiceInput} className="text-gray-400 hover:text-purple-600 p-1.5"><FiMic size={16} /></button>
          <button type="submit" disabled={!input.trim() || loading}
            className="bg-purple-600 text-white rounded-full p-2 hover:bg-purple-700 disabled:opacity-50">
            <FiSend size={14} />
          </button>
        </form>
      </motion.div>
    </>
  )
}
