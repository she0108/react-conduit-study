import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { createArticle, getArticle, updateArticle } from "../apis/articles.js";
import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "../components/ErrorMessages.jsx";

import styles from "./EditorPage.module.css";

export default function EditorPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  return <Editor key={`${slug || "new"}:${user.username}`} slug={slug} />;
}

function Editor({ slug }) {
  const { user, handleAuthError } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState({
    title: "",
    description: "",
    body: "",
    tagList: [],
  });
  const [loadState, setLoadState] = useState({
    status: slug ? "loading" : "ready",
    error: null,
  });
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    getArticle(slug, controller.signal)
      .then(({ article }) => {
        if (controller.signal.aborted) return;

        if (article.author.username !== user.username) {
          setLoadState({ status: "forbidden", error: null });
          return;
        }

        setArticle({
          title: article.title,
          description: article.description,
          body: article.body,
          tagList: article.tagList,
        });
        setLoadState({ status: "ready", error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          handleAuthError(error);
          setLoadState({ status: "error", error });
        }
      });

    return () => controller.abort();
  }, [slug, user.username, handleAuthError]);

  function handleChange(event) {
    setArticle((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  function addTag() {
    const tag = tagInput.trim();

    if (tag)
      setArticle((previous) => ({
        ...previous,
        tagList: [...new Set([...previous.tagList, tag])],
      }));

    setTagInput("");
  }

  function handleTagKeyDown(event) {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (pending || loadState.status !== "ready") return;

    if (
      ![article.title, article.description, article.body].every((value) =>
        value.trim(),
      )
    ) {
      setError("제목, 설명, 본문은 공백만 입력할 수 없습니다.");
      return;
    }

    const payload = {
      ...article,
      title: article.title.trim(),
      description: article.description.trim(),
      body: article.body.trim(),
      tagList: [
        ...new Set([...article.tagList, tagInput.trim()].filter(Boolean)),
      ],
    };

    setPending(true);
    setError(null);

    try {
      const data = slug
        ? await updateArticle(slug, payload)
        : await createArticle(payload);

      navigate(`/article/${encodeURIComponent(data.article.slug)}`, {
        replace: true,
      });
    } catch (error) {
      handleAuthError(error);
      setError(error);
    } finally {
      setPending(false);
    }
  }

  if (loadState.status === "forbidden")
    return (
      <section className="container page">
        <h1>이 글을 수정할 수 없습니다</h1>
        <p>본인이 작성한 글만 수정할 수 있습니다.</p>
        <Link to={`/article/${encodeURIComponent(slug)}`}>글로 돌아가기</Link>
      </section>
    );

  if (loadState.status === "error")
    return (
      <section className="container page">
        <h1>수정할 글을 불러오지 못했습니다</h1>
        <ErrorMessages error={loadState.error} />
      </section>
    );

  if (loadState.status === "loading")
    return (
      <p className="container status" role="status">
        수정할 글을 불러오고 있습니다…
      </p>
    );

  return (
    <section className={`formPage ${styles.editor}`}>
      <h1>{slug ? "글 수정" : "새 글 쓰기"}</h1>
      <ErrorMessages error={error} />
      <form onSubmit={handleSubmit}>
        <fieldset disabled={pending}>
          <label>
            제목
            <input
              name="title"
              required
              value={article.title}
              onChange={handleChange}
              placeholder="어떤 이야기를 나누고 싶으신가요?"
            />
          </label>
          <label>
            설명
            <input
              name="description"
              required
              value={article.description}
              onChange={handleChange}
              placeholder="글을 한 문장으로 소개해 주세요."
            />
          </label>
          <label>
            본문
            <textarea
              name="body"
              rows={14}
              required
              value={article.body}
              onChange={handleChange}
              placeholder="Markdown으로 자유롭게 작성해 보세요."
            />
          </label>
          <div>
            <label htmlFor="tag">태그</label>
            <div className={styles.tagInput}>
              <input
                id="tag"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="태그를 입력하고 Enter 또는 추가"
              />
              <button type="button" onClick={addTag}>
                추가
              </button>
            </div>
            <div className={styles.tags}>
              {article.tagList.map((tag) => (
                <button
                  className="tag"
                  type="button"
                  key={tag}
                  aria-label={`${tag} 태그 삭제`}
                  onClick={() =>
                    setArticle((previous) => ({
                      ...previous,
                      tagList: previous.tagList.filter(
                        (value) => value !== tag,
                      ),
                    }))
                  }
                >
                  {tag} ×
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="primary">
            {pending ? "저장 중…" : slug ? "수정 완료" : "게시하기"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
