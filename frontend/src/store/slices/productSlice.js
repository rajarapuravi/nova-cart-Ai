import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchHomeData = createAsyncThunk('products/home', async () => {
  const res = await api.get('/products/home/')
  return res.data
})

export const fetchProducts = createAsyncThunk('products/list', async (params = '') => {
  const res = await api.get(`/products/?${params}`)
  return res.data
})

export const fetchProduct = createAsyncThunk('products/detail', async (slug) => {
  const res = await api.get(`/products/${slug}/`)
  return res.data
})

export const fetchCategories = createAsyncThunk('products/categories', async () => {
  const res = await api.get('/products/categories/')
  return res.data
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    homeData: null, list: [], detail: null,
    categories: [], loading: false, error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchHomeData.fulfilled, (s, a) => { s.homeData = a.payload })
    b.addCase(fetchProducts.pending, (s) => { s.loading = true })
    b.addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
    b.addCase(fetchProducts.rejected, (s) => { s.loading = false })
    b.addCase(fetchProduct.pending, (s) => { s.loading = true; s.detail = null })
    b.addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.detail = a.payload })
    b.addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload })
  }
})
export default productSlice.reducer
