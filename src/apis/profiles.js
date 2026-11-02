import { request } from "./client.js";

const profilePath = (username) => `/profiles/${encodeURIComponent(username)}`;

export function getProfile(username, signal) {
  return request(profilePath(username), { signal });
}

export function followProfile(username) {
  return request(`${profilePath(username)}/follow`, {
    method: "POST",
  });
}

export function unfollowProfile(username) {
  return request(`${profilePath(username)}/follow`, { method: "DELETE" });
}
