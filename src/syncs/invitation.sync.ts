// syncs/invitation.sync.ts
import { SyncRule } from '@legible-sync/core';

export const invitationSyncs: SyncRule[] = [
  {
    name: "ConsumeInvitationJoinDispute",
    when: [
      {
        concept: "Invitation",
        action: "consume",
        output: {
          invitationId: "?invitationId",
          disputeId: "?disputeId",
          userId: "?userId",
          consumed: true
        }
      }
    ],
    then: [
      {
        concept: "Dispute",
        action: "join",
        input: {
          disputeId: "?disputeId",
          userId: "?userId"
        }
      }
    ]
  }
];
