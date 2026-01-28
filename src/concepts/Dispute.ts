// concepts/Dispute.ts
import { Concept } from '@legible-sync/core';
import { createServerClient } from '../lib/supabase';

export const Dispute: Concept = {
  state: {},

  async execute(action: string, input: any) {
    const supabase = createServerClient();

    if (action === 'create') {
      const { disputeId, userId, title, description, maxArguments = 5 } = input;
      if (!title) throw new Error('Title required');

      const { data, error } = await supabase
        .from('disputes')
        .insert({
          id: disputeId,
          title,
          description: description || null,
          creator_id: userId,
          opponent_id: null,
          status: 'pending_opponent',
          max_arguments: maxArguments,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { disputeId, title, creatorId: userId, status: 'pending_opponent' };
    }

    if (action === 'join') {
      const { disputeId, userId } = input;

      const { data: dispute, error: fetchError } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (fetchError || !dispute) throw new Error('Dispute not found');
      if (dispute.status !== 'pending_opponent') throw new Error('Dispute not accepting opponents');
      if (dispute.creator_id === userId) throw new Error('Cannot join your own dispute');

      const { error: updateError } = await supabase
        .from('disputes')
        .update({ opponent_id: userId, status: 'arguing' })
        .eq('id', disputeId);

      if (updateError) throw new Error(updateError.message);

      return { disputeId, opponentId: userId, status: 'arguing' };
    }

    if (action === 'updateStatus') {
      const { disputeId, status } = input;

      const { data: dispute, error: fetchError } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (fetchError || !dispute) throw new Error('Dispute not found');

      const { error: updateError } = await supabase
        .from('disputes')
        .update({ status })
        .eq('id', disputeId);

      if (updateError) throw new Error(updateError.message);

      return { disputeId, status };
    }

    if (action === 'get') {
      const { disputeId } = input;

      const { data: dispute, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (error || !dispute) throw new Error('Dispute not found');

      // Map snake_case to camelCase for API compatibility
      return {
        dispute: {
          id: dispute.id,
          title: dispute.title,
          description: dispute.description,
          creatorId: dispute.creator_id,
          opponentId: dispute.opponent_id,
          status: dispute.status,
          maxArguments: dispute.max_arguments,
          deadline: dispute.deadline,
          createdAt: dispute.created_at,
          updatedAt: dispute.updated_at,
        }
      };
    }

    if (action === 'close') {
      const { disputeId } = input;

      const { data: dispute, error: fetchError } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .single();

      if (fetchError || !dispute) throw new Error('Dispute not found');

      const { error: updateError } = await supabase
        .from('disputes')
        .update({ status: 'closed' })
        .eq('id', disputeId);

      if (updateError) throw new Error(updateError.message);

      return { disputeId, status: 'closed' };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
