import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../../store/slices/orderSlice'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Orders() {
  const dispatch = useDispatch()
  const { list } = useSelector(s => s.orders)

  useEffect(() => { dispatch(fetchOrders()) }, [])

  if (!list.length) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">📦</p>
      <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
      <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {list.map(order => (
          <div key={order.id} className="card p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div>
                <p className="font-bold">{order.order_id}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-700'} px-3 py-1 capitalize`}>{order.status.replace('_', ' ')}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto mb-3">
              {order.items?.slice(0,4).map(item => (
                <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <img src={item.product_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=60'}
                    alt=""
                    className="w-10 h-10 object-cover rounded"
                    onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=60' }} />
                  <div>
                    <p className="text-xs font-medium line-clamp-1 w-28">{item.product_name}</p>
                    <p className="text-xs text-gray-500">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
              <div className="flex gap-2">
                <Link to={`/orders/${order.order_id}`} className="btn-secondary text-sm py-1 px-3">View Details</Link>
                <a href={`/api/orders/${order.order_id}/invoice/`} target="_blank" rel="noreferrer"
                  className="text-sm text-purple-600 hover:underline py-1 px-2">Invoice</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
