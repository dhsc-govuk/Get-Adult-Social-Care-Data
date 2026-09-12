import { getAPIClient } from '@/data/dataAPI';
import { createNewDBUser } from '@/lib/create-new-user';
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { isAcceptableEmail } from '@/lib/domain-check';

type RegisterLAUserResult = { registered: boolean; error?: string | null };
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const DEFAULT_RESPONSE: RegisterLAUserResult = { registered: false };
  const ONBOARDING_USER_STATUS_OPTIONS = ['CREATED', 'EXISTS'];
  try {
    if (email != null) {
      const requestHeaders = new Headers(req.headers);
      const url = new URL(req.url);
      console.log('@@@@', url, requestHeaders);

      // Insert into database
      const result = await createNewDBUser(
        isAcceptableEmail(
          email,
          process.env.BASE_URL ?? requestHeaders.get('origin')
        )
      );
      if (result && ONBOARDING_USER_STATUS_OPTIONS.includes(result.dbustatus)) {
        // Trigger email invitation via the external dotnet Data API
        const api = getAPIClient();
        const { data, error } = await api.POST('/onboarding/register', {
          body: { reg_mail: email, reg_full_name: result.dbuid },
        });

        if (error || !data?.message) {
          return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
        }

        console.log('++++', data);

        DEFAULT_RESPONSE.registered = true;

        return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
      }
    }
    return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
  } catch (error) {
    logger.error('There was a problem with your request', { error });

    if (error instanceof Error) {
      DEFAULT_RESPONSE.error = error?.message ?? null;
    }
    return NextResponse.json(DEFAULT_RESPONSE, { status: 400 });
  }
}
