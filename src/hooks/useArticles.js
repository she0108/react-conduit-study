import { useEffect, useState } from "react";

import { getArticles } from "../apis/articles.js";
import { PAGE_SIZE } from "../utils/pagination.js";
import { useAuth } from "./useAuth.js";

export function useArticles({
  feed = "global",
  tag = "",
  author = "",
  favorited = "",
  page = 1,
}) {
  const { user, handleAuthError } = useAuth();

  const token = user?.token;

  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState(null);

  // 조건이 바뀐 첫 렌더부터 이전 결과를 숨기고, 현재 조건의 응답이 도착할 때까지 로딩으로 표시한다.
  const key = JSON.stringify([
    feed,
    tag,
    author,
    favorited,
    page,
    token,
    reloadCount,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    getArticles(
      {
        feed,
        tag,
        author,
        favorited,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      },
      controller.signal,
    )
      .then((data) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            articles: data.articles,
            total: data.articlesCount,
            error: null,
          });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;

        handleAuthError(error);
        setResult({ key, articles: [], total: 0, error });
      });

    return () => controller.abort();
  }, [
    feed,
    tag,
    author,
    favorited,
    page,
    token,
    reloadCount,
    key,
    handleAuthError,
  ]);

  function refresh() {
    setReloadCount((value) => value + 1);
  }

  function updateArticleFavorite(article) {
    setResult(
      (previous) =>
        previous && {
          ...previous,
          articles: previous.articles.map((item) =>
            item.slug === article.slug
              ? {
                  ...item,
                  favorited: article.favorited,
                  favoritesCount: article.favoritesCount,
                }
              : item,
          ),
        },
    );
  }

  const current = result?.key === key;

  return {
    articles: current ? result.articles : [],
    total: current ? result.total : 0,
    error: current ? result.error : null,
    loading: !current,
    refresh,
    updateArticleFavorite,
  };
}
