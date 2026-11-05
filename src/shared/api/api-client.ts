export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// A decoder is required: a generic type alone cannot validate network data.
export async function fetchJson<T>(
  url: string,
  decode: (value: unknown) => T,
): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new ApiError(res.status, `Request failed (${res.status})`)
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new ApiError(res.status, 'Expected a JSON response from the API')
  }
  const value: unknown = await res.json()
  return decode(value)
}
