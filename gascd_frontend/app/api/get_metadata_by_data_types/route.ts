import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let metric_data_type = searchParams.get('metric_data_type');

  if (process.env.DATA_API_ROOT) {
    const url = process.env.DATA_API_ROOT + '/metadata/metrics';
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  }

  try {
    const pool = await dbPool;
    const results = await pool
      .request()
      .input('metric_data_type', metric_data_type).query(`
        SELECT * FROM metrics.metadata WHERE metric_data_type = @metric_data_type`);

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
