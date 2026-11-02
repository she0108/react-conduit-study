import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "./stores/authStore.js";

// 토큰이 있는 요청의 401만 만료로 본다. 로그인 실패 401에는 토큰이 없다.
function handleAuthError(error) {
  const { token, logout } = useAuthStore.getState();

  if (error.status === 401 && token) logout();
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthError }),
  mutationCache: new MutationCache({ onError: handleAuthError }),
  defaultOptions: { queries: { retry: false } },
});

export function saveSession(user) {
  queryClient.setQueryData(["user", user.token], { user });
  useAuthStore.getState().setToken(user.token);
}
