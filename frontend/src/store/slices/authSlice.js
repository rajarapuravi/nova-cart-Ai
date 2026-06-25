import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login/', data)
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { error: 'Login failed' })
  }
})

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register/', data)
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { error: 'Registration failed' })
  }
})

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/profile/')
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data)
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const refresh = localStorage.getItem('refresh')
    await api.post('/auth/logout/', { refresh })
  } catch (_) {}
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem('access'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser: (state, action) => { state.user = action.payload; state.isAuthenticated = true },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.isAuthenticated = true
        toast.success('Welcome back!')
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
        toast.error(action.payload?.non_field_errors?.[0] || 'Login failed')
      })
      .addCase(register.pending, (state) => { state.loading = true })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user; state.isAuthenticated = true
        toast.success('Account created!')
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
        toast.error('Registration failed')
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload; state.isAuthenticated = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isAuthenticated = false; state.user = null
        localStorage.removeItem('access'); localStorage.removeItem('refresh')
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.isAuthenticated = false
        toast.success('Logged out')
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
