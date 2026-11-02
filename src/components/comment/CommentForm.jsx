import { useState } from "react";
import { useForm } from "react-hook-form";

import { createComment } from "../../apis/comments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { notBlank } from "../../utils/formRules.js";
import ErrorMessages from "../common/ErrorMessages.jsx";
import FieldError from "../common/FieldError.jsx";

import styles from "./Comments.module.css";

export default function CommentForm({ slug, onCreated }) {
  const { handleAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const [error, setError] = useState(null);

  async function onSubmit({ body }) {
    setError(null);

    try {
      const { comment } = await createComment(slug, body.trim());

      onCreated(comment);
      reset();
    } catch (error) {
      handleAuthError(error);
      setError(error);
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
      <ErrorMessages error={error} />
      <fieldset disabled={isSubmitting}>
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
          {isSubmitting ? "등록 중…" : "댓글 등록"}
        </button>
      </fieldset>
    </form>
  );
}
