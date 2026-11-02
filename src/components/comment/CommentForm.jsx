import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { createComment } from "../../apis/comments.js";
import { queryClient } from "../../queryClient.js";
import { useAuthStore } from "../../stores/authStore.js";
import { notBlank } from "../../utils/formRules.js";
import ErrorMessages from "../common/ErrorMessages.jsx";
import FieldError from "../common/FieldError.jsx";

import styles from "./Comments.module.css";

export default function CommentForm({ slug }) {
  const token = useAuthStore((state) => state.token);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const mutation = useMutation({
    mutationFn: (body) => createComment(slug, body),
    onSuccess: ({ comment }) => {
      queryClient.setQueryData(["comments", slug, token], (previous) => ({
        comments: [...previous.comments, comment],
      }));
      reset();
    },
  });

  function onSubmit({ body }) {
    mutation.mutate(body.trim());
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
      <ErrorMessages error={mutation.error} />
      <fieldset disabled={mutation.isPending}>
        <label>
          댓글 작성
          <textarea
            rows={4}
            placeholder="이 글에 대한 생각을 나눠 주세요."
            {...register("body", notBlank("댓글 내용을 입력해 주세요."))}
          />
        </label>
        <FieldError error={errors.body} />
        <button className="primary" type="submit">
          {mutation.isPending ? "등록 중…" : "댓글 등록"}
        </button>
      </fieldset>
    </form>
  );
}
