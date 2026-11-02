import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../apis/auth.js";
import { useAuthStore } from "../stores/authStore.js";

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);

  // 사용자 정보는 로그인·설정 저장 때만 바뀌므로 화면마다 다시 조회하지 않는다.
  const query = useQuery({
    queryKey: ["user", token],
    queryFn: getCurrentUser,
    enabled: Boolean(token),
    staleTime: Infinity,
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
