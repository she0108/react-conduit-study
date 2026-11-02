import { request } from "./client.js";

// 로그인·가입은 저장된 토큰을 보내지 않도록 request의 기본 토큰 대신 null을 전달한다.
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
