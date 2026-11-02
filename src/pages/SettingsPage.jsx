import { useState } from "react";

import { updateUser } from "../apis/auth.js";
import { useAuth } from "../hooks/useAuth.js";
import { useLogoutToHome } from "../hooks/useLogoutToHome.js";
import { getToken } from "../utils/authStorage.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";

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
  const { user, saveSession, handleAuthError } = useAuth();
  const logoutToHome = useLogoutToHome();

  const [form, setForm] = useState(() => toSettingsForm(user));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.username.trim() || !form.email.trim()) {
      setError("사용자 이름과 이메일을 입력해 주세요.");
      return;
    }

    setPending(true);
    setError(null);
    setSaved(false);
    const payload = {
      image: form.image.trim(),
      username: form.username.trim(),
      bio: form.bio.trim(),
      email: form.email.trim(),
      ...(form.password ? { password: form.password } : {}),
    };

    const token = getToken();

    try {
      const { user: updatedUser } = await updateUser(payload);

      // 저장 중 로그아웃했거나 계정이 바뀌었다면 늦은 응답으로 세션을 되살리지 않는다.
      if (getToken() !== token) return;

      saveSession(updatedUser);
      setForm(toSettingsForm(updatedUser));
      setSaved(true);
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="formPage">
      <h1>내 설정</h1>
      <ErrorMessages error={error} />
      {saved && <p role="status">설정을 저장했습니다.</p>}
      <form onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <label>
            프로필 이미지 URL
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/avatar.png"
            />
          </label>
          <label>
            사용자 이름
            <input
              name="username"
              autoComplete="username"
              required
              value={form.username}
              onChange={handleChange}
            />
          </label>
          <label>
            소개
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
            />
          </label>
          <label>
            이메일
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            새 비밀번호
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              aria-describedby="password-help"
            />
          </label>
          <small id="password-help" className="muted">
            비워 두면 기존 비밀번호를 유지합니다.
          </small>
          <button className="primary" type="submit">
            {pending ? "저장 중…" : "설정 저장"}
          </button>
        </fieldset>
      </form>
      <hr />
      <button className="danger" disabled={pending} onClick={logoutToHome}>
        로그아웃
      </button>
    </section>
  );
}
