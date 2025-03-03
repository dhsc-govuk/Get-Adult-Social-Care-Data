import { withAuth } from 'next-auth/middleware';
export default withAuth(async function middleware(req) {}, {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});
