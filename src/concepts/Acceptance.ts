// concepts/Acceptance.ts
import { Concept } from '@legible-sync/core';

export const Acceptance: Concept = {
  state: {
    acceptances: new Map<string, any>(),
    byResolutionUser: new Map<string, string>(), // resolutionId:userId -> acceptanceId
  },

  async execute(action: string, input: any) {
    const state = this.state;

    if (action === 'accept') {
      const { acceptanceId, resolutionId, userId, disputeId } = input;
      const key = `${resolutionId}:${userId}`;

      const existingId = state.byResolutionUser.get(key);
      if (existingId) {
        const existing = state.acceptances.get(existingId);
        existing.accepted = true;
        existing.feedback = null;
        return { acceptanceId: existingId, resolutionId, userId, disputeId, accepted: true };
      }

      const acceptance = {
        id: acceptanceId,
        resolutionId,
        userId,
        disputeId,
        accepted: true,
        feedback: null,
        createdAt: new Date().toISOString(),
      };

      state.acceptances.set(acceptanceId, acceptance);
      state.byResolutionUser.set(key, acceptanceId);

      return { acceptanceId, resolutionId, userId, disputeId, accepted: true };
    }

    if (action === 'reject') {
      const { acceptanceId, resolutionId, userId, disputeId, feedback } = input;
      const key = `${resolutionId}:${userId}`;

      const existingId = state.byResolutionUser.get(key);
      if (existingId) {
        const existing = state.acceptances.get(existingId);
        existing.accepted = false;
        existing.feedback = feedback || null;
        return { acceptanceId: existingId, resolutionId, userId, disputeId, accepted: false, feedback };
      }

      const acceptance = {
        id: acceptanceId,
        resolutionId,
        userId,
        disputeId,
        accepted: false,
        feedback: feedback || null,
        createdAt: new Date().toISOString(),
      };

      state.acceptances.set(acceptanceId, acceptance);
      state.byResolutionUser.set(key, acceptanceId);

      return { acceptanceId, resolutionId, userId, disputeId, accepted: false, feedback };
    }

    if (action === 'getStatus') {
      const { resolutionId, creatorId, opponentId } = input;

      const creatorKey = `${resolutionId}:${creatorId}`;
      const opponentKey = `${resolutionId}:${opponentId}`;

      const creatorAcceptanceId = state.byResolutionUser.get(creatorKey);
      const opponentAcceptanceId = state.byResolutionUser.get(opponentKey);

      const creatorAcceptance = creatorAcceptanceId ? state.acceptances.get(creatorAcceptanceId) : null;
      const opponentAcceptance = opponentAcceptanceId ? state.acceptances.get(opponentAcceptanceId) : null;

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
