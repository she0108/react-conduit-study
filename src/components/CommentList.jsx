import { useState } from "react";
import { Link } from "react-router";

import { deleteComment } from "../apis/comments.js";
import { useAuth } from "../hooks/useAuth.js";
import Avatar from "./Avatar.jsx";
import ErrorMessages from "./ErrorMessages.jsx";
import { formatDate } from "../utils/formatDate.js";

import styles from "./Comments.module.css";

export default function CommentList({ slug, comments, onDeleted }) {
  return (
    <div>
      {comments.length ? (
        comments.map((comment) => (
          <Comment
            key={comment.id}
            slug={slug}
            comment={comment}
            onDeleted={onDeleted}
          />
        ))
      ) : (
        <p className="muted">아직 댓글이 없습니다. 첫 생각을 남겨 주세요.</p>
      )}
    </div>
  );
}

function Comment({ slug, comment, onDeleted }) {
  const { user, handleAuthError } = useAuth();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    if (pending || !window.confirm("이 댓글을 삭제할까요?")) return;

    setPending(true);
    setError(null);

    try {
      await deleteComment(slug, comment.id);
      onDeleted(comment.id);
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className={styles.comment}>
      <p>{comment.body}</p>
      <footer>
        <Link to={`/profile/${encodeURIComponent(comment.author.username)}`}>
          <Avatar image={comment.author.image} size={24} />
          {comment.author.username}
        </Link>
        <time dateTime={comment.createdAt}>
          {formatDate(comment.createdAt)}
        </time>
        {user?.username === comment.author.username && (
          <button className="danger" disabled={pending} onClick={handleDelete}>
            {pending ? "삭제 중…" : "댓글 삭제"}
          </button>
        )}
      </footer>
      <ErrorMessages error={error} />
    </article>
  );
}
