import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

const baseHandlers = toNextJsHandler(auth);
const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function withRestoredPrefix(
  handler: (req: Request) => Response | Promise<Response>
) {
  if (!prefix) return handler;
  return async (request: Request) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(prefix)) {
      url.pathname = prefix + url.pathname;
    }
    return handler(new Request(url, request));
  };
}

export const POST = withRestoredPrefix(baseHandlers.POST);
export const GET = withRestoredPrefix(baseHandlers.GET);
