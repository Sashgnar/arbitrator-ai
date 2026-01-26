// syncs/resolution.sync.ts
import { SyncRule } from '@legible-sync/core';

export const resolutionSyncs: SyncRule[] = [
  {
    name: "GenerateResolutionUpdateDispute",
    when: [
      {
        concept: "Resolution",
        action: "generate",
        output: {
          resolutionId: "?resolutionId",
          disputeId: "?disputeId",
          summary: "?summary",
          verdict: "?verdict"
        }
      }
    ],
    then: [
      {
        concept: "Dispute",
        action: "updateStatus",
        input: {
          disputeId: "?disputeId",
          status: "resolved"
        }
      }
    ]
  }
];
