import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    let region_code = searchParams.get('region_code');

    if (process.env.DATA_API_ROOT) {
        const url =
            process.env.DATA_API_ROOT + '/metric_location/regions/?code=' + region_code;

        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ error: 'DATA_API_ROOT not configured' }, { status: 500 });
};