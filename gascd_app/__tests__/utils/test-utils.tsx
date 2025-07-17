import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

// Mock session for jest page tests
export const mockSession: any = {
  expires: '1',
  user: {
    locationType: '',
    locationId: '',
    smartInsights: false,
  },
};

// Simulates the authenticated layout in app/layout.tsx
const TestSessionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider session={mockSession}>{children}</SessionProvider>;
};

// Create a custom render function that uses the Wrapper
export const renderWithSession = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestSessionWrapper, ...options });
