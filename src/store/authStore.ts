import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { siteConfig } from '@/config/site';
import { sleep } from '@/lib/utils';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email, password) => {
        // Simulated network request so the login button shows a loading state
        await sleep(900);
        const { demoAdmin } = siteConfig;
        const valid = email.trim().toLowerCase() === demoAdmin.email && password === demoAdmin.password;
        if (valid) {
          set({ isAuthenticated: true, user: { name: demoAdmin.name, email: demoAdmin.email } });
        }
        return valid;
      },

      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: 'mk-auth' },
  ),
);
