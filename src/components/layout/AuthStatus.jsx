import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import { useAuthStore } from "../../stores/authStore.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function AuthStatus({ children }) {
  const { isLoading, error, refetch } = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);

  if (isLoading)
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
          <button onClick={() => refetch()}>다시 시도</button>
          <button onClick={logout}>로그인 정보 지우기</button>
        </div>
      </section>
    );

  return children;
}
