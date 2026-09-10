import { getAPIClient } from '@/data/dataAPI';
import { createNewDBUser } from '@/lib/create-new-user';
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';

type RegisterLAUserResult = { registered: boolean; error?: unknown };
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const DEFAULT_RESPONSE: RegisterLAUserResult = { registered: false };
  try {
    if (email != null) {
      const requestHeaders = new Headers(req.headers);
      const url = new URL(req.url);
      console.log('@@@@', url, requestHeaders);

      // Insert into database
      const result = await createNewDBUser(email ?? null);
      if (result) {
        // Trigger email invitation via the external dotnet Data API
        const api = getAPIClient();
        const { data, error } = await api.POST('/onboarding/register', {
          body: { email },
        });

        if (error || !data?.registered) {
          return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
        }

        console.log('++++', data);

        const isRegistered = data.registered;
        DEFAULT_RESPONSE.registered = isRegistered;

        return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
      }
    }
    return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
  } catch (error) {
    logger.error('There was a problem with your request', { error });
    DEFAULT_RESPONSE.error = error;
    return NextResponse.json(DEFAULT_RESPONSE, { status: 400 });
  }
}
