import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { register as registerUser } from "../apis/auth.js";
import { useAuth } from "../hooks/useAuth.js";
import { emailRules, notBlank } from "../utils/formRules.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";
import FieldError from "../components/common/FieldError.jsx";

export default function RegisterPage() {
  const { user, saveSession } = useAuth();
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

  async function onSubmit({ username, email, password }) {
    setError(null);

    try {
      const data = await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      saveSession(data.user);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error);
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
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <label>
            사용자 이름
            <input
              autoComplete="username"
              {...register("username", notBlank("이름을 입력해 주세요."))}
            />
          </label>
          <FieldError error={errors.username} />
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
              autoComplete="new-password"
              {...register("password", {
                required: "비밀번호를 입력해 주세요.",
              })}
            />
          </label>
          <FieldError error={errors.password} />
          <button className="primary" type="submit">
            {isSubmitting ? "가입 중…" : "회원가입"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
