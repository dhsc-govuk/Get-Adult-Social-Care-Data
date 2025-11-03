'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../app/api/auth/authOptions';
import { trace } from '@opentelemetry/api';
import { ATTR_ENDUSER_ID } from '@opentelemetry/semantic-conventions/incubating';

// Server side helper to add user details to the current trace
export const addUserTelemetry = async () => {
  // Note - when connected to app insights, the server-side user telemetry is added to the items in the 'dependencies' table
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    let activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      console.log('Adding user telemetry for ' + session.user.id);
      // Note - this would be better handled in middleware to apply to all telemetry
      activeSpan.setAttribute(ATTR_ENDUSER_ID, session.user.id);
      if (session.user.locationId) {
        activeSpan.setAttribute('userOrganisationId', session.user.locationId);
      }
      if (session.user.locationType) {
        activeSpan.setAttribute(
          'userOrganisationType',
          session.user.locationType
        );
      }
    }
  }
};
