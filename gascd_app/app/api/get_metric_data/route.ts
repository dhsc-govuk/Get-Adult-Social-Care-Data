import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';

// Handler for HTTP GET request
export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const resultSet = await pool
      .request()
      .query('SELECT * FROM metrics.all_metrics where location_id = \'E06000001\'');
    const rows: Indicator[] = resultSet.recordset;

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
