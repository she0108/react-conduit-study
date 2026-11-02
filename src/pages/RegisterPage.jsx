import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { register } from "../apis/auth.js";
import { useAuth } from "../hooks/useAuth.js";
import { getReturnPath } from "../utils/returnPath.js";
import ErrorMessages from "../components/ErrorMessages.jsx";

export default function RegisterPage() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const from = getReturnPath(location.state?.from);

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event) {
    event.preventDefault();

    if (pending) return;

    if (!username.trim() || !email.trim() || !password) {
      setError("이름, 이메일, 비밀번호를 입력해 주세요.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const data = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setUser(data.user);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="formPage">
      <h1>회원가입</h1>
      <p>
        <Link to="/login" state={{ from }}>
          이미 계정이 있으신가요?
        </Link>
      </p>
      <ErrorMessages error={error} />
      <form onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <label>
            사용자 이름
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="primary" type="submit">
            {pending ? "가입 중…" : "회원가입"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
