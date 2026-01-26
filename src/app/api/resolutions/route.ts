import { NextRequest, NextResponse } from 'next/server';
import { createEngine, globalState } from '../../../lib/engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get('disputeId');

    if (!disputeId) {
      return NextResponse.json({ error: 'Dispute ID is required' }, { status: 400 });
    }

    const resolutionId = globalState.resolutionsByDispute.get(disputeId);
    if (!resolutionId) {
      return NextResponse.json({ resolution: null });
    }

    const resolution = globalState.resolutions.get(resolutionId);
    return NextResponse.json({ resolution });
  } catch (error) {
    console.error('Error fetching resolution:', error);
    return NextResponse.json({ error: 'Failed to fetch resolution' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { disputeId, summary, detailedAnalysis, verdict, partyAEval, partyBEval, keyFactors, recommendations } = await request.json();

    if (!disputeId || !summary || !verdict) {
      return NextResponse.json(
        { error: 'Dispute ID, summary, and verdict are required' },
        { status: 400 }
      );
    }

    const engine = createEngine();
    const resolutionId = `resolution-${Date.now()}`;

    const result = await engine.invoke(
      'Resolution',
      'generate',
      {
        resolutionId,
        disputeId,
        summary,
        detailedAnalysis,
        verdict,
        partyAEval,
        partyBEval,
        keyFactors,
        recommendations,
      },
      `generate-resolution-${Date.now()}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating resolution:', error);
    return NextResponse.json({ error: 'Failed to generate resolution' }, { status: 500 });
  }
}
