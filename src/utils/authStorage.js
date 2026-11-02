const key = 'conduit-token'
export function getToken() {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export function saveToken(token) {
  localStorage.setItem(key, token)
}
export function removeToken() {
  localStorage.removeItem(key)
}
