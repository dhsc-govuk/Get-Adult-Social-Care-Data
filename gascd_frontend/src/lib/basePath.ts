// Prefix a path with the app's configured base path.
// On the server BASE_PATH is available at runtime; in the browser bundle only
// NEXT_PUBLIC_BASE_PATH is inlined at build time, so fall through to it.
export const withBasePath = (path: string) =>
  `${process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
