// concepts/Argument.ts
import { Concept } from '@legible-sync/core';

export const Argument: Concept = {
  state: {
    arguments: new Map<string, any>(),
    byDispute: new Map<string, string[]>(), // disputeId -> argumentIds
  },

  async execute(action: string, input: any) {
    const state = this.state;

    if (action === 'draft') {
      const { argumentId, disputeId, userId, content, evidence } = input;
      if (!content) throw new Error('Content required');

      // Get argument number
      const disputeArgs = state.byDispute.get(disputeId) || [];
      const userArgs = disputeArgs.filter((id: string) => {
        const arg = state.arguments.get(id);
        return arg && arg.authorId === userId;
      });
      const argumentNumber = userArgs.length + 1;

      const argument = {
        id: argumentId,
        disputeId,
        authorId: userId,
        content,
        evidence: evidence || null,
        argumentNumber,
        isFinal: false,
        aiAssisted: false,
        originalContent: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.arguments.set(argumentId, argument);
      state.byDispute.set(disputeId, [...disputeArgs, argumentId]);

      return { argumentId, disputeId, authorId: userId, argumentNumber, content, isFinal: false };
    }

    if (action === 'update') {
      const { argumentId, content, aiAssisted, originalContent } = input;
      const argument = state.arguments.get(argumentId);
      if (!argument) throw new Error('Argument not found');
      if (argument.isFinal) throw new Error('Cannot update finalized argument');

      if (content !== undefined) argument.content = content;
      if (aiAssisted !== undefined) argument.aiAssisted = aiAssisted;
      if (originalContent !== undefined) argument.originalContent = originalContent;
      argument.updatedAt = new Date().toISOString();

      return { argumentId, content: argument.content, aiAssisted: argument.aiAssisted, updated: true };
    }

    if (action === 'finalize') {
      const { argumentId } = input;
      const argument = state.arguments.get(argumentId);
      if (!argument) throw new Error('Argument not found');
      if (argument.isFinal) throw new Error('Argument already finalized');

      argument.isFinal = true;
      argument.updatedAt = new Date().toISOString();

      return {
        argumentId,
        disputeId: argument.disputeId,
        authorId: argument.authorId,
        argumentNumber: argument.argumentNumber,
        content: argument.content,
        isFinal: true,
      };
    }

    if (action === 'getByDispute') {
      const { disputeId } = input;
      const argumentIds = state.byDispute.get(disputeId) || [];
      const args = argumentIds.map((id: string) => state.arguments.get(id)).filter(Boolean);
      return { arguments: args };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
