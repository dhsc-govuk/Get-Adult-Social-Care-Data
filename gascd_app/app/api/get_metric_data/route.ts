import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

export async function POST(req: NextRequest) {
  try {
    const pool = await connectToDB();
    const queryParams = await req.json();

    if (!queryParams.metric_ids || !queryParams.location_ids) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const request = pool.request();
    const { queryString , request_with_param } =
      QueryBuilderService.createGetIndicatorQuery(queryParams, request);

    const resultSet = await request_with_param.query(queryString);

    console.log(queryString);

    const rows: Indicator[] = resultSet.recordset;
    await pool.close();

    console.log(rows);
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
