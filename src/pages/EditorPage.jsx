import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { createArticle, getArticle, updateArticle } from "../apis/articles.js";
import { queryClient } from "../queryClient.js";
import { useAuthStore } from "../stores/authStore.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
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

const EMPTY_ARTICLE = { title: "", description: "", body: "", tagList: [] };

export default function EditorPage() {
  const { slug } = useParams();

  return slug ? (
    <EditArticle key={slug} slug={slug} />
  ) : (
    <EditorForm article={EMPTY_ARTICLE} />
  );
}

function EditArticle({ slug }) {
  const { user } = useCurrentUser();
  const token = useAuthStore((state) => state.token);

  const { data, error, isPending, isLoadingError } = useQuery({
    queryKey: ["article", slug, token],
    queryFn: () => getArticle(slug),
  });

  if (isLoadingError)
    return (
      <section className="container page">
        <h1>수정할 글을 불러오지 못했습니다</h1>
        <ErrorMessages error={error} />
      </section>
    );

  if (isPending)
    return (
      <p className="container status" role="status">
        수정할 글을 불러오고 있습니다…
      </p>
    );

  if (data.article.author.username !== user?.username)
    return (
      <section className="container page">
        <h1>이 글을 수정할 수 없습니다</h1>
        <p>본인이 작성한 글만 수정할 수 있습니다.</p>
        <Link to={`/article/${encodeURIComponent(slug)}`}>글로 돌아가기</Link>
      </section>
    );

  return <EditorForm slug={slug} article={data.article} />;
}

// 글을 다 불러온 뒤에 마운트해 불러온 값을 폼의 초기값으로 쓴다.
function EditorForm({ slug, article }) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: article.title,
      description: article.description,
      body: article.body,
      tags: article.tagList.join(", "),
    },
  });
  const mutation = useMutation({
    mutationFn: (payload) =>
      slug ? updateArticle(slug, payload) : createArticle(payload),
    onSuccess: (data) => {
      navigate(`/article/${encodeURIComponent(data.article.slug)}`, {
        replace: true,
      });

      // 제목을 바꾸면 slug도 바뀌므로 이전 주소의 글을 지운다.
      if (slug && slug !== data.article.slug)
        queryClient.removeQueries({ queryKey: ["article", slug] });

      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  function onSubmit({ title, description, body, tags }) {
    mutation.mutate({
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      tagList: parseTags(tags),
    });
  }

  return (
    <section className={`formPage ${styles.editor}`}>
      <h1>{slug ? "글 수정" : "새 글 쓰기"}</h1>
      <ErrorMessages error={mutation.error} />
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={mutation.isPending}>
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
            {mutation.isPending ? "저장 중…" : slug ? "수정 완료" : "게시하기"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
