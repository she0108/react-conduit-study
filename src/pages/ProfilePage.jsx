import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router";

import { getProfile } from "../apis/profiles.js";
import { useAuthStore } from "../stores/authStore.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import { useArticles } from "../hooks/useArticles.js";
import { getPage } from "../utils/pagination.js";
import Avatar from "../components/user/Avatar.jsx";
import FollowButton from "../components/user/FollowButton.jsx";
import ArticleList from "../components/article/ArticleList.jsx";
import Pagination from "../components/common/Pagination.jsx";
import ErrorMessages from "../components/common/ErrorMessages.jsx";

import styles from "./ProfilePage.module.css";

export default function ProfilePage({ favorites = false }) {
  const { username } = useParams();
  const { user } = useCurrentUser();
  const token = useAuthStore((state) => state.token);
  const [params] = useSearchParams();

  const page = getPage(params.get("page"));

  const list = useArticles({
    author: favorites ? "" : username,
    favorited: favorites ? username : "",
    page,
  });

  const { data, error, isPending, isLoadingError } = useQuery({
    queryKey: ["profile", username, token],
    queryFn: () => getProfile(username),
  });

  if (isLoadingError)
    return (
      <section className="container page">
        <h1>프로필을 불러오지 못했습니다</h1>
        <ErrorMessages error={error} />
      </section>
    );

  if (isPending)
    return (
      <p className="container status" role="status">
        프로필을 불러오고 있습니다…
      </p>
    );

  const { profile } = data;
  const profileUrl = `/profile/${encodeURIComponent(username)}`;

  return (
    <>
      <header className={styles.banner}>
        <div className="container">
          <Avatar image={profile.image} size={100} />
          <h1>{profile.username}</h1>
          <p>{profile.bio || "아직 소개가 없습니다."}</p>
          <div className={styles.actions}>
            <FollowButton profile={profile} />
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
        />
        {!list.loading && !list.error && (
          <Pagination page={page} total={list.total} />
        )}
      </section>
    </>
  );
}
