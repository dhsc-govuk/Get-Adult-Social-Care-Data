import { withAuth } from 'next-auth/middleware';
export default withAuth(
  async function middleware(req) {
    console.log('Middleware TOKENNNN', req.nextauth.token);
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
