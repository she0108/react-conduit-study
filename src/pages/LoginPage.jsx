import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { login } from "../apis/auth.js";
import { useAuthStore } from "../stores/authStore.js";
import { emailRules } from "../utils/formRules.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";
import FieldError from "../components/common/FieldError.jsx";

export default function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const saveSession = useAuthStore((state) => state.saveSession);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [error, setError] = useState(null);

  const from = location.state?.from || "/";

  if (user) return <Navigate to={from} replace />;

  async function onSubmit({ email, password }) {
    setError(null);

    try {
      const data = await login({ email: email.trim(), password });

      saveSession(data.user);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error);
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
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <label>
            이메일
            <input
              type="email"
              autoComplete="email"
              {...register("email", emailRules)}
            />
          </label>
          <FieldError error={errors.email} />
          <label>
            비밀번호
            <input
              type="password"
              autoComplete="current-password"
              {...register("password", {
                required: "비밀번호를 입력해 주세요.",
              })}
            />
          </label>
          <FieldError error={errors.password} />
          <button className="primary" type="submit">
            {isSubmitting ? "로그인 중…" : "로그인"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
