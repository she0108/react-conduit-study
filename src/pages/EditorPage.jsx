import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { createArticle, getArticle, updateArticle } from "../apis/articles.js";
import { useAuth } from "../hooks/useAuth.js";
import { notBlank } from "../utils/formRules.js";
import ErrorMessages from "../components/common/ErrorMessages.jsx";
import FieldError from "../components/common/FieldError.jsx";

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

const EMPTY_ARTICLE = { title: "", description: "", body: "", tagList: [] };

function Editor({ slug }) {
  const { user, handleAuthError } = useAuth();

  const [article, setArticle] = useState(EMPTY_ARTICLE);
  const [loadState, setLoadState] = useState({
    status: slug ? "loading" : "ready",
    error: null,
  });

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

        setArticle(article);
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

  return <EditorForm slug={slug} article={article} />;
}

// 글을 다 불러온 뒤에 마운트해 불러온 값을 폼의 초기값으로 쓴다.
function EditorForm({ slug, article }) {
  const { handleAuthError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: article.title,
      description: article.description,
      body: article.body,
      tags: article.tagList.join(", "),
    },
  });
  const [error, setError] = useState(null);

  async function onSubmit({ title, description, body, tags }) {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      tagList: parseTags(tags),
    };

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
    }
  }

  return (
    <section className={`formPage ${styles.editor}`}>
      <h1>{slug ? "글 수정" : "새 글 쓰기"}</h1>
      <ErrorMessages error={error} />
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <label>
            제목
            <input
              placeholder="어떤 이야기를 나누고 싶으신가요?"
              {...register("title", notBlank("제목을 입력해 주세요."))}
            />
          </label>
          <FieldError error={errors.title} />
          <label>
            설명
            <input
              placeholder="글을 한 문장으로 소개해 주세요."
              {...register("description", notBlank("설명을 입력해 주세요."))}
            />
          </label>
          <FieldError error={errors.description} />
          <label>
            본문
            <textarea
              rows={14}
              placeholder="Markdown으로 자유롭게 작성해 보세요."
              {...register("body", notBlank("본문을 입력해 주세요."))}
            />
          </label>
          <FieldError error={errors.body} />
          <label>
            태그
            <input
              placeholder="쉼표로 구분해 입력해 주세요. 예: react, css"
              {...register("tags")}
            />
          </label>
          <button type="submit" className="primary">
            {isSubmitting ? "저장 중…" : slug ? "수정 완료" : "게시하기"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
