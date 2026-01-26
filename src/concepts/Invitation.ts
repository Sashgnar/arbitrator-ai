// concepts/Invitation.ts
import { Concept } from '@legible-sync/core';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const Invitation: Concept = {
  state: {
    invitations: new Map<string, any>(),
    codeIndex: new Map<string, string>(), // code -> invitationId
  },

  async execute(action: string, input: any) {
    const state = this.state;

    if (action === 'generate') {
      const { invitationId, disputeId, email } = input;
      const code = generateCode();

      const invitation = {
        id: invitationId,
        disputeId,
        code,
        email: email || null,
        used: false,
        createdAt: new Date().toISOString(),
      };

      state.invitations.set(invitationId, invitation);
      state.codeIndex.set(code, invitationId);

      return { invitationId, code, disputeId, email };
    }

    if (action === 'validate') {
      const { code } = input;
      const invitationId = state.codeIndex.get(code);
      if (!invitationId) return { valid: false, reason: 'Invitation not found' };

      const invitation = state.invitations.get(invitationId);
      if (invitation.used) return { valid: false, reason: 'Invitation already used' };

      return { valid: true, invitationId, disputeId: invitation.disputeId };
    }

    if (action === 'consume') {
      const { code, userId } = input;
      const invitationId = state.codeIndex.get(code);
      if (!invitationId) throw new Error('Invitation not found');

      const invitation = state.invitations.get(invitationId);
      if (invitation.used) throw new Error('Invitation already used');

      invitation.used = true;

      return { invitationId, disputeId: invitation.disputeId, userId, consumed: true };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
