import { Link } from 'react-router'
import ArticleMeta from './ArticleMeta.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import styles from './ArticleCard.module.css'
export default function ArticleCard({ article, onArticleChange }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <ArticleMeta article={article} />
        <FavoriteButton article={article} onChange={onArticleChange} />
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
          <Link
            className="tag"
            key={tag}
            to={`/?tag=${encodeURIComponent(tag)}&page=1`}
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  )
}
