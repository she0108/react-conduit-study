import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { getComments } from "../apis/comments.js";
import { useAuth } from "../hooks/useAuth.js";
import CommentForm from "./CommentForm.jsx";
import CommentList from "./CommentList.jsx";
import ErrorMessages from "./ErrorMessages.jsx";

import styles from "./Comments.module.css";

export default function Comments({ slug }) {
  const { user, handleAuthError } = useAuth();
  const location = useLocation();

  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getComments(slug, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setComments(data.comments);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          handleAuthError(error);
          setError(error);
        }
      });

    return () => controller.abort();
  }, [slug, handleAuthError]);

  return (
    <section className={styles.section} aria-label="댓글">
      <h2>댓글</h2>
      {error ? (
        <ErrorMessages error={error} />
      ) : comments === null ? (
        <p role="status">댓글을 불러오고 있습니다…</p>
      ) : (
        <>
          {user ? (
            <CommentForm
              slug={slug}
              onCreated={(comment) =>
                setComments((previous) => [...previous, comment])
              }
            />
          ) : (
            <p>
              <Link
                to="/login"
                state={{ from: location.pathname + location.search }}
              >
                로그인
              </Link>{" "}
              후 댓글을 남겨 보세요.
            </p>
          )}
          <CommentList
            slug={slug}
            comments={comments}
            onDeleted={(id) =>
              setComments((previous) =>
                previous.filter((comment) => comment.id !== id),
              )
            }
          />
        </>
      )}
    </section>
  );
}
