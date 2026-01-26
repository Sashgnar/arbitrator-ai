import { NextRequest, NextResponse } from 'next/server';
import { createEngine } from '../../../../../lib/engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const engine = createEngine();

    const result = await engine.invoke(
      'Argument',
      'finalize',
      { argumentId: id },
      `finalize-argument-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error finalizing argument:', error);
    return NextResponse.json({ error: 'Failed to finalize argument' }, { status: 500 });
  }
}
