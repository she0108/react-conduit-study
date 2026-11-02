import { useState } from "react";

import { createComment } from "../../apis/comments.js";
import { useAuth } from "../../hooks/useAuth.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

import styles from "./Comments.module.css";

export default function CommentForm({ slug, onCreated }) {
  const { handleAuthError } = useAuth();

  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!body.trim()) {
      setError("댓글 내용을 입력해 주세요.");
      return;
    }

    setError(null);
    setPending(true);

    try {
      const { comment } = await createComment(slug, body.trim());

      onCreated(comment);
      setBody("");
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <ErrorMessages error={error} />
      <fieldset disabled={pending}>
        <label>
          댓글 작성
          <textarea
            rows={4}
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="이 글에 대한 생각을 나눠 주세요."
          />
        </label>
        <button className="primary" type="submit">
          {pending ? "등록 중…" : "댓글 등록"}
        </button>
      </fieldset>
    </form>
  );
}
