import { NextRequest, NextResponse } from 'next/server';
import { createEngine, globalState } from '../../../lib/engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get('disputeId');

    if (!disputeId) {
      return NextResponse.json({ error: 'Dispute ID is required' }, { status: 400 });
    }

    const argumentIds = globalState.argumentsByDispute.get(disputeId) || [];
    const args = argumentIds.map(id => globalState.arguments.get(id)).filter(Boolean);

    return NextResponse.json({ arguments: args });
  } catch (error) {
    console.error('Error fetching arguments:', error);
    return NextResponse.json({ error: 'Failed to fetch arguments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { disputeId, userId, content, evidence } = await request.json();

    if (!disputeId || !userId || !content) {
      return NextResponse.json(
        { error: 'Dispute ID, user ID, and content are required' },
        { status: 400 }
      );
    }

    const engine = createEngine();
    const argumentId = `arg-${Date.now()}`;

    const result = await engine.invoke(
      'Argument',
      'draft',
      { argumentId, disputeId, userId, content, evidence },
      `draft-argument-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating argument:', error);
    return NextResponse.json({ error: 'Failed to create argument' }, { status: 500 });
  }
}
