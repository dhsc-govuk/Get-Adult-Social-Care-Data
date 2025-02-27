import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';

export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const { searchParams } = new URL(req.url);
    let provider_location_id = searchParams.get('provider_location_id');
    const resultSet = await pool
      .request()
      .input('provider_location_id', provider_location_id).query(`
        SELECT *
        FROM access.metric_location_user_access
        WHERE user_access_location_id = @provider_location_id AND user_access_location_type = 'Care provider location' AND metric_type = 'Capacity Tracker'
      `);

    await pool.close();
    return NextResponse.json(resultSet.recordset, { status: 200 });
  } catch (err) {
    console.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
