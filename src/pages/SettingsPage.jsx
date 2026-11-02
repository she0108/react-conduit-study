import { startTransition, useState } from "react";
import { useNavigate } from "react-router";

import { updateUser } from "../apis/auth.js";
import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "../components/ErrorMessages.jsx";

export default function SettingsPage() {
  const { user, setUser, logout, handleAuthError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    image: user.image || "",
    username: user.username,
    bio: user.bio || "",
    email: user.email,
    password: "",
  });
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

    if (pending) return;

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

    try {
      const { user: updatedUser } = await updateUser(payload);

      if (!setUser(updatedUser, user.token)) return;

      setForm({
        image: updatedUser.image || "",
        username: updatedUser.username,
        bio: updatedUser.bio || "",
        email: updatedUser.email,
        password: "",
      });
      setSaved(true);
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  function handleLogout() {
    startTransition(() => {
      logout();
      navigate("/", { replace: true });
    });
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
      <button className="danger" disabled={pending} onClick={handleLogout}>
        로그아웃
      </button>
    </section>
  );
}
