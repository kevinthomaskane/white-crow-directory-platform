const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempt = 0
): Promise<Response> {
  const res = await fetch(url, options);

  if (res.ok) {
    return res;
  }

  // Retry on 5xx errors or 429 (rate limit)
  const shouldRetry = res.status >= 500 || res.status === 429;

  if (shouldRetry && attempt < MAX_RETRIES) {
    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
    console.log(
      `  Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
    );
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, options, attempt + 1);
  }

  return res;
}
