import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const submit = (e) => { e.preventDefault(); toast.success('Message sent! We\'ll respond within 24 hours.'); setForm({ name:'', email:'', message:'' }) }
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-8">We're here to help — reach out any time.</p>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div><label className="text-sm font-medium block mb-1">Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className="input" /></div>
        <div><label className="text-sm font-medium block mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required className="input" /></div>
        <div><label className="text-sm font-medium block mb-1">Message</label><textarea value={form.message} onChange={e => setForm({...form,message:e.target.value})} required rows={5} className="input resize-none" /></div>
        <button type="submit" className="btn-primary">Send Message</button>
      </form>
    </div>
  )
}
