// Same address One Login sends people back to, so it's right in every environment
export const SIGN_IN_URL = `${process.env.BETTER_AUTH_URL ?? ''}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`;
