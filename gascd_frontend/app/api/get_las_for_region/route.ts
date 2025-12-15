import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';

export async function GET(req: NextRequest) {
  try {
    const pool = await dbPool;
    const { searchParams } = new URL(req.url);
    let region_code = searchParams.get('region_code');

    const resultSet = await pool
      .request()
      .input('region_code', region_code)
      .query('SELECT * FROM ref.la_lookup WHERE region_code = @region_code');

    const rows = resultSet.recordset;

    return NextResponse.json(rows);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
