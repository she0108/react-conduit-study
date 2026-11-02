import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,

      setToken(token) {
        set({ token });
      },

      logout() {
        set({ token: null });
      },

      handleAuthError(error) {
        if (error.status === 401) get().logout();
      },
    }),
    {
      name: "conduit-auth",
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
