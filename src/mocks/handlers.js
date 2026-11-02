import { delay, http, HttpResponse } from "msw";

import { db, nextId, save } from "./db.js";

// 응답 형식과 상태 코드는 RealWorld 공식 API 계약을 따른다.
// https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(status, errors) {
  return HttpResponse.json({ errors }, { status });
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function readBody(request, key) {
  const body = await request.json().catch(() => null);

  return body?.[key] ?? {};
}

function getViewer(request) {
  const [scheme, token] =
    request.headers.get("Authorization")?.split(" ") ?? [];

  if (!token || !["Token", "Bearer"].includes(scheme)) return null;

  const viewer = db.users.find((user) => createToken(user) === token);

  if (!viewer) throw fail(401, { token: ["is invalid"] });

  return viewer;
}

function requireViewer(request) {
  const viewer = getViewer(request);

  if (!viewer) throw fail(401, { token: ["is missing"] });

  return viewer;
}

function createToken(user) {
  return `mock-token-${user.id}`;
}

function toUser(user) {
  return {
    email: user.email,
    token: createToken(user),
    username: user.username,
    bio: user.bio,
    image: user.image,
  };
}

function toProfile(user, viewer) {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: Boolean(viewer?.following.includes(user.id)),
  };
}

function toArticle(article, viewer) {
  const author = db.users.find((user) => user.id === article.authorId);

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tagList,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited: Boolean(viewer && article.favoritedBy.includes(viewer.id)),
    favoritesCount: article.favoritedBy.length,
    author: toProfile(author, viewer),
  };
}

function toComment(comment, viewer) {
  const author = db.users.find((user) => user.id === comment.authorId);

  return {
    id: comment.id,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author: toProfile(author, viewer),
  };
}

function toArticleList(articles, request, viewer) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset")) || 0;
  const limit = Number(params.get("limit")) || 20;

  // 목록 응답에는 본문을 포함하지 않는다.
  const page = [...articles]
    .sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id,
    )
    .slice(offset, offset + limit)
    .map((article) => {
      const preview = toArticle(article, viewer);

      delete preview.body;

      return preview;
    });

  return HttpResponse.json({ articles: page, articlesCount: articles.length });
}

function createSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function findArticle(slug) {
  const article = db.articles.find((item) => item.slug === slug);

  if (!article) throw fail(404, { article: ["not found"] });

  return article;
}

function findProfile(username) {
  const user = db.users.find((item) => item.username === username);

  if (!user) throw fail(404, { profile: ["not found"] });

  return user;
}

function isTagList(value) {
  return Array.isArray(value) && value.every((tag) => typeof tag === "string");
}

function findConflicts({ username, email }, currentUser) {
  const others = db.users.filter((user) => user !== currentUser);
  const errors = {};

  if (others.some((user) => user.username === username))
    errors.username = ["has already been taken"];

  if (others.some((user) => user.email === email))
    errors.email = ["has already been taken"];

  return errors;
}

const authHandlers = [
  http.post("/api/users/login", async ({ request }) => {
    const body = await readBody(request, "user");
    const email = text(body.email);
    const password = text(body.password);
    const errors = {};

    if (!email) errors.email = ["can't be blank"];
    else if (!EMAIL_PATTERN.test(email)) errors.email = ["is invalid"];

    if (!password) errors.password = ["can't be blank"];

    if (Object.keys(errors).length) return fail(422, errors);

    const user = db.users.find((item) => item.email === email);

    if (user?.password !== password)
      return fail(401, { credentials: ["invalid"] });

    return HttpResponse.json({ user: toUser(user) });
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await readBody(request, "user");
    const username = text(body.username);
    const email = text(body.email);
    const password = text(body.password);
    const errors = {};

    if (!username) errors.username = ["can't be blank"];

    if (!email) errors.email = ["can't be blank"];
    else if (!EMAIL_PATTERN.test(email)) errors.email = ["is invalid"];

    if (!password) errors.password = ["can't be blank"];

    if (Object.keys(errors).length) return fail(422, errors);

    const conflicts = findConflicts({ username, email });

    if (Object.keys(conflicts).length) return fail(409, conflicts);

    const user = {
      id: nextId(db.users),
      email,
      username,
      password,
      bio: null,
      image: null,
      following: [],
    };

    db.users.push(user);
    save();

    return HttpResponse.json({ user: toUser(user) }, { status: 201 });
  }),

  http.get("/api/user", ({ request }) => {
    return HttpResponse.json({ user: toUser(requireViewer(request)) });
  }),

  http.put("/api/user", async ({ request }) => {
    const viewer = requireViewer(request);
    const body = await readBody(request, "user");
    const next = {
      username: "username" in body ? text(body.username) : viewer.username,
      email: "email" in body ? text(body.email) : viewer.email,
      password: "password" in body ? text(body.password) : viewer.password,
    };
    const errors = {};

    if (!next.username) errors.username = ["can't be blank"];

    if (!next.email) errors.email = ["can't be blank"];
    else if (!EMAIL_PATTERN.test(next.email)) errors.email = ["is invalid"];

    if ("password" in body && next.password.length < 8)
      errors.password = ["must be at least 8 characters long"];

    if (Object.keys(errors).length) return fail(422, errors);

    const conflicts = findConflicts(next, viewer);

    if (Object.keys(conflicts).length) return fail(409, conflicts);

    Object.assign(viewer, next);

    // 빈 문자열은 null로 저장한다.
    if ("bio" in body) viewer.bio = body.bio || null;

    if ("image" in body) viewer.image = body.image || null;

    save();

    return HttpResponse.json({ user: toUser(viewer) });
  }),
];

