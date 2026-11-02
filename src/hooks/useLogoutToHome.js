import { useNavigate } from "react-router";

import { useAuth } from "./useAuth.js";

export function useLogoutToHome() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return function logoutToHome() {
    // 인증 해제와 홈 이동을 한 이벤트에서 함께 반영해 보호 경로의 로그인 이동과 충돌하지 않게 한다.
    // 라우터가 이동을 transition으로 미루지 않도록 main.jsx에서 useTransitions를 끈다.
    logout();
    navigate("/", { replace: true });
  };
}
