import NextAuthSessionProvider from '@/providers/SessionProvider';
import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';
import { Viewport } from 'next';
import { AppInsightsInitializer } from '@/components/analytics/AppInsightsInitializer';

export const viewport: Viewport = {
  themeColor: '#1d70b8',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const browserInsightsConnectionString =
    process.env.BROWSER_APPLICATIONINSIGHTS_CONNECTION_STRING || '';
  return (
    <html lang="en" className="govuk-template--rebranded">
      <Axe />
      <NextAuthSessionProvider>
        <body className="govuk-frontend-supported govuk-template__body">
          <AppInsightsInitializer
            connectionString={browserInsightsConnectionString}
          />
          {children}
        </body>
      </NextAuthSessionProvider>
    </html>
  );
}
