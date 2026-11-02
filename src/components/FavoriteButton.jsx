import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { favoriteArticle, unfavoriteArticle } from "../apis/articles.js";
import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "./ErrorMessages.jsx";

export default function FavoriteButton({ article, onFavoriteChange }) {
  const { user, handleAuthError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const { article: updated } = article.favorited
        ? await unfavoriteArticle(article.slug)
        : await favoriteArticle(article.slug);

      await onFavoriteChange(updated);
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className={article.favorited ? "primary" : ""}
        aria-pressed={article.favorited}
        aria-label={`${article.favorited ? "좋아요 취소" : "좋아요"}: ${article.title}`}
        disabled={pending}
        onClick={handleClick}
      >
        {pending
          ? "처리 중…"
          : article.favorited
            ? "♥ 좋아요 취소"
            : "♡ 좋아요"}{" "}
        <span>{article.favoritesCount}</span>
      </button>
      <ErrorMessages error={error} />
    </div>
  );
}
