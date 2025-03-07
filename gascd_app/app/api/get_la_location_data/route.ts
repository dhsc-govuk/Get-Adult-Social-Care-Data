import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';

export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const { searchParams } = new URL(req.url);
    let la_code = searchParams.get('la_code');
    const resultSet = await pool.request().input('la_code', la_code).query(`
        SELECT distinct
           la_code,
           la_name,
           region_code,
           region_name,
           country_code,
           country_name,
           load_date_time
        FROM ref.provider_location_full_lookup
        WHERE la_code = @la_code
      `);

    await pool.close();
    return NextResponse.json(resultSet.recordset[0], { status: 200 });
  } catch (err) {
    console.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
