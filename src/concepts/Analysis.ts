// concepts/Analysis.ts
import { Concept } from '@legible-sync/core';

export const Analysis: Concept = {
  state: {
    analyses: new Map<string, any>(),
  },

  async execute(action: string, input: any) {
    const state = this.state;

    if (action === 'analyze') {
      const { analysisId, argumentId, scores, strengths, weaknesses, suggestions, counterpoints } = input;

      const analysis = {
        id: analysisId,
        argumentId,
        type: 'feedback',
        scores: scores || null,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        suggestions: suggestions || [],
        counterpoints: counterpoints || [],
        createdAt: new Date().toISOString(),
      };

      state.analyses.set(analysisId, analysis);

      return {
        analysisId,
        argumentId,
        type: 'feedback',
        scores,
        strengths,
        weaknesses,
        suggestions,
        counterpoints,
      };
    }

    if (action === 'suggestImprovement') {
      const { analysisId, argumentId, improvedContent, originalContent } = input;

      const analysis = {
        id: analysisId,
        argumentId,
        type: 'suggestion',
        improvedContent,
        originalContent,
        createdAt: new Date().toISOString(),
      };

      state.analyses.set(analysisId, analysis);

      return { analysisId, argumentId, improvedContent, originalContent };
    }

    if (action === 'getByArgument') {
      const { argumentId } = input;
      const analyses: any[] = [];
      state.analyses.forEach((analysis: any) => {
        if (analysis.argumentId === argumentId) {
          analyses.push(analysis);
        }
      });
      return { analyses };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
