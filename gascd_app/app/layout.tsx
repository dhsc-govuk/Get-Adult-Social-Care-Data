import NextAuthSessionProvider from '@/providers/SessionProvider';
import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';

export const metadata = {
  title: 'DHSC: Get Adult Social Care Data',
  description:
    'Department of Health and Social Care: Get Adult Social Care Data Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Axe />
      <NextAuthSessionProvider>
        <body className="govuk-frontend-supported">{children}</body>
      </NextAuthSessionProvider>
    </html>
  );
}
