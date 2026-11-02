import { useState } from "react";
import { useNavigate } from "react-router";

import { favoriteArticle, unfavoriteArticle } from "../../apis/articles.js";
import { useAuthStore } from "../../stores/authStore.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function FavoriteButton({ article, onFavoriteChange }) {
  const user = useAuthStore((state) => state.user);
  const handleAuthError = useAuthStore((state) => state.handleAuthError);
  const navigate = useNavigate();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    if (!user) {
      navigate("/login");
      return;
    }

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
