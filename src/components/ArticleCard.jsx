import { Link } from "react-router";

import TagLink from "./TagLink.jsx";
import ArticleMeta from "./ArticleMeta.jsx";
import FavoriteButton from "./FavoriteButton.jsx";

import styles from "./ArticleCard.module.css";

export default function ArticleCard({ article, onFavoriteChange }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <ArticleMeta article={article} />
        <FavoriteButton article={article} onFavoriteChange={onFavoriteChange} />
      </div>
      <Link
        to={`/article/${encodeURIComponent(article.slug)}`}
        className={styles.preview}
      >
        <h2>{article.title}</h2>
        <p>{article.description}</p>
        <span>더 읽기…</span>
      </Link>
      <div className={styles.tags}>
        {article.tagList.map((tag) => (
          <TagLink key={tag} tag={tag} />
        ))}
      </div>
    </article>
  );
}