const profileHandlers = [
  http.get("/api/profiles/:username", ({ request, params }) => {
    const viewer = getViewer(request);

    return HttpResponse.json({
      profile: toProfile(findProfile(params.username), viewer),
    });
  }),

  http.post("/api/profiles/:username/follow", ({ request, params }) => {
    const viewer = requireViewer(request);
    const user = findProfile(params.username);

    if (!viewer.following.includes(user.id)) viewer.following.push(user.id);

    save();

    return HttpResponse.json({ profile: toProfile(user, viewer) });
  }),

  http.delete("/api/profiles/:username/follow", ({ request, params }) => {
    const viewer = requireViewer(request);
    const user = findProfile(params.username);

    viewer.following = viewer.following.filter((id) => id !== user.id);
    save();

    return HttpResponse.json({ profile: toProfile(user, viewer) });
  }),
];

const articleHandlers = [
  // "/api/articles/:slug"보다 먼저 두어야 feed가 slug로 해석되지 않는다.
  http.get("/api/articles/feed", ({ request }) => {
    const viewer = requireViewer(request);
    const articles = db.articles.filter((article) =>
      viewer.following.includes(article.authorId),
    );

    return toArticleList(articles, request, viewer);
  }),

  http.get("/api/articles", ({ request }) => {
    const viewer = getViewer(request);
    const params = new URL(request.url).searchParams;
    let articles = db.articles;

    if (params.has("tag"))
      articles = articles.filter((article) =>
        article.tagList.includes(params.get("tag")),
      );

    if (params.has("author")) {
      const author = db.users.find(
        (user) => user.username === params.get("author"),
      );

      articles = articles.filter((article) => article.authorId === author?.id);
    }

    if (params.has("favorited")) {
      const user = db.users.find(
        (item) => item.username === params.get("favorited"),
      );

      articles = articles.filter((article) =>
        article.favoritedBy.includes(user?.id),
      );
    }

    return toArticleList(articles, request, viewer);
  }),

  http.post("/api/articles", async ({ request }) => {
    const viewer = requireViewer(request);
    const body = await readBody(request, "article");
    const title = text(body.title);
    const description = text(body.description);
    const articleBody = text(body.body);
    const tagList = body.tagList ?? [];
    const errors = {};

    if (!title) errors.title = ["can't be blank"];

    if (!description) errors.description = ["can't be blank"];

    if (!articleBody) errors.body = ["can't be blank"];

    if (!isTagList(tagList)) errors.tagList = ["is invalid"];

    if (Object.keys(errors).length) return fail(422, errors);

    const now = new Date().toISOString();
    const article = {
      id: nextId(db.articles),
      slug: createSlug(title),
      title,
      description,
      body: articleBody,
      tagList,
      createdAt: now,
      updatedAt: now,
      authorId: viewer.id,
      favoritedBy: [],
    };

    db.articles.push(article);
    save();

    return HttpResponse.json(
      { article: toArticle(article, viewer) },
      { status: 201 },
    );
  }),

  http.get("/api/articles/:slug", ({ request, params }) => {
    const viewer = getViewer(request);

    return HttpResponse.json({
      article: toArticle(findArticle(params.slug), viewer),
    });
  }),

  http.put("/api/articles/:slug", async ({ request, params }) => {
    const viewer = requireViewer(request);
    const body = await readBody(request, "article");
    const errors = {};

    for (const field of ["title", "description", "body"]) {
      if (field in body && !text(body[field]))
        errors[field] = ["can't be blank"];
    }

    if ("tagList" in body && !isTagList(body.tagList))
      errors.tagList = ["is invalid"];

    if (Object.keys(errors).length) return fail(422, errors);

    const article = findArticle(params.slug);

    if (article.authorId !== viewer.id)
      return fail(403, { article: ["forbidden"] });

    // 제목을 보내면 공식 백엔드처럼 slug를 새로 만든다.
    if ("title" in body) {
      article.title = text(body.title);
      article.slug = createSlug(article.title);
    }

    if ("description" in body) article.description = text(body.description);

    if ("body" in body) article.body = text(body.body);

    if ("tagList" in body) article.tagList = body.tagList;

    article.updatedAt = new Date().toISOString();
    save();

    return HttpResponse.json({ article: toArticle(article, viewer) });
  }),

  http.delete("/api/articles/:slug", ({ request, params }) => {
    const viewer = requireViewer(request);
    const article = findArticle(params.slug);

    if (article.authorId !== viewer.id)
      return fail(403, { article: ["forbidden"] });

    db.articles = db.articles.filter((item) => item !== article);
    db.comments = db.comments.filter(
      (comment) => comment.articleId !== article.id,
    );
    save();

    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/articles/:slug/favorite", ({ request, params }) => {
    const viewer = requireViewer(request);
    const article = findArticle(params.slug);

    if (!article.favoritedBy.includes(viewer.id))
      article.favoritedBy.push(viewer.id);

    save();

    return HttpResponse.json({ article: toArticle(article, viewer) });
  }),

  http.delete("/api/articles/:slug/favorite", ({ request, params }) => {
    const viewer = requireViewer(request);
    const article = findArticle(params.slug);

    article.favoritedBy = article.favoritedBy.filter((id) => id !== viewer.id);
    save();

    return HttpResponse.json({ article: toArticle(article, viewer) });
  }),
];

