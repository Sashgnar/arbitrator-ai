// concepts/Argument.ts
import { Concept } from '@legible-sync/core';
import { createServerClient } from '../lib/supabase';

export const Argument: Concept = {
  state: {},

  async execute(action: string, input: any) {
    const supabase = createServerClient();

    if (action === 'draft') {
      const { argumentId, disputeId, userId, content, evidence } = input;
      if (!content) throw new Error('Content required');

      // Get argument number for this user in this dispute
      const { data: existingArgs, error: countError } = await supabase
        .from('arguments')
        .select('id')
        .eq('dispute_id', disputeId)
        .eq('author_id', userId);

      if (countError) throw new Error(countError.message);

      const argumentNumber = (existingArgs?.length || 0) + 1;

      const { data, error } = await supabase
        .from('arguments')
        .insert({
          id: argumentId,
          dispute_id: disputeId,
          author_id: userId,
          content,
          evidence: evidence || null,
          argument_number: argumentNumber,
          is_final: false,
          ai_assisted: false,
          original_content: null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { argumentId, disputeId, authorId: userId, argumentNumber, content, isFinal: false };
    }

    if (action === 'update') {
      const { argumentId, content, aiAssisted, originalContent } = input;

      const { data: argument, error: fetchError } = await supabase
        .from('arguments')
        .select('*')
        .eq('id', argumentId)
        .single();

      if (fetchError || !argument) throw new Error('Argument not found');
      if (argument.is_final) throw new Error('Cannot update finalized argument');

      const updates: Record<string, any> = {};
      if (content !== undefined) updates.content = content;
      if (aiAssisted !== undefined) updates.ai_assisted = aiAssisted;
      if (originalContent !== undefined) updates.original_content = originalContent;

      const { data: updated, error: updateError } = await supabase
        .from('arguments')
        .update(updates)
        .eq('id', argumentId)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      return { argumentId, content: updated.content, aiAssisted: updated.ai_assisted, updated: true };
    }

    if (action === 'finalize') {
      const { argumentId } = input;

      const { data: argument, error: fetchError } = await supabase
        .from('arguments')
        .select('*')
        .eq('id', argumentId)
        .single();

      if (fetchError || !argument) throw new Error('Argument not found');
      if (argument.is_final) throw new Error('Argument already finalized');

      const { error: updateError } = await supabase
        .from('arguments')
        .update({ is_final: true })
        .eq('id', argumentId);

      if (updateError) throw new Error(updateError.message);

      return {
        argumentId,
        disputeId: argument.dispute_id,
        authorId: argument.author_id,
        argumentNumber: argument.argument_number,
        content: argument.content,
        isFinal: true,
      };
    }

    if (action === 'getByDispute') {
      const { disputeId } = input;

      const { data: args, error } = await supabase
        .from('arguments')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('argument_number', { ascending: true });

      if (error) throw new Error(error.message);

      // Map snake_case to camelCase
      const mappedArgs = (args || []).map(arg => ({
        id: arg.id,
        disputeId: arg.dispute_id,
        authorId: arg.author_id,
        content: arg.content,
        evidence: arg.evidence,
        argumentNumber: arg.argument_number,
        isFinal: arg.is_final,
        aiAssisted: arg.ai_assisted,
        originalContent: arg.original_content,
        createdAt: arg.created_at,
        updatedAt: arg.updated_at,
      }));

      return { arguments: mappedArgs };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
