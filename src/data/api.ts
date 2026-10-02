const TOKEN_KEY = 'purpose-academy-token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode / blocked storage */
  }
}

function apiBase() {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  return configured?.replace(/\/$/, '') || ''
}

function friendlyNetworkError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) {
    return 'Cannot reach the training server. If you are developing locally, run npm run dev (API + website together).'
  }
  return msg || 'Request failed.'
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...options,
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    })
  } catch (err) {
    throw new Error(friendlyNetworkError(err))
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`)
  }
  return data as T
}
