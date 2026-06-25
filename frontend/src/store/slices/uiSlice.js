import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    searchOpen: false,
    aiOpen: false,
    mobileMenuOpen: false,
  },
  reducers: {
    toggleCart: (s) => { s.cartOpen = !s.cartOpen },
    toggleSearch: (s) => { s.searchOpen = !s.searchOpen },
    toggleAI: (s) => { s.aiOpen = !s.aiOpen },
    toggleMobileMenu: (s) => { s.mobileMenuOpen = !s.mobileMenuOpen },
    closeAll: (s) => { s.cartOpen = false; s.searchOpen = false; s.aiOpen = false; s.mobileMenuOpen = false },
  }
})
export const { toggleCart, toggleSearch, toggleAI, toggleMobileMenu, closeAll } = uiSlice.actions
export default uiSlice.reducer
