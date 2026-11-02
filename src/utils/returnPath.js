export function getReturnPath(path) {
  if (
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    /[\r\n]/.test(path) ||
    /^\/(login|register)([/?#]|$)/.test(path)
  )
    return '/'
  return path
}
