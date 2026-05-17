const BASE = process.env.BACKEND_API_URL

if (!BASE && process.env.NODE_ENV !== 'production') {
  console.warn('[backend] BACKEND_API_URL is not set')
}

export interface BackendError {
  status: number
  message: string
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!BASE) throw { status: 500, message: 'BACKEND_API_URL not configured' } as BackendError

  const url = `${BASE.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    let message = `Backend ${res.status}`
    try {
      const body = await res.text()
      if (body) message = body
    } catch {
      // ignore
    }
    throw { status: res.status, message } as BackendError
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
