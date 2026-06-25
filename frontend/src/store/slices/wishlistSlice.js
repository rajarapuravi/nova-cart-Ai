import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await api.get('/wishlist/')
  return res.data
})

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (product_id) => {
  const res = await api.post('/wishlist/toggle/', { product_id })
  toast.success(res.data.in_wishlist ? 'Added to wishlist!' : 'Removed from wishlist')
  return res.data
})

export const moveToCart = createAsyncThunk('wishlist/moveToCart', async (item_id) => {
  await api.post(`/wishlist/move-to-cart/${item_id}/`)
  const res = await api.get('/wishlist/')
  toast.success('Moved to cart!')
  return res.data
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { data: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled, (s, a) => { s.data = a.payload })
    b.addCase(moveToCart.fulfilled, (s, a) => { s.data = a.payload })
  }
})
export default wishlistSlice.reducer
