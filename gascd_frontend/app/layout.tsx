import '../src/styles/globals.scss';
import Axe from '../src/utils/axe';
import { Viewport } from 'next';
import { AppInsightsInitializer } from '@/components/analytics/AppInsightsInitializer';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Header from '@/components/common/header/Header';
import ServiceName from '@/components/common/service-name/ServiceName';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

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
  // Server-side mocking is set up here (rather than instrumentation.ts)
  // to avoid issues with hot-reloading
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.MOCK_SERVER === 'true'
  ) {
    const { server } = await import('@/mocks/node');
    server.listen({ onUnhandledRequest: 'bypass' });
  }

  const browserInsightsConnectionString =
    process.env.BROWSER_APPLICATIONINSIGHTS_CONNECTION_STRING || '';
  const ONELOGIN_HOME_URL = process.env.ONELOGIN_HOME_URL || '';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <html lang="en" className="govuk-template govuk-template--rebranded">
      <Axe />
      <body className="govuk-template__body extra-page-width-1400 js-enabled govuk-frontend-supported">
        <AppInsightsInitializer
          connectionString={browserInsightsConnectionString}
          session={session}
        />
        <Header session={session} account_url={ONELOGIN_HOME_URL} />
        <ServiceName session={session} />
        {children}
      </body>
    </html>
  );
}
