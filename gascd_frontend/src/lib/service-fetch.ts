export async function serviceFetch(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const response = await (init === undefined
    ? fetch(input)
    : fetch(input, init));
  if (
    typeof window !== 'undefined' &&
    (response.status === 429 || response.status === 503)
  ) {
    const raw = response.headers?.get('Retry-After');
    const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : undefined;
    window.dispatchEvent(
      new CustomEvent('gascd-service-busy', {
        detail: { status: response.status, seconds },
      })
    );
  }
  return response;
}
