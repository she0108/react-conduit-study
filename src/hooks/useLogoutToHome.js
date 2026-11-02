import { startTransition } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "./useAuth.js";

export function useLogoutToHome() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return function logoutToHome() {
    // 인증 해제와 홈 이동을 함께 반영해 보호 경로의 로그인 이동과 충돌하지 않게 한다.
    startTransition(() => {
      logout();
      navigate("/", { replace: true });
    });
  };
}
