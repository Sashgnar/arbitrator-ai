// concepts/Acceptance.ts
import { Concept } from '@legible-sync/core';
import { createServerClient } from '../lib/supabase';

export const Acceptance: Concept = {
  state: {},

  async execute(action: string, input: any) {
    const supabase = createServerClient();

    if (action === 'accept') {
      const { acceptanceId, resolutionId, userId, disputeId } = input;

      // Check for existing acceptance
      const { data: existing } = await supabase
        .from('acceptances')
        .select('*')
        .eq('resolution_id', resolutionId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from('acceptances')
          .update({ accepted: true, feedback: null })
          .eq('id', existing.id);

        if (updateError) throw new Error(updateError.message);
        return { acceptanceId: existing.id, resolutionId, userId, disputeId, accepted: true };
      }

      const { data, error } = await supabase
        .from('acceptances')
        .insert({
          id: acceptanceId,
          resolution_id: resolutionId,
          user_id: userId,
          accepted: true,
          feedback: null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { acceptanceId, resolutionId, userId, disputeId, accepted: true };
    }

    if (action === 'reject') {
      const { acceptanceId, resolutionId, userId, disputeId, feedback } = input;

      // Check for existing acceptance
      const { data: existing } = await supabase
        .from('acceptances')
        .select('*')
        .eq('resolution_id', resolutionId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from('acceptances')
          .update({ accepted: false, feedback: feedback || null })
          .eq('id', existing.id);

        if (updateError) throw new Error(updateError.message);
        return { acceptanceId: existing.id, resolutionId, userId, disputeId, accepted: false, feedback };
      }

      const { data, error } = await supabase
        .from('acceptances')
        .insert({
          id: acceptanceId,
          resolution_id: resolutionId,
          user_id: userId,
          accepted: false,
          feedback: feedback || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { acceptanceId, resolutionId, userId, disputeId, accepted: false, feedback };
    }

    if (action === 'getStatus') {
      const { resolutionId, creatorId, opponentId } = input;

      const { data: creatorAcceptance } = await supabase
        .from('acceptances')
        .select('*')
        .eq('resolution_id', resolutionId)
        .eq('user_id', creatorId)
        .single();

      const { data: opponentAcceptance } = await supabase
        .from('acceptances')
        .select('*')
        .eq('resolution_id', resolutionId)
        .eq('user_id', opponentId)
        .single();

      const bothAccepted = creatorAcceptance?.accepted === true && opponentAcceptance?.accepted === true;

      return {
        resolutionId,
        creatorAccepted: creatorAcceptance?.accepted ?? null,
        opponentAccepted: opponentAcceptance?.accepted ?? null,
        bothAccepted,
      };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
