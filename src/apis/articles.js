import { request } from "./client.js";

const articlePath = (slug) => `/articles/${encodeURIComponent(slug)}`;

export function getArticles({ feed = "global", ...filters } = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }

  return request(`/articles${feed === "following" ? "/feed" : ""}?${params}`);
}

export function getArticle(slug) {
  return request(articlePath(slug));
}

export function createArticle(article) {
  return request("/articles", { method: "POST", body: { article } });
}

export function updateArticle(slug, article) {
  return request(articlePath(slug), { method: "PUT", body: { article } });
}

export function deleteArticle(slug) {
  return request(articlePath(slug), { method: "DELETE" });
}

export function favoriteArticle(slug) {
  return request(`${articlePath(slug)}/favorite`, {
    method: "POST",
  });
}

export function unfavoriteArticle(slug) {
  return request(`${articlePath(slug)}/favorite`, { method: "DELETE" });
}
