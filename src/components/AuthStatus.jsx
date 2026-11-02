import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "./ErrorMessages.jsx";

export default function AuthStatus({ children }) {
  const { loading, error, logout } = useAuth();

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
