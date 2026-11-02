import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { login } from "../apis/auth.js";
import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";

export default function LoginPage() {
  const { user, saveSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const from = location.state?.from || "/";

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const data = await login({ email: email.trim(), password });

      saveSession(data.user);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="formPage">
      <h1>로그인</h1>
      <p>
        <Link to="/register" state={{ from }}>
          계정이 없으신가요?
        </Link>
      </p>
      <ErrorMessages error={error} />
      <form onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <label>
            이메일
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="primary" type="submit">
            {pending ? "로그인 중…" : "로그인"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
