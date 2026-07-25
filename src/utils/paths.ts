export function photoPath(path: string): string {
  const base = import.meta.env.BASE_URL
  const separator = base.endsWith('/') ? '' : '/'
  return `${base}${separator}${path}`
}
