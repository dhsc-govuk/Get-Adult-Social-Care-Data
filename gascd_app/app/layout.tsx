import NextAuthSessionProvider from '@/providers/SessionProvider';
import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';

export default async function RootLayout({
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
