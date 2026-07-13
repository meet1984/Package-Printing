import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuth = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password, otp = null) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email, password, otp });
      
      if (response.data.requireOTP) {
        set({ loading: false });
        return { requireOTP: true };
      }

      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        loading: false 
      });
      return { success: true };
    } catch (err) {
      set({ 
        error: err.response?.data?.message || err.message, 
        loading: false 
      });
      return { success: false };
    }
  },

  loadUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/users/me`);
      set({ user: response.data, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/users/logout`);
    } catch (error) {
      console.error('Logout error', error);
    }
    set({ user: null, isAuthenticated: false });
  }
}));
