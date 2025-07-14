import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const { searchParams } = new URL(req.url);
    let metric_data_type = searchParams.get('metric_data_type');
    const results = await pool
      .request()
      .input('metric_data_type', metric_data_type).query(`
        SELECT * FROM metrics.metadata WHERE metric_data_type = @metric_data_type`);

    await pool.close();
    return NextResponse.json(results.recordset, { status: 200 });
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
