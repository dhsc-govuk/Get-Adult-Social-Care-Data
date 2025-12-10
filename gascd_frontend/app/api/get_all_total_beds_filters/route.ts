import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
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
