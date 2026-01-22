import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';

export async function GET(req: NextRequest) {
  const metric_group_code = 'bedcount_per_100000_adults';
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
    if (data && data.metrics) {
      const rows = data.metrics.map((row) => ({
        metric_id: row.metric_code,
        filter_bedtype: row.display_name,
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

  try {
    const pool = await dbPool;
    const resultSet = await pool
      .request()
      .query(
        "SELECT DISTINCT metric_id, filter_bedtype FROM metrics.metadata WHERE group_id = 'bedcount_per_100000_adults'"
      );
    const rows: TotalBedsFilters[] = resultSet.recordset.map(
      (row: TotalBedsFilters) => ({
        ...row,
        checked: false,
      })
    );
    return NextResponse.json(rows);
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
