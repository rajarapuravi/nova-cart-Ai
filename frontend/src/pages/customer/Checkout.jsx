import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { placeOrder } from '../../store/slices/orderSlice'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiCheck, FiMapPin, FiCreditCard, FiShoppingBag } from 'react-icons/fi'

const PAYMENT_METHODS = [
  { id: 'upi',        label: 'UPI / QR Pay',       icon: '📱' },
  { id: 'google_pay', label: 'Google Pay',          icon: '🟢' },
  { id: 'phonepe',    label: 'PhonePe',             icon: '🟣' },
  { id: 'paytm',      label: 'Paytm',               icon: '🔵' },
  { id: 'card',       label: 'Credit / Debit Card', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking',         icon: '🏦' },
  { id: 'cod',        label: 'Cash on Delivery',    icon: '💵' },
]

const BLANK_ADDR = {
  name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '', country: 'India',
  address_type: 'home', is_default: false,
}

export default function Checkout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { data: cart }  = useSelector(s => s.cart)
  const { loading }     = useSelector(s => s.orders)
  const { user }        = useSelector(s => s.auth)

  const [addresses,       setAddresses]       = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod,   setPaymentMethod]   = useState('cod')
  const [coupon,          setCoupon]          = useState('')
  const [couponData,      setCouponData]      = useState(null)
  const [couponLoading,   setCouponLoading]   = useState(false)
  const [showAddrForm,    setShowAddrForm]    = useState(false)
  const [addrForm,        setAddrForm]        = useState(BLANK_ADDR)
  const [addrSaving,      setAddrSaving]      = useState(false)

  const loadAddresses = () =>
    api.get('/auth/addresses/').then(r => {
      // Handle both paginated {results:[]} and plain array responses
      const data = Array.isArray(r.data) ? r.data : (r.data.results || [])
      setAddresses(data)
      if (!selectedAddress && data.length > 0) {
        const def = data.find(a => a.is_default) || data[0]
        if (def) setSelectedAddress(def.id)
      }
      if (data.length === 0) setShowAddrForm(true)
    })

  useEffect(() => { loadAddresses() }, [])

  /* ---------- add address ---------- */
  const saveAddress = async (e) => {
    e.preventDefault()
    setAddrSaving(true)
    try {
      const res = await api.post('/auth/addresses/', addrForm)
      // Address saved — now update UI (reload errors must NOT show as save errors)
      toast.success('Address saved!')
      setShowAddrForm(false)
      setAddrForm(BLANK_ADDR)
      const savedId = res.data.id
      // Load addresses separately — silently ignore any list-fetch errors
      try {
        await loadAddresses()
      } catch (_) {}
      setSelectedAddress(savedId)
    } catch (err) {
      // Only reaches here if the POST itself failed
      const data = err.response?.data
      let msg = 'Could not save address'
      if (data) {
        if (typeof data === 'string') msg = data
        else if (data.detail) msg = data.detail
        else {
          const firstKey = Object.keys(data)[0]
          const firstVal = data[firstKey]
          msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal)
        }
      }
      toast.error(msg)
    } finally {
      setAddrSaving(false)
    }
  }

  /* ---------- coupon ---------- */
  const applyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/coupons/apply/', {
        code: coupon.trim().toUpperCase(),
        order_amount: subtotal,
      })
      setCouponData(res.data)
      toast.success(`Coupon applied! Saved ₹${res.data.discount}`)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Invalid coupon')
      setCouponData(null)
    } finally { setCouponLoading(false) }
  }

  /* ---------- totals ---------- */
  const subtotal        = parseFloat(cart?.total || 0)
  const couponDiscount  = couponData ? parseFloat(couponData.discount) : 0
  const taxable         = Math.max(0, subtotal - couponDiscount)
  const tax             = parseFloat((taxable * 0.18).toFixed(2))
  const shipping        = subtotal >= 499 ? 0 : 49
  const total           = (taxable + tax + shipping).toFixed(2)
  const items           = cart?.items?.filter(i => !i.saved_for_later) || []

  /* ---------- place order ---------- */
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      setShowAddrForm(true)
      return
    }
    if (!items.length) { toast.error('Your cart is empty'); return }
    const res = await dispatch(placeOrder({
      address_id:     selectedAddress,
      payment_method: paymentMethod,
      coupon_code:    coupon.trim().toUpperCase(),
    }))
    if (!res.error) navigate(`/orders/${res.payload.order_id}`)
  }

  /* ---------- render ---------- */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Checkout</h1>
      <p className="text-gray-500 text-sm mb-8">
        {user?.first_name}, review your order before placing.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* STEP 1 — Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <FiMapPin className="text-purple-600" /> Delivery Address
              </h2>
              <button
                onClick={() => { setShowAddrForm(v => !v); setAddrForm(BLANK_ADDR) }}
                className="flex items-center gap-1.5 text-sm text-purple-700 font-medium hover:underline"
              >
                <FiPlus size={14} /> Add New
              </button>
            </div>

            {/* Existing addresses */}
            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      selectedAddress === addr.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <input
                      type="radio" name="address" value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => { setSelectedAddress(addr.id); setShowAddrForm(false) }}
                      className="mt-1 accent-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {addr.name}
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                          {addr.address_type}
                        </span>
                        {addr.is_default && (
                          <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                    </div>
                    {selectedAddress === addr.id && (
                      <FiCheck className="text-purple-600 mt-1 flex-shrink-0" size={16} />
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* Inline add-address form */}
            {(showAddrForm || addresses.length === 0) && (
              <form onSubmit={saveAddress} className="border-2 border-dashed border-purple-200 rounded-xl p-4 bg-purple-50/40 space-y-3">
                <p className="text-sm font-semibold text-purple-700 mb-1">
                  {addresses.length === 0 ? '📦 Add your first address to continue' : '+ New Address'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Full Name *</label>
                    <input required value={addrForm.name} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })}
                      className="input text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Phone *</label>
                    <input required value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })}
                      className="input text-sm" placeholder="9876543210" maxLength={15} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Address Line 1 *</label>
                  <input required value={addrForm.address_line1} onChange={e => setAddrForm({ ...addrForm, address_line1: e.target.value })}
                    className="input text-sm" placeholder="House No., Street, Area" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Address Line 2</label>
                  <input value={addrForm.address_line2} onChange={e => setAddrForm({ ...addrForm, address_line2: e.target.value })}
                    className="input text-sm" placeholder="Landmark (optional)" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">City *</label>
                    <input required value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                      className="input text-sm" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">State *</label>
                    <input required value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                      className="input text-sm" placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Pincode *</label>
                    <input required value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })}
                      className="input text-sm" placeholder="400001" maxLength={10} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <select value={addrForm.address_type} onChange={e => setAddrForm({ ...addrForm, address_type: e.target.value })}
                      className="input text-sm w-28">
                      <option value="home">🏠 Home</option>
                      <option value="work">💼 Work</option>
                      <option value="other">📍 Other</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={addrForm.is_default}
                        onChange={e => setAddrForm({ ...addrForm, is_default: e.target.checked })}
                        className="accent-purple-600" />
                      Set as default
                    </label>
                  </div>
                  <div className="flex gap-2">
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => setShowAddrForm(false)}
                        className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                    )}
                    <button type="submit" disabled={addrSaving}
                      className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 font-medium">
                      {addrSaving ? 'Saving…' : 'Save Address'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2 — Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-base flex items-center gap-2 mb-4">
              <FiCreditCard className="text-purple-600" /> Payment Method
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map(pm => (
                <label
                  key={pm.id}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer border-2 transition-all text-center ${
                    paymentMethod === pm.id
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <input type="radio" name="payment" value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)} className="hidden" />
                  <span className="text-2xl">{pm.icon}</span>
                  <span className="text-xs font-medium leading-tight">{pm.label}</span>
                  {paymentMethod === pm.id && (
                    <FiCheck size={12} className="text-purple-600" />
                  )}
                </label>
              ))}
            </div>

            {/* COD note */}
            {paymentMethod === 'cod' && (
              <p className="mt-3 text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                💡 Pay with cash when your order is delivered. No advance payment needed.
              </p>
            )}
            {paymentMethod !== 'cod' && paymentMethod !== 'card' && paymentMethod !== 'netbanking' && (
              <p className="mt-3 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                📲 You will be redirected to complete payment after placing the order.
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN — Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-base flex items-center gap-2 mb-4">
              <FiShoppingBag className="text-purple-600" /> Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex gap-2 items-center">
                  <img
                    src={item.product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=48&q=60'}
                    alt={item.product.name}
                    className="w-11 h-11 object-cover rounded-lg bg-gray-50 flex-shrink-0 border"
                    onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=48&q=60' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0">₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {!items.length && (
                <p className="text-sm text-gray-400 text-center py-4">Cart is empty</p>
              )}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-3">
              <input
                value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                placeholder="Enter coupon code"
                className="input text-sm flex-1 uppercase tracking-widest font-mono"
              />
              <button onClick={applyCoupon} disabled={couponLoading}
                className="px-3 py-2 border border-purple-400 text-purple-700 text-sm rounded-lg hover:bg-purple-50 font-medium disabled:opacity-50">
                {couponLoading ? '…' : 'Apply'}
              </button>
            </div>
            {couponData && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 text-xs">
                <FiCheck size={12} /> Saved ₹{couponData.discount} with <strong>{couponData.code}</strong>
              </div>
            )}
            {/* Quick coupon suggestions */}
            {!couponData && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1.5">Available coupons:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['WELCOME10','NOVA50','SHOP20','TECH15','FLASH25','FREEDEL'].map(c => (
                    <button key={c} onClick={() => { setCoupon(c); }}
                      className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full hover:bg-purple-100 font-mono">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm border-t pt-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span>
                  <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">GST (18%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping === 0 && subtotal > 0 && (
                <p className="text-xs text-green-600">🎉 Free delivery on orders above ₹499</p>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                <span>Total Payable</span>
                <span className="text-purple-700">₹{Number(total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !items.length}
              className="w-full py-3 rounded-xl font-bold text-white text-base transition-all
                bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900
                disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading
                ? '⏳ Placing Order…'
                : `🛒 Place Order • ₹${Number(total).toLocaleString('en-IN')}`}
            </button>

            <p className="text-xs text-center text-gray-400 mt-3">
              🔒 Secure checkout. Your data is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
