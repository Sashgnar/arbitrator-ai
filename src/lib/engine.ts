// lib/engine.ts - Shared engine instance for the application
import { LegibleEngine } from '@legible-sync/core';
import { Dispute } from '../concepts/Dispute';
import { Invitation } from '../concepts/Invitation';
import { Argument } from '../concepts/Argument';
import { Analysis } from '../concepts/Analysis';
import { Resolution } from '../concepts/Resolution';
import { Acceptance } from '../concepts/Acceptance';
import { disputeSyncs } from '../syncs/dispute.sync';
import { invitationSyncs } from '../syncs/invitation.sync';
import { argumentSyncs } from '../syncs/argument.sync';
import { resolutionSyncs } from '../syncs/resolution.sync';
import { acceptanceSyncs } from '../syncs/acceptance.sync';

// Global state that persists across requests (in-memory for development)
// In production, this would be replaced with database queries
export const globalState = {
  disputes: new Map<string, any>(),
  invitations: new Map<string, any>(),
  invitationCodes: new Map<string, string>(),
  arguments: new Map<string, any>(),
  argumentsByDispute: new Map<string, string[]>(),
  analyses: new Map<string, any>(),
  resolutions: new Map<string, any>(),
  resolutionsByDispute: new Map<string, string>(),
  acceptances: new Map<string, any>(),
  acceptancesByResolutionUser: new Map<string, string>(),
};

// Create concepts with shared state
function createDisputeWithState() {
  return {
    state: {
      disputes: globalState.disputes,
    },
    execute: Dispute.execute,
  };
}

function createInvitationWithState() {
  return {
    state: {
      invitations: globalState.invitations,
      codeIndex: globalState.invitationCodes,
    },
    execute: Invitation.execute,
  };
}

function createArgumentWithState() {
  return {
    state: {
      arguments: globalState.arguments,
      byDispute: globalState.argumentsByDispute,
    },
    execute: Argument.execute,
  };
}

function createAnalysisWithState() {
  return {
    state: {
      analyses: globalState.analyses,
    },
    execute: Analysis.execute,
  };
}

function createResolutionWithState() {
  return {
    state: {
      resolutions: globalState.resolutions,
      byDispute: globalState.resolutionsByDispute,
    },
    execute: Resolution.execute,
  };
}

function createAcceptanceWithState() {
  return {
    state: {
      acceptances: globalState.acceptances,
      byResolutionUser: globalState.acceptancesByResolutionUser,
    },
    execute: Acceptance.execute,
  };
}

// Create engine with all concepts and syncs
export function createEngine() {
  const engine = new LegibleEngine();

  engine.registerConcept('Dispute', createDisputeWithState());
  engine.registerConcept('Invitation', createInvitationWithState());
  engine.registerConcept('Argument', createArgumentWithState());
  engine.registerConcept('Analysis', createAnalysisWithState());
  engine.registerConcept('Resolution', createResolutionWithState());
  engine.registerConcept('Acceptance', createAcceptanceWithState());

  // Register all syncs
  [...disputeSyncs, ...invitationSyncs, ...argumentSyncs, ...resolutionSyncs, ...acceptanceSyncs]
    .forEach(sync => engine.registerSync(sync));

  return engine;
}
