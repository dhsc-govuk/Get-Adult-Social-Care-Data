import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import logger from '@/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const queryParams = await req.json();

    const request = pool.request();

    const { queryString, request_with_param } =
      QueryBuilderService.createGetSmartInsightsQuery(queryParams, request);

    const resultSet = await request_with_param.query(queryString);

    const rows: string[] = resultSet.recordset.map((row) => row.smart_insights);

    await pool.close();
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

export async function GET(req: NextRequest) {
  try {
    const pool = await connectToDB();

    const resultSet = await pool
      .request()
      .query('SELECT * FROM metrics.smart_insights');

    const rows = resultSet.recordset;

    await pool.close();
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
