import { request } from "./client.js";

export function getTags(signal) {
  return request("/tags", { signal });
}
