import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

const handlers = toNextJsHandler(auth);

const baseURL = `${process.env.BETTER_AUTH_URL}${process.env.BASE_PATH}`;

function rewriteRequest(req: NextRequest) {
  const { search, pathname } = req.nextUrl;
  const url = new URL(`${baseURL}${pathname}`);
  url.search = search;

  return new NextRequest(url, req);
}

export async function GET(req: NextRequest) {
  const modified = rewriteRequest(req);
  return handlers.GET(modified);
}

export async function POST(req: NextRequest) {
  const modified = rewriteRequest(req);
  return handlers.POST(modified);
}
