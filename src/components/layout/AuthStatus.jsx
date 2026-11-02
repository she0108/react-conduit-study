import { useEffect } from "react";

import { getCurrentUser } from "../../apis/auth.js";
import { useAuthStore } from "../../stores/authStore.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function AuthStatus({ children }) {
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!useAuthStore.getState().token) return;

    let ignore = false;

    getCurrentUser()
      .then((data) => {
        if (!ignore) useAuthStore.setState({ user: data.user, loading: false });
      })
      .catch((error) => {
        if (ignore) return;

        // 만료된 토큰은 지우고, 일시적인 실패는 토큰을 유지한 채 오류를 보여 준다.
        if (error.status === 401)
          useAuthStore.setState({ token: null, loading: false });
        else useAuthStore.setState({ error, loading: false });
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading)
    return (
      <div className="container status" role="status">
        로그인 정보를 확인하고 있습니다…
      </div>
    );

  if (error)
    return (
      <section className="container page">
        <h1>로그인 정보를 확인하지 못했습니다</h1>
        <ErrorMessages error={error} />
        <div className="actions">
          <button onClick={() => window.location.reload()}>다시 시도</button>
          <button onClick={logout}>로그인 정보 지우기</button>
        </div>
      </section>
    );

  return children;
}
