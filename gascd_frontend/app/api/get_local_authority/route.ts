import type { paths } from '@/metrics-api-schema';
import { NextRequest, NextResponse } from 'next/server';
import createClient from 'openapi-fetch';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let code = searchParams.get('la_code');

  if (!code) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (process.env.DATA_API_ROOT) {
    try {
      const client = createClient<paths>({
        baseUrl: process.env.DATA_API_ROOT,
      });
      const { data } = await client.GET(
        '/metric_location/local_authorities/{la_code}',
        {
          params: {
            path: {
              la_code: code,
            },
          },
        }
      );

      if (!data) {
        return NextResponse.json({ error: 'No data found' }, { status: 404 });
      }
      return NextResponse.json({ data: data }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error fetching data' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'DATA_API_ROOT not configured' },
    { status: 500 }
  );
}
