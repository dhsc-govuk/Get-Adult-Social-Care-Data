import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';
import { Viewport } from 'next';
import { AppInsightsInitializer } from '@/components/analytics/AppInsightsInitializer';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

export const viewport: Viewport = {
  themeColor: '#1d70b8',
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const browserInsightsConnectionString =
    process.env.BROWSER_APPLICATIONINSIGHTS_CONNECTION_STRING || '';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <html lang="en" className="govuk-template--rebranded">
      <Axe />
      <body className="govuk-frontend-supported govuk-template__body">
        <AppInsightsInitializer
          connectionString={browserInsightsConnectionString}
          session={session}
        />
        {children}
      </body>
    </html>
  );
}
