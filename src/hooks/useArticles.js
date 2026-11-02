import { useEffect, useState } from "react";

import { getArticles } from "../apis/articles.js";
import { PAGE_SIZE } from "../utils/pagination.js";
import { useAuthStore } from "../stores/authStore.js";
import { useCurrentUser } from "./useCurrentUser.js";

export function useArticles({
  feed = "global",
  tag = "",
  author = "",
  favorited = "",
  page = 1,
}) {
  const { user } = useCurrentUser();
  const handleAuthError = useAuthStore((state) => state.handleAuthError);

  const token = user?.token;

  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadArticles() {
      setLoading(true);
      setError(null);

      try {
        const data = await getArticles({
          feed,
          tag,
          author,
          favorited,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });

        if (ignore) return;

        setArticles(data.articles);
        setTotal(data.articlesCount);
      } catch (error) {
        if (ignore) return;

        handleAuthError(error);
        setError(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadArticles();

    return () => {
      ignore = true;
    };
    // token과 reloadCount는 로그인 변경과 refresh 때 다시 조회하기 위한 의존성이다.
  }, [feed, tag, author, favorited, page, token, reloadCount, handleAuthError]);

  function refresh() {
    setReloadCount((value) => value + 1);
  }

  function updateArticleFavorite(article) {
    setArticles((previous) =>
      previous.map((item) =>
        item.slug === article.slug
          ? {
              ...item,
              favorited: article.favorited,
              favoritesCount: article.favoritesCount,
            }
          : item,
      ),
    );
  }

  return {
    articles,
    total,
    loading,
    error,
    refresh,
    updateArticleFavorite,
  };
}
