import { create } from 'zustand';

// Dummy credentials untuk testing UI
const DUMMY_ACCOUNTS = {
  admin: {
    id: 1,
    name: 'Admin Sistem',
    email: 'admin@test.com',
    role: 'admin',
  },
  user: {
    id: 2,
    name: 'User Skripsi',
    email: 'user@test.com',
    role: 'user',
  }
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,

  login: (email, password) => {
    // Simulasi frontend verification (tanpa backend)
    // Password diabaikan untuk testing saat ini jika email cocok dengan dummy
    if (email === DUMMY_ACCOUNTS.admin.email) {
      set({ user: DUMMY_ACCOUNTS.admin, isAuthenticated: true, role: 'admin' });
      return true;
    } else if (email === DUMMY_ACCOUNTS.user.email) {
      set({ user: DUMMY_ACCOUNTS.user, isAuthenticated: true, role: 'user' });
      return true;
    }
    
    // Jika tidak cocok, tolak
    return false;
  },

  logout: () => set({ user: null, isAuthenticated: false, role: null }),
}));
