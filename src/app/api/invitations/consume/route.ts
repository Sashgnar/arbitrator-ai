import { NextRequest, NextResponse } from 'next/server';
import { createEngine } from '../../../../lib/engine';

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Invitation code and user ID are required' },
        { status: 400 }
      );
    }

    const engine = createEngine();
    const result = await engine.invoke(
      'Invitation',
      'consume',
      { code, userId },
      `consume-invitation-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error consuming invitation:', error);
    return NextResponse.json({ error: 'Failed to consume invitation' }, { status: 500 });
  }
}
