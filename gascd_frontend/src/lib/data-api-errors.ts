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
      const throttled = error.status === 429;
      return Response.json(
        {
          code: throttled ? 'RATE_LIMITED' : 'DATA_API_UNAVAILABLE',
          error: throttled
            ? 'The data service is busy. Please try again shortly.'
            : 'The data service is currently unavailable. Please try again later.',
        },
        { status: error.status, headers }
      );
    }
  };
}
