import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { updateUser } from "../apis/auth.js";
import { queryClient, saveSession } from "../queryClient.js";
import { useAuthStore } from "../stores/authStore.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
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
  const { user } = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: toSettingsForm(user) });
  const mutation = useMutation({
    mutationFn: updateUser,
    onMutate: () => ({ token: useAuthStore.getState().token }),
    onSuccess: ({ user: updatedUser }, _variables, { token }) => {
      // 저장 중 로그아웃했거나 계정이 바뀌었다면 늦은 응답으로 세션을 되살리지 않는다.
      if (useAuthStore.getState().token !== token) return;

      saveSession(updatedUser);
      reset(toSettingsForm(updatedUser));
      // 이름과 이미지는 글·댓글·프로필 응답에도 들어 있으므로 모두 다시 조회한다.
      queryClient.invalidateQueries();
    },
  });

  function onSubmit({ image, username, bio, email, password }) {
    mutation.mutate({
      image: image.trim(),
      username: username.trim(),
      bio: bio.trim(),
      email: email.trim(),
      ...(password ? { password } : {}),
    });
  }

  return (
    <section className="formPage">
      <h1>내 설정</h1>
      <ErrorMessages error={mutation.error} />
      {mutation.isSuccess && !isDirty && (
        <p role="status">설정을 저장했습니다.</p>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={mutation.isPending}>
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
            {mutation.isPending ? "저장 중…" : "설정 저장"}
          </button>
        </fieldset>
      </form>
      <hr />
      <button className="danger" disabled={mutation.isPending} onClick={logout}>
        로그아웃
      </button>
    </section>
  );
}
