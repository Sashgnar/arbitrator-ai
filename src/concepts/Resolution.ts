// concepts/Resolution.ts
import { Concept } from '@legible-sync/core';
import { createServerClient } from '../lib/supabase';

export const Resolution: Concept = {
  state: {},

  async execute(action: string, input: any) {
    const supabase = createServerClient();

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

      // Check if resolution already exists
      const { data: existing } = await supabase
        .from('resolutions')
        .select('id')
        .eq('dispute_id', disputeId)
        .single();

      if (existing) {
        throw new Error('Resolution already exists for this dispute');
      }

      const { data, error } = await supabase
        .from('resolutions')
        .insert({
          id: resolutionId,
          dispute_id: disputeId,
          summary,
          detailed_analysis: detailedAnalysis,
          verdict,
          party_a_eval: partyAEval || null,
          party_b_eval: partyBEval || null,
          key_factors: keyFactors || [],
          recommendations: recommendations || [],
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { resolutionId, disputeId, summary, verdict };
    }

    if (action === 'get') {
      const { disputeId } = input;

      const { data: resolution, error } = await supabase
        .from('resolutions')
        .select('*')
        .eq('dispute_id', disputeId)
        .single();

      if (error || !resolution) return { resolution: null };

      // Map snake_case to camelCase
      return {
        resolution: {
          id: resolution.id,
          disputeId: resolution.dispute_id,
          summary: resolution.summary,
          detailedAnalysis: resolution.detailed_analysis,
          verdict: resolution.verdict,
          partyAEval: resolution.party_a_eval,
          partyBEval: resolution.party_b_eval,
          keyFactors: resolution.key_factors,
          recommendations: resolution.recommendations,
          createdAt: resolution.created_at,
        }
      };
    }

    if (action === 'getById') {
      const { resolutionId } = input;

      const { data: resolution, error } = await supabase
        .from('resolutions')
        .select('*')
        .eq('id', resolutionId)
        .single();

      if (error || !resolution) throw new Error('Resolution not found');

      // Map snake_case to camelCase
      return {
        resolution: {
          id: resolution.id,
          disputeId: resolution.dispute_id,
          summary: resolution.summary,
          detailedAnalysis: resolution.detailed_analysis,
          verdict: resolution.verdict,
          partyAEval: resolution.party_a_eval,
          partyBEval: resolution.party_b_eval,
          keyFactors: resolution.key_factors,
          recommendations: resolution.recommendations,
          createdAt: resolution.created_at,
        }
      };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
