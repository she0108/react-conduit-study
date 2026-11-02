import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router";

import { login } from "../apis/auth.js";
import { saveSession } from "../queryClient.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { emailRules } from "../utils/formRules.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";
import FieldError from "../components/common/FieldError.jsx";

export default function LoginPage() {
  const { user } = useCurrentUser();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => saveSession(data.user),
  });

  const from = location.state?.from || "/";

  if (user) return <Navigate to={from} replace />;

  function onSubmit({ email, password }) {
    mutation.mutate({ email: email.trim(), password });
  }

  return (
    <section className="formPage">
      <h1>로그인</h1>
      <p>
        <Link to="/register" state={{ from }}>
          계정이 없으신가요?
        </Link>
      </p>
      <ErrorMessages error={mutation.error} />
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={mutation.isPending}>
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
            {mutation.isPending ? "로그인 중…" : "로그인"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
