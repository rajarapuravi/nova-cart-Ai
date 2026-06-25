import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { cancelOrder } from '../../store/slices/orderSlice'
import api from '../../api/axios'
import { FiDownload, FiX } from 'react-icons/fi'

const STEPS = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

export default function OrderDetail() {
  const { order_id } = useParams()
  const dispatch = useDispatch()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${order_id}/`).then(r => setOrder(r.data))
  }, [order_id])

  if (!order) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-64 animate-pulse bg-gray-100 rounded-xl" /></div>

  const statusIndex = { pending: 0, confirmed: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5 }
  const currentStep = statusIndex[order.status] ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Order #{order.order_id}</h1>
        <div className="flex gap-2">
          <a href={`/api/orders/${order.order_id}/invoice/`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 btn-secondary text-sm py-1.5 px-3">
            <FiDownload size={14} /> Invoice
          </a>
          {['pending','confirmed'].includes(order.status) && (
            <button onClick={() => dispatch(cancelOrder(order.order_id))}
              className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50">
              <FiX size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Tracking */}
      {order.status !== 'cancelled' && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Order Tracking</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center ${i <= currentStep ? 'text-purple-700 font-medium' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < currentStep ? 'bg-purple-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3 items-center">
              <img src={item.product_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=60'}
                alt=""
                className="w-14 h-14 object-cover rounded bg-gray-50"
                onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&q=60' }} />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-500">×{item.quantity} @ ₹{Number(item.unit_price).toLocaleString('en-IN')}</p>
              </div>
              <p className="font-bold text-sm">₹{Number(item.total_price).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-5 grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-3">Delivery Address</h2>
          <p className="text-sm font-medium">{order.shipping_name}</p>
          <p className="text-sm text-gray-600">{order.shipping_address}</p>
          <p className="text-sm text-gray-600">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
          <p className="text-sm text-gray-500">{order.shipping_phone}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-3">Payment</h2>
          <p className="text-sm capitalize text-gray-700">Method: {order.payment_method?.replace('_',' ')}</p>
          <p className="text-sm text-gray-700">Status: <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</span></p>
          <div className="border-t mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
            {order.coupon_discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-₹{order.coupon_discount}</span></div>}
            <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>₹{Number(order.tax_amount).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold"><span>Total</span><span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
