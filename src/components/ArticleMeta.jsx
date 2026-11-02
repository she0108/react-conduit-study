import { Link } from "react-router";

import Avatar from "./Avatar.jsx";
import { formatDate } from "../utils/formatDate.js";

import styles from "./ArticleMeta.module.css";

export default function ArticleMeta({ article }) {
  const profileUrl = `/profile/${encodeURIComponent(article.author.username)}`;

  return (
    <div className={styles.meta}>
      <Link to={profileUrl} aria-label={`${article.author.username} 프로필`}>
        <Avatar image={article.author.image} />
      </Link>
      <div>
        <Link to={profileUrl}>{article.author.username}</Link>
        <time dateTime={article.createdAt}>
          {formatDate(article.createdAt)}
        </time>
      </div>
    </div>
  );
}
