// syncs/acceptance.sync.ts
import { SyncRule } from '@legible-sync/core';

// Note: The BothAcceptedCloseDispute sync has been simplified.
// In a full implementation, we would need to check if both parties
// have accepted before closing. For now, this sync triggers on
// each accept action - the application logic should verify both
// acceptances before calling the close action.

export const acceptanceSyncs: SyncRule[] = [
  // This sync is intentionally left as a placeholder.
  // The logic for checking both acceptances and closing
  // the dispute should be handled in the API layer where
  // we can query the current state of all acceptances.
];
