import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { createArticle, getArticle, updateArticle } from "../apis/articles.js";
import { useAuth } from "../hooks/useAuth.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";

import styles from "./EditorPage.module.css";

function parseTags(value) {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

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
    tags: "",
  });
  const [loadState, setLoadState] = useState({
    status: slug ? "loading" : "ready",
    error: null,
  });
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let ignore = false;

    getArticle(slug)
      .then(({ article }) => {
        if (ignore) return;

        if (article.author.username !== user.username) {
          setLoadState({ status: "forbidden", error: null });
          return;
        }

        setArticle({
          title: article.title,
          description: article.description,
          body: article.body,
          tags: article.tagList.join(", "),
        });
        setLoadState({ status: "ready", error: null });
      })
      .catch((error) => {
        if (!ignore) {
          handleAuthError(error);
          setLoadState({ status: "error", error });
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug, user.username, handleAuthError]);

  function handleChange(event) {
    setArticle((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      ![article.title, article.description, article.body].every((value) =>
        value.trim(),
      )
    ) {
      setError("제목, 설명, 본문은 공백만 입력할 수 없습니다.");
      return;
    }

    const payload = {
      title: article.title.trim(),
      description: article.description.trim(),
      body: article.body.trim(),
      tagList: parseTags(article.tags),
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
          <label>
            태그
            <input
              name="tags"
              value={article.tags}
              onChange={handleChange}
              placeholder="쉼표로 구분해 입력해 주세요. 예: react, css"
            />
          </label>
          <button type="submit" className="primary">
            {pending ? "저장 중…" : slug ? "수정 완료" : "게시하기"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
