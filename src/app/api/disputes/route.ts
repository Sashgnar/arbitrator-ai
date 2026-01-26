import { NextRequest, NextResponse } from 'next/server';
import { createEngine, globalState } from '../../../lib/engine';

export async function GET() {
  try {
    const disputes = Array.from(globalState.disputes.values());
    return NextResponse.json({ disputes });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, userId } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const engine = createEngine();
    const disputeId = `dispute-${Date.now()}`;

    const result = await engine.invoke(
      'Dispute',
      'create',
      { disputeId, userId, title, description },
      `create-dispute-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 });
  }
}
