import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await api.get('/cart/')
  return res.data
})

export const addToCart = createAsyncThunk('cart/add', async (data) => {
  const res = await api.post('/cart/add/', data)
  toast.success('Added to cart!')
  return res.data
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ id, quantity }) => {
  const res = await api.patch(`/cart/item/${id}/update/`, { quantity })
  return res.data
})

export const removeCartItem = createAsyncThunk('cart/remove', async (id) => {
  const res = await api.delete(`/cart/item/${id}/remove/`)
  toast.success('Item removed')
  return res.data
})

export const clearCart = createAsyncThunk('cart/clear', async () => {
  await api.delete('/cart/clear/')
  return { items: [], total: 0, item_count: 0 }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { data: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.loading = true })
    b.addCase(fetchCart.fulfilled, (s, a) => { s.data = a.payload; s.loading = false })
    b.addCase(addToCart.fulfilled, (s, a) => { s.data = a.payload })
    b.addCase(updateCartItem.fulfilled, (s, a) => { s.data = a.payload })
    b.addCase(removeCartItem.fulfilled, (s, a) => { s.data = a.payload })
    b.addCase(clearCart.fulfilled, (s, a) => { s.data = a.payload })
  }
})
export default cartSlice.reducer
