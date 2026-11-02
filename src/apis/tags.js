import { request } from "./client.js";

export function getTags() {
  return request("/tags");
}
