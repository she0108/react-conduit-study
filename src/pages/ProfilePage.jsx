import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router";

import { getProfile } from "../apis/profiles.js";
import { useAuth } from "../hooks/useAuth.js";
import { useArticles } from "../hooks/useArticles.js";
import { getPage, getPageCount } from "../utils/pagination.js";
import Avatar from "../components/Avatar.jsx";
import FollowButton from "../components/FollowButton.jsx";
import ArticleList from "../components/ArticleList.jsx";
import Pagination from "../components/Pagination.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";

import styles from "./ProfilePage.module.css";

export default function ProfilePage({ favorites = false }) {
  const { username } = useParams();
  const { user } = useAuth();

  return (
    <Profile
      key={`${username}:${user?.token || ""}`}
      username={username}
      favorites={favorites}
    />
  );
}

function Profile({ username, favorites }) {
  const { user, handleAuthError } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();

  const page = getPage(params.get("page"));

  const list = useArticles({
    author: favorites ? "" : username,
    favorited: favorites ? username : "",
    page,
  });

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getProfile(username, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setProfile(data.profile);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          handleAuthError(error);
          setError(error);
        }
      });

    return () => controller.abort();
  }, [username, handleAuthError]);

  const maxPage = Math.max(1, getPageCount(list.total));

  if (
    (params.has("page") && params.get("page") !== String(page)) ||
    (!list.loading && !list.error && page > maxPage)
  ) {
    const next = new URLSearchParams(params);

    next.set("page", Math.min(page, maxPage));

    return <Navigate to={`${location.pathname}?${next}`} replace />;
  }

  function handleProfileChange(updated) {
    setProfile(updated);
    list.refresh();
  }

  function handleFavoriteChange(article) {
    if (favorites && !article.favorited) list.refresh();
    else list.updateArticleFavorite(article);
  }

  if (error)
    return (
      <section className="container page">
        <h1>프로필을 불러오지 못했습니다</h1>
        <ErrorMessages error={error} />
      </section>
    );

  if (!profile)
    return (
      <p className="container status" role="status">
        프로필을 불러오고 있습니다…
      </p>
    );

  const profileUrl = `/profile/${encodeURIComponent(username)}`;

  return (
    <>
      <header className={styles.banner}>
        <div className="container">
          <Avatar image={profile.image} size={100} />
          <h1>{profile.username}</h1>
          <p>{profile.bio || "아직 소개가 없습니다."}</p>
          <div className={styles.actions}>
            <FollowButton profile={profile} onChange={handleProfileChange} />
            {user?.username === username && (
              <Link className="button" to="/settings">
                프로필 설정
              </Link>
            )}
          </div>
        </div>
      </header>
      <section
        className={`container ${styles.content}`}
        aria-label="프로필 글 목록"
      >
        <nav className="tabs" aria-label="프로필 글 선택">
          <Link
            to={`${profileUrl}?page=1`}
            aria-current={!favorites ? "page" : undefined}
          >
            작성한 글
          </Link>
          <Link
            to={`${profileUrl}/favorites?page=1`}
            aria-current={favorites ? "page" : undefined}
          >
            좋아요한 글
          </Link>
        </nav>
        <ArticleList
          articles={list.articles}
          loading={list.loading}
          error={list.error}
          onFavoriteChange={handleFavoriteChange}
        />
        {!list.loading && !list.error && (
          <Pagination page={page} total={list.total} />
        )}
      </section>
    </>
  );
}
