import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Cookie HTTP-only
axios.defaults.withCredentials = true;

// Header if token exist
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const getApiUrl = (path) => import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${path}` : `http://localhost:5151/api${path}`;

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,

      register: async (name, email, password, age) => {
        try {
          await axios.post(getApiUrl('/auth/register'), { name, email, password, age });
          return true;
        } catch (error) {
          console.error("Register failed:", error);
          throw error;
        }
      },

      login: async (email, password) => {
        try {
          const response = await axios.post(getApiUrl('/auth/login'), { email, password });
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
          await axios.post(getApiUrl('/auth/logout'));
        } catch (error) {
          console.error("Logout API failed:", error);
        } finally {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          set({ user: null, isAuthenticated: false, role: null });
        }
      },

      setUser: (user) => set({ user }),

      fetchProfile: async () => {
        try {
          const response = await axios.get(getApiUrl('/auth/profile'));
          if (response.data.success) {
            set({ user: response.data.data });
          }
        } catch (error) {
          console.error("Gagal mengambil profil:", error);
        }
      },
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, role: state.role }),
    }
  )
);
