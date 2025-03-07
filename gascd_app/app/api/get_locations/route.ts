import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { authOptions } from '../auth/authOptions';
import { getServerSession } from 'next-auth';

// Handler for HTTP GET request
export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const provider_location_id = reqBody['provider_location_id'];
  const session = await getServerSession(authOptions);
  
  try {
    const query = `
      SELECT 
            a.la_code, 
            a.la_name, 
            b.region_code, 
            b.region_name
        FROM 
            ref.la_lookup AS a
        INNER JOIN (
            SELECT 
                region_code, 
                region_name 
            FROM 
                ref.provider_location_full_lookup
            WHERE 
                provider_location_id = @location_id
        ) AS b
        ON 
        a.region_code = b.region_code;
    `;

    const pool = await connectToDB();
    const request = pool.request();

    if(provider_location_id){
      request.input('location_id',provider_location_id);
    }else{
      request.input('location_id',session?.user.locationId);
    }
      
    const resultSet = await request.query(query);
    const rows: string[] = resultSet.recordset;

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
