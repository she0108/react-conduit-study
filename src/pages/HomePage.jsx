import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";

import { getTags } from "../apis/tags.js";
import { useAuth } from "../hooks/useAuth.js";
import { useArticles } from "../hooks/useArticles.js";
import { getPage, PAGE_SIZE } from "../utils/pagination.js";
import ArticleList from "../components/ArticleList.jsx";
import Pagination from "../components/Pagination.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";

import styles from "./HomePage.module.css";

export default function HomePage() {
  const { user } = useAuth();
  const [params] = useSearchParams();

  const tag = params.get("tag") || "";
  const feed =
    !tag && params.get("feed") === "following" && user ? "following" : "global";
  const page = getPage(params.get("page"));

  const list = useArticles({ feed, tag, page });

  const [tags, setTags] = useState(null);
  const [tagsError, setTagsError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getTags(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setTags(data.tags);
          setTagsError(null);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setTagsError(error);
      });

    return () => controller.abort();
  }, [attempt]);

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

  function retryTags() {
    setTagsError(null);
    setTags(null);
    setAttempt((value) => value + 1);
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
            onArticleChange={list.updateArticle}
          />
          {!list.loading && !list.error && (
            <Pagination page={page} total={list.total} />
          )}
        </section>
        <aside className={styles.sidebar}>
          <h2>인기 태그</h2>
          {tagsError ? (
            <>
              <ErrorMessages error={tagsError} />
              <button onClick={retryTags}>태그 다시 시도</button>
            </>
          ) : tags === null ? (
            <p role="status">태그를 불러오는 중…</p>
          ) : tags.length ? (
            <div className={styles.tags}>
              {tags.map((value) => (
                <Link
                  className="tag"
                  key={value}
                  to={`/?tag=${encodeURIComponent(value)}&page=1`}
                >
                  {value}
                </Link>
              ))}
            </div>
          ) : (
            <p>아직 태그가 없습니다.</p>
          )}
        </aside>
      </div>
    </>
  );
}
