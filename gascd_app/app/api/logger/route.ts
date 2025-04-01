import { NextRequest, NextResponse } from 'next/server';
import AppInsightsLogger from '@/utils/logger';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';

const logger = new AppInsightsLogger(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ?? '');

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({ status: 403 });
    }
    const body = await req.json();
    logger.logEvent(body.message);
    return NextResponse.json({ status: 200 });
}