import { useState, useRef, useEffect } from 'react'
import api from '../../api/axios'
import { FiSend, FiCpu, FiTrash2 } from 'react-icons/fi'


const SUGGESTIONS = [
  'What are the top selling products this month?',
  'Which categories have low inventory?',
  'Give me revenue forecast for next month',
  'What marketing strategies should I use?',
  'Which products should I restock urgently?',
  'Analyze customer purchasing patterns',
]

export default function AdminAIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'assistant', content: 'Hello! I\'m your NovaCart Admin AI. Ask me about sales, inventory, revenue forecasts, or business insights.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState('gemini')
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (msg) => {
    const text = msg || input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { sender: 'user', content: text }])
    setLoading(true)
    try {
      const res = await api.post('/ai/admin-chat/', { message: text, session_id: sessionId, provider })
      setMessages(prev => [...prev, { sender: 'assistant', content: res.data.message }])
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'assistant', content: 'Error: ' + (e.response?.data?.error || 'Failed to connect') }])
    } finally {
      setLoading(false) }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><FiCpu className="text-purple-700" size={20} /></div>
          <div>
            <h1 className="font-bold text-lg">Admin AI Assistant</h1>
            <p className="text-xs text-gray-500">Business intelligence & analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={provider} onChange={e => setProvider(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm outline-none">
            <option value="gemini">Gemini</option>
            <option value="openai">ChatGPT</option>
          </select>
          <button onClick={() => setMessages([{ sender:'assistant', content:'Chat cleared. How can I help?' }])}
            className="p-2 text-gray-400 hover:text-red-500"><FiTrash2 size={16} /></button>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s)}
              className="text-left text-xs p-3 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 text-purple-800 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              m.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl text-sm text-gray-500 animate-pulse">AI is analyzing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask about sales, inventory, revenue..."
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-300" />
        <button type="submit" disabled={!input.trim() || loading}
          className="bg-purple-600 text-white rounded-xl px-4 py-2.5 hover:bg-purple-700 disabled:opacity-50">
          <FiSend size={16} />
        </button>
      </form>
    </div>
  )
}
