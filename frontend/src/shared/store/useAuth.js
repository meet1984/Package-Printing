import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuth = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
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

      if (response.data.user?.role === 'admin') {
        sessionStorage.setItem('admin_session_active', 'true');
      }

      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        token: true,
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
      const user = response.data.user;

      if (user && user.role === 'admin' && !sessionStorage.getItem('admin_session_active')) {
        try {
          await axios.post(`${API_URL}/users/logout`);
        } catch (e) {
          console.error('Logout on expired admin session error', e);
        }
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null,
          loading: false 
        });
        return;
      }

      set({ 
        user: user, 
        isAuthenticated: !!user, 
        token: !!user,
        loading: false 
      });
    } catch (err) {
      set({ user: null, isAuthenticated: false, token: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/users/logout`);
    } catch (error) {
      console.error('Logout error', error);
    }
    sessionStorage.removeItem('admin_session_active');
    set({ user: null, isAuthenticated: false, token: null });
  }
}));
