import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateUser } from "../apis/auth.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLogoutToHome } from "../hooks/useLogoutToHome.js";
import { emailRules, notBlank } from "../utils/formRules.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";
import FieldError from "../components/common/FieldError.jsx";

function toSettingsForm(user) {
  return {
    image: user.image || "",
    username: user.username,
    bio: user.bio || "",
    email: user.email,
    password: "",
  };
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const saveSession = useAuthStore((state) => state.saveSession);
  const handleAuthError = useAuthStore((state) => state.handleAuthError);
  const logoutToHome = useLogoutToHome();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ defaultValues: toSettingsForm(user) });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit({ image, username, bio, email, password }) {
    setError(null);
    setSaved(false);
    const payload = {
      image: image.trim(),
      username: username.trim(),
      bio: bio.trim(),
      email: email.trim(),
      ...(password ? { password } : {}),
    };

    const token = useAuthStore.getState().token;

    try {
      const { user: updatedUser } = await updateUser(payload);

      // 저장 중 로그아웃했거나 계정이 바뀌었다면 늦은 응답으로 세션을 되살리지 않는다.
      if (useAuthStore.getState().token !== token) return;

      saveSession(updatedUser);
      reset(toSettingsForm(updatedUser));
      setSaved(true);
    } catch (error) {
      handleAuthError(error);
      setError(error);
    }
  }

  return (
    <section className="formPage">
      <h1>내 설정</h1>
      <ErrorMessages error={error} />
      {saved && !isDirty && <p role="status">설정을 저장했습니다.</p>}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <label>
            프로필 이미지 URL
            <input
              type="url"
              placeholder="https://example.com/avatar.png"
              {...register("image", {
                pattern: {
                  value: /^\s*https?:\/\/\S+\s*$/,
                  message: "http 또는 https로 시작하는 주소를 입력해 주세요.",
                },
              })}
            />
          </label>
          <FieldError error={errors.image} />
          <label>
            사용자 이름
            <input
              autoComplete="username"
              {...register("username", notBlank("이름을 입력해 주세요."))}
            />
          </label>
          <FieldError error={errors.username} />
          <label>
            소개
            <textarea rows={4} {...register("bio")} />
          </label>
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
            새 비밀번호
            <input
              type="password"
              autoComplete="new-password"
              aria-describedby="password-help"
              {...register("password")}
            />
          </label>
          <small id="password-help" className="muted">
            비워 두면 기존 비밀번호를 유지합니다.
          </small>
          <button className="primary" type="submit">
            {isSubmitting ? "저장 중…" : "설정 저장"}
          </button>
        </fieldset>
      </form>
      <hr />
      <button className="danger" disabled={isSubmitting} onClick={logoutToHome}>
        로그아웃
      </button>
    </section>
  );
}
