// concepts/Dispute.ts
import { Concept } from '@legible-sync/core';

export const Dispute: Concept = {
  state: {
    disputes: new Map<string, any>(),
  },

  async execute(action: string, input: any) {
    const state = this.state;

    if (action === 'create') {
      const { disputeId, userId, title, description, maxArguments = 5 } = input;
      if (!title) throw new Error('Title required');

      const dispute = {
        id: disputeId,
        title,
        description: description || null,
        creatorId: userId,
        opponentId: null,
        status: 'pending_opponent',
        maxArguments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.disputes.set(disputeId, dispute);
      return { disputeId, title, creatorId: userId, status: 'pending_opponent' };
    }

    if (action === 'join') {
      const { disputeId, userId } = input;
      const dispute = state.disputes.get(disputeId);
      if (!dispute) throw new Error('Dispute not found');
      if (dispute.status !== 'pending_opponent') throw new Error('Dispute not accepting opponents');
      if (dispute.creatorId === userId) throw new Error('Cannot join your own dispute');

      dispute.opponentId = userId;
      dispute.status = 'arguing';
      dispute.updatedAt = new Date().toISOString();

      return { disputeId, opponentId: userId, status: 'arguing' };
    }

    if (action === 'updateStatus') {
      const { disputeId, status } = input;
      const dispute = state.disputes.get(disputeId);
      if (!dispute) throw new Error('Dispute not found');

      dispute.status = status;
      dispute.updatedAt = new Date().toISOString();
      if (status === 'resolved') {
        dispute.resolvedAt = new Date().toISOString();
      }

      return { disputeId, status };
    }

    if (action === 'get') {
      const { disputeId } = input;
      const dispute = state.disputes.get(disputeId);
      if (!dispute) throw new Error('Dispute not found');
      return { dispute };
    }

    if (action === 'close') {
      const { disputeId } = input;
      const dispute = state.disputes.get(disputeId);
      if (!dispute) throw new Error('Dispute not found');

      dispute.status = 'closed';
      dispute.updatedAt = new Date().toISOString();

      return { disputeId, status: 'closed' };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
