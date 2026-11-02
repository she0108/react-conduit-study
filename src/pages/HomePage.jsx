import { Link, Navigate, useSearchParams } from "react-router";

import { useAuth } from "../hooks/useAuth.js";
import { useArticles } from "../hooks/useArticles.js";
import { getPage, PAGE_SIZE } from "../utils/pagination.js";
import ArticleList from "../components/ArticleList.jsx";
import Pagination from "../components/Pagination.jsx";
import PopularTags from "../components/PopularTags.jsx";

import styles from "./HomePage.module.css";

export default function HomePage() {
  const { user } = useAuth();
  const [params] = useSearchParams();

  const tag = params.get("tag") || "";
  const feed =
    !tag && params.get("feed") === "following" && user ? "following" : "global";
  const page = getPage(params.get("page"));

  const list = useArticles({ feed, tag, page });

  const maxPage = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const canonical = new URLSearchParams(
    tag ? { tag, page: String(page) } : { feed, page: String(page) },
  );

  if (
    (params.has("page") && params.get("page") !== String(page)) ||
    (!tag && params.get("feed") === "following" && !user) ||
    (tag && params.has("feed"))
  )
    return <Navigate to={`/?${canonical}`} replace />;

  if (!list.loading && !list.error && page > maxPage) {
    canonical.set("page", maxPage);

    return <Navigate to={`/?${canonical}`} replace />;
  }

  return (
    <>
      <section className={styles.banner}>
        <h1>conduit</h1>
        <p>생각을 나누고, 함께 배우는 공간.</p>
      </section>
      <div className={`container ${styles.content}`}>
        <section aria-label="글 피드">
          <nav className="tabs" aria-label="피드 선택">
            {user && (
              <Link
                to="/?feed=following&page=1"
                aria-current={feed === "following" && !tag ? "page" : undefined}
              >
                나의 피드
              </Link>
            )}
            <Link
              to="/?feed=global&page=1"
              aria-current={feed === "global" && !tag ? "page" : undefined}
            >
              전체 피드
            </Link>
            {tag && (
              <Link
                to={`/?tag=${encodeURIComponent(tag)}&page=1`}
                aria-current="page"
              >
                # {tag}
              </Link>
            )}
          </nav>
          <ArticleList
            {...list}
            onRetry={list.refresh}
            onFavoriteChange={list.updateArticleFavorite}
          />
          {!list.loading && !list.error && (
            <Pagination page={page} total={list.total} />
          )}
        </section>
        <PopularTags className={styles.sidebar} />
      </div>
    </>
  );
}
