import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      saveSession(user) {
        set({ token: user.token, user });
      },

      logout() {
        set({ token: null, user: null, error: null });
      },

      handleAuthError(error) {
        if (error.status === 401) get().logout();
      },
    }),
    {
      name: "conduit-auth",
      // 사용자 정보는 저장하지 않고 시작할 때 토큰으로 다시 조회한다.
      partialize: (state) => ({ token: state.token }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        loading: Boolean(persisted?.token),
      }),
    },
  ),
);
