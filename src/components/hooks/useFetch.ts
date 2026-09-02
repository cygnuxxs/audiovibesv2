// ─── Types ───────────────────────────────────────────────────────────────────

interface FetchParams {
  endpoint: string
  params: Record<string, string | number>
  context?: string
  cookie?: string
}

interface FetchResponse<T> {
  data: T
  ok: boolean
  status: number
}

// ─── User-Agent Pool ─────────────────────────────────────────────────────────

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:131.0) Gecko/20100101 Firefox/131.0',
]

// ─── Upstream Guard ──────────────────────────────────────────────────────────

function assertUpstreamOk(status: number, ok: boolean): void {
  if (!ok) {
    throw new Error(`upstream responded with status ${status}`)
  }
}

// ─── Fetch Helper ────────────────────────────────────────────────────────────

export const useFetch = async <T>({ endpoint, params, context, cookie }: FetchParams): Promise<FetchResponse<T>> => {
  const url = new URL('https://www.jiosaavn.com/api.php')

  url.searchParams.append('__call', endpoint.toString())
  url.searchParams.append('_format', 'json')
  url.searchParams.append('_marker', '0')
  url.searchParams.append('api_version', '4')
  url.searchParams.append('ctx', context || 'web6dot0')

  Object.keys(params).forEach((key) => url.searchParams.append(key, String(params[key])))

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': randomUserAgent,
      ...(cookie ? { Cookie: cookie } : {})
    }
  })

  assertUpstreamOk(response.status, response.ok)

  let data: unknown
  try {
    data = await response.json()
  } catch {
    // A 200 carrying HTML — usually a block page or an outage notice.
    throw new Error('upstream returned a malformed response')
  }

  return { data: data as T, ok: response.ok, status: response.status }
}
