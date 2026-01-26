// syncs/argument.sync.ts
import { SyncRule } from '@legible-sync/core';

export const argumentSyncs: SyncRule[] = [
  {
    name: "FinalizeArgumentTriggerAnalysis",
    when: [
      {
        concept: "Argument",
        action: "finalize",
        output: {
          argumentId: "?argumentId",
          disputeId: "?disputeId",
          authorId: "?authorId",
          content: "?content",
          isFinal: true
        }
      }
    ],
    then: [
      {
        concept: "Analysis",
        action: "analyze",
        input: {
          analysisId: "?analysisId",
          argumentId: "?argumentId",
          scores: null,
          strengths: [],
          weaknesses: [],
          suggestions: [],
          counterpoints: []
        }
      }
    ]
  }
];
