import { useNavigate } from "react-router";

import { useAuthStore } from "../stores/authStore.js";

export function useLogoutToHome() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return function logoutToHome() {
    // 인증 해제와 홈 이동을 한 이벤트에서 함께 반영해 보호 경로의 로그인 이동과 충돌하지 않게 한다.
    // Zustand 변경은 transition으로 미룰 수 없어 main.jsx에서 라우터의 useTransitions를 끈다.
    logout();
    navigate("/", { replace: true });
  };
}
