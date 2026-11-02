import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { favoriteArticle, unfavoriteArticle } from "../../apis/articles.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import { queryClient } from "../../queryClient.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function FavoriteButton({ article }) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      article.favorited
        ? unfavoriteArticle(article.slug)
        : favoriteArticle(article.slug),
    // Promise를 돌려주면 다시 받을 때까지 버튼의 처리 중 상태가 유지된다.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["article", article.slug] }),
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
      ]),
  });

  function handleClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    mutation.mutate();
  }

  return (
    <div>
      <button
        className={article.favorited ? "primary" : ""}
        aria-pressed={article.favorited}
        aria-label={`${article.favorited ? "좋아요 취소" : "좋아요"}: ${article.title}`}
        disabled={mutation.isPending}
        onClick={handleClick}
      >
        {mutation.isPending
          ? "처리 중…"
          : article.favorited
            ? "♥ 좋아요 취소"
            : "♡ 좋아요"}{" "}
        <span>{article.favoritesCount}</span>
      </button>
      <ErrorMessages error={mutation.error} />
    </div>
  );
}
