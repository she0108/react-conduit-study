import { request } from "./client.js";

const commentsPath = (slug) => `/articles/${encodeURIComponent(slug)}/comments`;

export function getComments(slug) {
  return request(commentsPath(slug));
}

export function createComment(slug, body) {
  return request(commentsPath(slug), {
    method: "POST",
    body: { comment: { body } },
  });
}

export function deleteComment(slug, id) {
  return request(`${commentsPath(slug)}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
