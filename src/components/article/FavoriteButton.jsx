import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { favoriteArticle, unfavoriteArticle } from "../../apis/articles.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import { queryClient } from "../../queryClient.js";
import { useAuthStore } from "../../stores/authStore.js";
import ErrorMessages from "../common/ErrorMessages.jsx";

export default function FavoriteButton({ article }) {
  const { user } = useCurrentUser();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      article.favorited
        ? unfavoriteArticle(article.slug)
        : favoriteArticle(article.slug),
    onSuccess: (data) => {
      queryClient.setQueryData(["article", article.slug, token], data);

      // 목록을 다시 받을 때까지 버튼의 처리 중 상태를 유지한다.
      return queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
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
