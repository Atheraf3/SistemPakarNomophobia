import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Konfigurasi agar browser selalu mengirim cookie HTTP-only
axios.defaults.withCredentials = true;

// Set default header if token exists in localStorage (useful on hard refresh)
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,

      register: async (name, email, password, age) => {
        try {
          await axios.post('http://localhost:5151/api/auth/register', { name, email, password, age });
          return true;
        } catch (error) {
          console.error("Register failed:", error);
          throw error;
        }
      },

      login: async (email, password) => {
        try {
          const response = await axios.post('http://localhost:5151/api/auth/login', { email, password });
          
          // Response JSON baru: { success: true, message: '...', data: { accessToken, user } }
          const { accessToken, user } = response.data.data;
          
          if (accessToken) {
            localStorage.setItem('token', accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          }

          set({ user, isAuthenticated: true, role: user.role });
          return true;
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await axios.post('http://localhost:5151/api/auth/logout');
        } catch (error) {
          console.error("Logout API failed:", error);
        } finally {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          set({ user: null, isAuthenticated: false, role: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage', // key in localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, role: state.role }),
    }
  )
);
