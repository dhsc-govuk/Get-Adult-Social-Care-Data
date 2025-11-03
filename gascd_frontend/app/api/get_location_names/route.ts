import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { Location } from '@/data/interfaces/Location';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';

export async function POST(req: NextRequest) {
  try {
    const pool = await dbPool;
    const queryParams = await req.json();

    const request = pool.request();

    const { queryString, request_with_param } =
      QueryBuilderService.createGetLocationNamesQuery(queryParams, request);

    const resultSet = await request_with_param.query(queryString);

    const rows: Location[] = resultSet.recordset;

    return NextResponse.json(rows);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const pool = await dbPool;

    const resultSet = await pool.request().query('SELECT * FROM ref.la_lookup');

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
