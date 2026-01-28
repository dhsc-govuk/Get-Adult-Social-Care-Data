import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const metric_group_code = 'bedcount_per_hundred_thousand_adults';
  if (process.env.DATA_API_ROOT) {
    const client = getAPIClient();
    const { data, error } = await client.GET(
      '/metric_filters/{metric_group_code}',
      {
        params: {
          path: {
            metric_group_code: metric_group_code,
          },
        },
      }
    );
    if (data && data.metric_filters) {
      const rows = data.metric_filters.map((row) => ({
        metric_id: row.metric_code,
        filter_bedtype: row.filter_type,
        checked: false,
      }));
      return NextResponse.json(rows);
    } else {
      logger.error(`No filters found for ${metric_group_code}`);
      return NextResponse.json(
        { error: `Error fetching filters data` },
        { status: 500 }
      );
    }
  }
}
