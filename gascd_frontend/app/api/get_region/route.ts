import { getAPIClient } from '@/data/dataAPI';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let code = searchParams.get('region_code');

  if (!code) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (process.env.DATA_API_ROOT) {
    try {
      const client = getAPIClient();
      const { data } = await client.GET('/metric_locations/regions/{code}', {
        params: {
          path: {
            code: code,
          },
        },
      });

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
