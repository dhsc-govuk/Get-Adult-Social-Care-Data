import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';

export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const resultSet = await pool
      .request()
      .query(
        "SELECT metric_id, filter_bedtype FROM metrics.metadata WHERE group_id = 'bedcount_per_100000_adults'"
      );
    const rows: TotalBedsFilters[] = resultSet.recordset.map(
      (row: TotalBedsFilters) => ({
        ...row,
        checked: false,
      })
    );
    await pool.close();
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
