import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';

// Handler for HTTP GET request
export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const resultSet = await pool
      .request()
      .query('SELECT * FROM metrics.metadata');
    const rows: IndicatorDisplay[] = resultSet.recordset;

    await pool.close();
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
