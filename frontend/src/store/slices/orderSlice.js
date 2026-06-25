import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export const fetchOrders = createAsyncThunk('orders/list', async () => {
  const res = await api.get('/orders/')
  return res.data
})

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders/place/', data)
    toast.success('Order placed successfully!')
    return res.data
  } catch (e) {
    toast.error('Order failed')
    return rejectWithValue(e.response?.data)
  }
})

export const cancelOrder = createAsyncThunk('orders/cancel', async (order_id) => {
  const res = await api.post(`/orders/${order_id}/cancel/`)
  toast.success('Order cancelled')
  return order_id
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: { list: [], current: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchOrders.fulfilled, (s, a) => { s.list = a.payload })
    b.addCase(placeOrder.pending, (s) => { s.loading = true })
    b.addCase(placeOrder.fulfilled, (s, a) => { s.loading = false; s.current = a.payload })
    b.addCase(placeOrder.rejected, (s) => { s.loading = false })
    b.addCase(cancelOrder.fulfilled, (s, a) => {
      const o = s.list.find(x => x.order_id === a.payload)
      if (o) o.status = 'cancelled'
    })
  }
})
export default orderSlice.reducer
