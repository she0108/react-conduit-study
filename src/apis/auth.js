import { request } from "./client.js";

export function login(user) {
  return request("/users/login", {
    method: "POST",
    body: { user },
    token: null,
  });
}

export function register(user) {
  return request("/users", { method: "POST", body: { user }, token: null });
}

export function getCurrentUser(signal) {
  return request("/user", { signal });
}

export function updateUser(user) {
  return request("/user", { method: "PUT", body: { user } });
}
