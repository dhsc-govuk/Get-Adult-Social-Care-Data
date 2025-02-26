import NextAuthSessionProvider from '@/providers/SessionProvider';
import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/authOptions';
import { redirect } from 'next/navigation';
import { verifyAuthToken } from '../src/helpers/auth/verifyAuthToken';
import AuthLayout from './(protected)/layout';

export const metadata = {
  title: 'DHSC: Get Adult Social Care Data',
  description:
    'Department of Health and Social Care: Get Adult Social Care Data Platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <Axe />      
        <body className="govuk-frontend-supported">
          {children}
          </body>
        
    </html>
  );
}
