import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router";

import { register as registerUser } from "../apis/auth.js";
import { saveSession } from "../queryClient.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { emailRules, notBlank } from "../utils/formRules.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";
import FieldError from "../components/common/FieldError.jsx";

export default function RegisterPage() {
  const { user } = useCurrentUser();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => saveSession(data.user),
  });

  const from = location.state?.from || "/";

  if (user) return <Navigate to={from} replace />;

  function onSubmit({ username, email, password }) {
    mutation.mutate({
      username: username.trim(),
      email: email.trim(),
      password,
    });
  }

  return (
    <section className="formPage">
      <h1>회원가입</h1>
      <p>
        <Link to="/login" state={{ from }}>
          이미 계정이 있으신가요?
        </Link>
      </p>
      <ErrorMessages error={mutation.error} />
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={mutation.isPending}>
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
            {mutation.isPending ? "가입 중…" : "회원가입"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
