import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";

import { deleteComment } from "../../apis/comments.js";
import { queryClient } from "../../queryClient.js";
import { useAuthStore } from "../../stores/authStore.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Avatar from "../user/Avatar.jsx";
import ErrorMessages from "../common/ErrorMessages.jsx";
import { formatDate } from "../../utils/formatDate.js";

import styles from "./Comments.module.css";

export default function CommentList({ slug, comments }) {
  return (
    <div>
      {comments.length ? (
        comments.map((comment) => (
          <Comment key={comment.id} slug={slug} comment={comment} />
        ))
      ) : (
        <p className="muted">아직 댓글이 없습니다. 첫 생각을 남겨 주세요.</p>
      )}
    </div>
  );
}

function Comment({ slug, comment }) {
  const { user } = useCurrentUser();
  const token = useAuthStore((state) => state.token);

  const mutation = useMutation({
    mutationFn: () => deleteComment(slug, comment.id),
    onSuccess: () => {
      queryClient.setQueryData(["comments", slug, token], (previous) => ({
        comments: previous.comments.filter((item) => item.id !== comment.id),
      }));
    },
  });

  function handleDelete() {
    if (window.confirm("이 댓글을 삭제할까요?")) mutation.mutate();
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
          <button
            className="danger"
            disabled={mutation.isPending}
            onClick={handleDelete}
          >
            {mutation.isPending ? "삭제 중…" : "댓글 삭제"}
          </button>
        )}
      </footer>
      <ErrorMessages error={mutation.error} />
    </article>
  );
}
