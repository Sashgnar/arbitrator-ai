import { NextRequest, NextResponse } from 'next/server';
import { createEngine } from '../../../../lib/engine';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Invitation code is required' }, { status: 400 });
    }

    const engine = createEngine();
    const result = await engine.invoke(
      'Invitation',
      'validate',
      { code },
      `validate-invitation-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 });
  }
}
