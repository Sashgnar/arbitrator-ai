// concepts/Invitation.ts
import { Concept } from '@legible-sync/core';
import { createServerClient } from '../lib/supabase';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const Invitation: Concept = {
  state: {},

  async execute(action: string, input: any) {
    const supabase = createServerClient();

    if (action === 'generate') {
      const { invitationId, disputeId, email } = input;
      const code = generateCode();

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          id: invitationId,
          dispute_id: disputeId,
          code,
          email: email || null,
          used: false,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { invitationId, code, disputeId, email };
    }

    if (action === 'validate') {
      const { code } = input;

      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !invitation) return { valid: false, reason: 'Invitation not found' };
      if (invitation.used) return { valid: false, reason: 'Invitation already used' };

      return { valid: true, invitationId: invitation.id, disputeId: invitation.dispute_id };
    }

    if (action === 'consume') {
      const { code, userId } = input;

      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', code)
        .single();

      if (fetchError || !invitation) throw new Error('Invitation not found');
      if (invitation.used) throw new Error('Invitation already used');

      const { error: updateError } = await supabase
        .from('invitations')
        .update({ used: true })
        .eq('id', invitation.id);

      if (updateError) throw new Error(updateError.message);

      return { invitationId: invitation.id, disputeId: invitation.dispute_id, userId, consumed: true };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
