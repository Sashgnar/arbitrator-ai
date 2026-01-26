import { NextRequest, NextResponse } from 'next/server';
import { createEngine } from '../../../lib/engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolutionId = searchParams.get('resolutionId');
    const creatorId = searchParams.get('creatorId');
    const opponentId = searchParams.get('opponentId');

    if (!resolutionId || !creatorId || !opponentId) {
      return NextResponse.json(
        { error: 'Resolution ID, creator ID, and opponent ID are required' },
        { status: 400 }
      );
    }

    const engine = createEngine();
    const result = await engine.invoke(
      'Acceptance',
      'getStatus',
      { resolutionId, creatorId, opponentId },
      `get-acceptance-status-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching acceptance status:', error);
    return NextResponse.json({ error: 'Failed to fetch acceptance status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { resolutionId, userId, accepted, feedback } = await request.json();

    if (!resolutionId || !userId || typeof accepted !== 'boolean') {
      return NextResponse.json(
        { error: 'Resolution ID, user ID, and accepted status are required' },
        { status: 400 }
      );
    }

    const engine = createEngine();
    const acceptanceId = `acceptance-${Date.now()}`;
    const action = accepted ? 'accept' : 'reject';

    const result = await engine.invoke(
      'Acceptance',
      action,
      { acceptanceId, resolutionId, userId, feedback },
      `${action}-resolution-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error recording acceptance:', error);
    return NextResponse.json({ error: 'Failed to record acceptance' }, { status: 500 });
  }
}
