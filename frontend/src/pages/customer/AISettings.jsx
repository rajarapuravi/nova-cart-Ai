import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProfile } from '../../store/slices/authSlice'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiCpu, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi'

export default function AISettings() {
  const { user }   = useSelector(s => s.auth)
  const dispatch   = useDispatch()
  const [providers, setProviders] = useState([])
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    api.get('/ai/providers/').then(r => setProviders(r.data.providers || []))
  }, [])

  const setProvider = async (provider) => {
    setLoading(true)
    try {
      await api.post('/auth/ai-preference/', { ai_provider: provider })
      dispatch(fetchProfile())
      toast.success(`AI switched to ${provider === 'openai' ? 'ChatGPT' : 'Gemini'}`)
    } catch { toast.error('Failed to update') } finally { setLoading(false) }
  }

  const icons = { gemini: '✨', openai: '🤖', claude: '🔮', deepseek: '🌊' }
  const colors = {
    gemini:   'from-blue-500 to-cyan-400',
    openai:   'from-green-500 to-emerald-400',
    claude:   'from-orange-400 to-amber-300',
    deepseek: 'from-purple-500 to-indigo-400',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">AI Preferences</h1>
      <p className="text-gray-500 text-sm mb-2">Choose your preferred AI model for the shopping assistant.</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex gap-2 text-sm text-blue-800">
        <FiInfo className="flex-shrink-0 mt-0.5" size={15} />
        <span>
          The AI assistant works with <strong>smart demo responses</strong> by default.
          To enable live AI responses, add your API keys in <code className="bg-blue-100 px-1 rounded">backend/.env</code>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(providers.length ? providers : [
          { id:'gemini',   name:'Gemini (Google)',   available:true,  configured:false },
          { id:'openai',   name:'ChatGPT (OpenAI)',  available:true,  configured:false },
          { id:'claude',   name:'Claude (Anthropic)',available:false, coming_soon:true },
          { id:'deepseek', name:'DeepSeek',          available:false, coming_soon:true },
        ]).map(p => (
          <button
            key={p.id}
            disabled={!p.available || loading}
            onClick={() => p.available && setProvider(p.id)}
            className={`relative card p-5 text-left transition-all hover:shadow-md
              disabled:cursor-not-allowed
              ${user?.ai_provider === p.id ? 'ring-2 ring-purple-500' : ''}
              ${!p.available ? 'opacity-60' : ''}
            `}
          >
            {/* Gradient icon */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[p.id]} flex items-center justify-center text-2xl mb-3 shadow`}>
              {icons[p.id]}
            </div>

            <h3 className="font-bold text-base mb-0.5">{p.name}</h3>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {user?.ai_provider === p.id && (
                <span className="flex items-center gap-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  <FiCheck size={10} /> Active
                </span>
              )}
              {p.configured && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">API Key Set</span>
              )}
              {p.available && !p.configured && (
                <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  <FiAlertCircle size={10} /> Demo mode
                </span>
              )}
              {p.coming_soon && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming Soon</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">How to enable live AI:</p>
        <ol className="space-y-1 text-xs list-decimal ml-4">
          <li>Get a free Gemini API key from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com</a></li>
          <li>Open <code className="bg-gray-200 px-1 rounded">novacart/backend/.env</code></li>
          <li>Set <code className="bg-gray-200 px-1 rounded">GEMINI_API_KEY=your_key_here</code></li>
          <li>Restart the backend server</li>
        </ol>
      </div>
    </div>
  )
}
