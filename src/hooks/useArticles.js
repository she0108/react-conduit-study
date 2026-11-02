import { useQuery } from "@tanstack/react-query";

import { getArticles } from "../apis/articles.js";
import { useAuthStore } from "../stores/authStore.js";
import { PAGE_SIZE } from "../utils/pagination.js";

export function useArticles({
  feed = "global",
  tag = "",
  author = "",
  favorited = "",
  page = 1,
}) {
  const token = useAuthStore((state) => state.token);

  // 좋아요·팔로우 여부는 보는 사람마다 다르므로 키에 토큰을 넣는다.
  const query = useQuery({
    queryKey: ["articles", { feed, tag, author, favorited, page, token }],
    queryFn: () =>
      getArticles({
        feed,
        tag,
        author,
        favorited,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
  });

  return {
    articles: query.data?.articles ?? [],
    total: query.data?.articlesCount ?? 0,
    loading: query.isPending,
    error: query.isLoadingError ? query.error : null,
  };
}
