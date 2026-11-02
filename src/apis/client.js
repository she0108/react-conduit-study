import { getToken } from "../utils/authStorage.js";

const baseUrl = (
  import.meta.env.VITE_API_BASE_URL || "https://api.realworld.show/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function request(
  path,
  { method = "GET", body, token = getToken() } = {},
) {
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(
      "서버에 연결할 수 없습니다. 네트워크를 확인하고 다시 시도해 주세요.",
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 401
        ? "인증에 실패했습니다. 로그인 정보를 확인해 주세요."
        : "요청을 처리하지 못했습니다. 입력 내용을 확인하거나 잠시 후 다시 시도해 주세요.",
      response.status,
      data?.errors,
    );
  }

  if (data === null)
    throw new ApiError(
      "서버 응답을 읽을 수 없습니다. 다시 시도해 주세요.",
      response.status,
    );

  return data;
}
