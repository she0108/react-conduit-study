import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import Markdown from "react-markdown";

import { deleteArticle, getArticle } from "../apis/articles.js";
import { queryClient } from "../queryClient.js";
import { useAuthStore } from "../stores/authStore.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import TagLink from "../components/article/TagLink.jsx";
import ArticleMeta from "../components/article/ArticleMeta.jsx";
import Comments from "../components/comment/Comments.jsx";
import FollowButton from "../components/user/FollowButton.jsx";
import FavoriteButton from "../components/article/FavoriteButton.jsx";
import ErrorMessages from "../components/common/ErrorMessages.jsx";

import styles from "./ArticlePage.module.css";

export default function ArticlePage() {
  const { slug } = useParams();
  const { user } = useCurrentUser();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const { data, error, isPending, isLoadingError } = useQuery({
    queryKey: ["article", slug, token],
    queryFn: () => getArticle(slug),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteArticle(slug),
    onSuccess: () => {
      navigate("/", { replace: true });
      queryClient.removeQueries({ queryKey: ["article", slug] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  function handleDelete() {
    if (window.confirm("이 글을 삭제할까요? 댓글도 함께 삭제됩니다."))
      deleteMutation.mutate();
  }

  if (isLoadingError)
    return (
      <section className="container page">
        <h1>
          {error.status === 404
            ? "글을 찾을 수 없습니다"
            : "글을 불러오지 못했습니다"}
        </h1>
        <ErrorMessages error={error} />
      </section>
    );

  if (isPending)
    return (
      <p className="container status" role="status">
        글을 불러오고 있습니다…
      </p>
    );

  const { article } = data;

  return (
    <article>
      <header className={styles.banner}>
        <div className="container">
          <h1>{article.title}</h1>
          <div className={styles.toolbar}>
            <ArticleMeta article={article} />
            <FavoriteButton article={article} />
            <FollowButton profile={article.author} />
            {user?.username === article.author.username && (
              <Link
                className="button"
                to={`/editor/${encodeURIComponent(article.slug)}`}
              >
                글 수정
              </Link>
            )}
            {user?.username === article.author.username && (
              <button
                className="danger"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? "삭제 중…" : "글 삭제"}
              </button>
            )}
          </div>
          <ErrorMessages error={deleteMutation.error} />
        </div>
      </header>
      <div className={`container ${styles.content}`}>
        <div className={styles.body}>
          <Markdown>{article.body}</Markdown>
        </div>
        <div className={styles.tags}>
          {article.tagList.map((tag) => (
            <TagLink key={tag} tag={tag} />
          ))}
        </div>
        <Comments slug={slug} />
      </div>
    </article>
  );
}
