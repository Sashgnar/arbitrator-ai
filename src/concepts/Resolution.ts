// concepts/Resolution.ts
import { Concept } from '@legible-sync/core';

export const Resolution: Concept = {
  state: {
    resolutions: new Map<string, any>(),
    byDispute: new Map<string, string>(), // disputeId -> resolutionId
  },

  async execute(action: string, input: any) {
    const state = this.state;

    if (action === 'generate') {
      const {
        resolutionId,
        disputeId,
        summary,
        detailedAnalysis,
        verdict,
        partyAEval,
        partyBEval,
        keyFactors,
        recommendations,
      } = input;

      if (state.byDispute.has(disputeId)) {
        throw new Error('Resolution already exists for this dispute');
      }

      const resolution = {
        id: resolutionId,
        disputeId,
        summary,
        detailedAnalysis,
        verdict,
        partyAEval: partyAEval || null,
        partyBEval: partyBEval || null,
        keyFactors: keyFactors || [],
        recommendations: recommendations || [],
        createdAt: new Date().toISOString(),
      };

      state.resolutions.set(resolutionId, resolution);
      state.byDispute.set(disputeId, resolutionId);

      return { resolutionId, disputeId, summary, verdict };
    }

    if (action === 'get') {
      const { disputeId } = input;
      const resolutionId = state.byDispute.get(disputeId);
      if (!resolutionId) return { resolution: null };

      const resolution = state.resolutions.get(resolutionId);
      return { resolution };
    }

    if (action === 'getById') {
      const { resolutionId } = input;
      const resolution = state.resolutions.get(resolutionId);
      if (!resolution) throw new Error('Resolution not found');
      return { resolution };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
