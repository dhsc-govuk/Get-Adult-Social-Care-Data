export class DataApiUnavailableError extends Error {
  constructor(
    public status: number,
    public retryAfter?: string | null
  ) {
    super('Data service temporarily unavailable');
  }
}

export function withDataApiErrors<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (!(error instanceof DataApiUnavailableError)) throw error;
      const headers = new Headers({ 'Cache-Control': 'no-store' });
      if (error.retryAfter && /^\d+$/.test(error.retryAfter))
        headers.set('Retry-After', error.retryAfter);
      return Response.json(
        {
          code: error.status === 429 ? 'RATE_LIMITED' : 'DATA_API_UNAVAILABLE',
          error: 'The data service is busy. Please try again shortly.',
        },
        { status: error.status, headers }
      );
    }
  };
}
