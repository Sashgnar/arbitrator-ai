// syncs/dispute.sync.ts
import { SyncRule } from '@legible-sync/core';

export const disputeSyncs: SyncRule[] = [
  {
    name: "CreateDisputeGenerateInvitation",
    when: [
      {
        concept: "Dispute",
        action: "create",
        output: {
          disputeId: "?disputeId",
          title: "?title",
          creatorId: "?creatorId"
        }
      }
    ],
    then: [
      {
        concept: "Invitation",
        action: "generate",
        input: {
          invitationId: "?invitationId",
          disputeId: "?disputeId",
          email: null
        }
      }
    ]
  }
];
