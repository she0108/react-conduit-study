import { request } from './client.js'
const profilePath = (username) => `/profiles/${encodeURIComponent(username)}`
export function getProfile(username, signal) {
  return request(profilePath(username), { signal })
}
export function followProfile(username, following) {
  return request(`${profilePath(username)}/follow`, {
    method: following ? 'DELETE' : 'POST',
  })
}
