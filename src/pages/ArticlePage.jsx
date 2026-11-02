import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Markdown from 'react-markdown'
import { deleteArticle, getArticle } from '../apis/articles.js'
import { useAuth } from '../hooks/useAuth.js'
import ArticleMeta from '../components/ArticleMeta.jsx'
import Comments from '../components/Comments.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import ErrorMessages from '../components/ErrorMessages.jsx'
import styles from './ArticlePage.module.css'
export default function ArticlePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  return <ArticleContent key={`${slug}:${user?.token || ''}`} slug={slug} />
}
function ArticleContent({ slug }) {
  const { user, handleAuthError } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getArticle(slug, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setArticle(data.article)
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          handleAuthError(error)
          setError(error)
        }
      })
    return () => controller.abort()
  }, [slug, attempt, handleAuthError])
  function retry() {
    setError(null)
    setAttempt((value) => value + 1)
  }
  async function handleDelete() {
    if (
      deleting ||
      !window.confirm('이 글을 삭제할까요? 댓글도 함께 삭제됩니다.')
    )
      return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteArticle(slug)
      navigate('/', { replace: true })
    } catch (error) {
      handleAuthError(error)
      setDeleteError(error)
    } finally {
      setDeleting(false)
    }
  }
  if (error)
    return (
      <section className="container page">
        <h1>
          {error.status === 404
            ? '글을 찾을 수 없습니다'
            : '글을 불러오지 못했습니다'}
        </h1>
        <ErrorMessages error={error} />
        <button onClick={retry}>다시 시도</button>
      </section>
    )
  if (!article)
    return (
      <p className="container status" role="status">
        글을 불러오고 있습니다…
      </p>
    )
  return (
    <article>
      <header className={styles.banner}>
        <div className="container">
          <h1>{article.title}</h1>
          <div className={styles.toolbar}>
            <ArticleMeta article={article} />
            <FavoriteButton article={article} onChange={setArticle} />
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
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? '삭제 중…' : '글 삭제'}
              </button>
            )}
          </div>
          <ErrorMessages error={deleteError} />
        </div>
      </header>
      <div className={`container ${styles.content}`}>
        <div className={styles.body}>
          <Markdown>{article.body}</Markdown>
        </div>
        <div className={styles.tags}>
          {article.tagList.map((tag) => (
            <Link
              key={tag}
              className="tag"
              to={`/?tag=${encodeURIComponent(tag)}&page=1`}
            >
              {tag}
            </Link>
          ))}
        </div>
        <Comments slug={slug} />
      </div>
    </article>
  )
}
