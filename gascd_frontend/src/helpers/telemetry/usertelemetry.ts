'use server';

import { auth } from '@/lib/auth';
import { trace } from '@opentelemetry/api';
import { ATTR_ENDUSER_ID } from '@opentelemetry/semantic-conventions/incubating';
import { headers } from 'next/headers';
import { PRIMARY_LOCATION_ID, PRIMARY_LOCATION_TYPE } from '@/constants';

// Server side helper to add user details to the current trace
export const addUserTelemetry = async () => {
  // Note - when connected to app insights, the server-side user telemetry is added to the items in the 'dependencies' table
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.id) {
    let activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      // Note - this would be better handled in middleware to apply to all telemetry
      activeSpan.setAttribute(ATTR_ENDUSER_ID, session.user.id);
      if (session.user.locationId) {
        activeSpan.setAttribute(PRIMARY_LOCATION_ID, session.user.locationId);
      }
      if (session.user.locationType) {
        activeSpan.setAttribute(
          PRIMARY_LOCATION_TYPE,
          session.user.locationType
        );
      }
    }
  }
};
