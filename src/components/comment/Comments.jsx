import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { getComments } from "../../apis/comments.js";
import { useAuthStore } from "../../stores/authStore.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import CommentForm from "./CommentForm.jsx";
import CommentList from "./CommentList.jsx";
import ErrorMessages from "../common/ErrorMessages.jsx";

import styles from "./Comments.module.css";

export default function Comments({ slug }) {
  const { user } = useCurrentUser();
  const token = useAuthStore((state) => state.token);

  const { data, error, isPending } = useQuery({
    queryKey: ["comments", slug, token],
    queryFn: () => getComments(slug),
  });

  return (
    <section className={styles.section} aria-label="댓글">
      <h2>댓글</h2>
      {error ? (
        <ErrorMessages error={error} />
      ) : isPending ? (
        <p role="status">댓글을 불러오고 있습니다…</p>
      ) : (
        <>
          {user ? (
            <CommentForm slug={slug} />
          ) : (
            <p>
              <Link to="/login">로그인</Link> 후 댓글을 남겨 보세요.
            </p>
          )}
          <CommentList slug={slug} comments={data.comments} />
        </>
      )}
    </section>
  );
}
