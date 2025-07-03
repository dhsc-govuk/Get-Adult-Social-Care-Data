import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';
import { trace, context } from '@opentelemetry/api';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({ status: 403 });
    }
    const body = await req.json();

    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
        activeSpan.addEvent(body.message);
        console.log(body.message)
    }

    return NextResponse.json({ status: 200 });
}
