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
    const messages = {
      401: "인증 정보를 확인해 주세요. 로그인이 만료되었을 수 있습니다.",
      403: "이 작업을 수행할 권한이 없습니다.",
      404: "요청한 내용을 찾을 수 없습니다.",
      409: "이미 사용 중인 정보이거나 다른 변경과 충돌했습니다.",
      422: "입력한 내용을 확인해 주세요.",
    };

    throw new ApiError(
      messages[response.status] ||
        "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
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
