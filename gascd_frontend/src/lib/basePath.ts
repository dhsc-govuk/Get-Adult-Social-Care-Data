export const withBasePath = (path: string, context?: 'client' | 'server') => {
  const env =
    context === 'server'
      ? process.env.BASE_PATH
      : process.env.NEXT_PUBLIC_BASE_PATH;

  return `${env ?? ''}${path}`;
};