const commentHandlers = [
  http.get("/api/articles/:slug/comments", ({ request, params }) => {
    const viewer = getViewer(request);
    const article = findArticle(params.slug);
    const comments = db.comments
      .filter((comment) => comment.articleId === article.id)
      .map((comment) => toComment(comment, viewer));

    return HttpResponse.json({ comments });
  }),

  http.post("/api/articles/:slug/comments", async ({ request, params }) => {
    const viewer = requireViewer(request);
    const body = text((await readBody(request, "comment")).body);

    if (!body) return fail(422, { body: ["can't be blank"] });

    const article = findArticle(params.slug);
    const now = new Date().toISOString();
    const comment = {
      id: nextId(db.comments),
      articleId: article.id,
      authorId: viewer.id,
      body,
      createdAt: now,
      updatedAt: now,
    };

    db.comments.push(comment);
    save();

    return HttpResponse.json(
      { comment: toComment(comment, viewer) },
      { status: 201 },
    );
  }),

  http.delete("/api/articles/:slug/comments/:id", ({ request, params }) => {
    const viewer = requireViewer(request);
    const article = findArticle(params.slug);
    const comment = db.comments.find(
      (item) => item.id === Number(params.id) && item.articleId === article.id,
    );

    if (!comment) return fail(404, { comment: ["not found"] });

    if (comment.authorId !== viewer.id)
      return fail(403, { comment: ["forbidden"] });

    db.comments = db.comments.filter((item) => item !== comment);
    save();

    return new HttpResponse(null, { status: 204 });
  }),
];

const tagHandlers = [
  // 글에 쓰인 횟수가 많은 태그부터 최대 10개를 돌려준다.
  http.get("/api/tags", () => {
    const counts = new Map();

    for (const article of db.articles) {
      for (const tag of article.tagList) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    const tags = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    return HttpResponse.json({ tags });
  }),
];

export const handlers = [
  // 반환값이 없으면 다음 핸들러로 넘어간다. 로딩 화면을 볼 수 있도록 응답을 조금 늦춘다.
  http.all("/api/*", async () => {
    await delay(200);
  }),
  ...authHandlers,
  ...profileHandlers,
  ...articleHandlers,
  ...commentHandlers,
  ...tagHandlers,
  http.all("/api/*", () => fail(404, { path: ["not found"] })),
];
