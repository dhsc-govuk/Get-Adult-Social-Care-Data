import NextAuthSessionProvider from '@/providers/SessionProvider';
import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';
import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: '#1d70b8',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="govuk-template--rebranded">
      <Axe />
      <NextAuthSessionProvider>
        <body className="govuk-frontend-supported govuk-template__body">{children}</body>
      </NextAuthSessionProvider>
    </html>
  );
}

