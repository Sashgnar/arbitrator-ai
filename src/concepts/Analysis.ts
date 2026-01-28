// concepts/Analysis.ts
import { Concept } from '@legible-sync/core';
import { createServerClient } from '../lib/supabase';

export const Analysis: Concept = {
  state: {},

  async execute(action: string, input: any) {
    const supabase = createServerClient();

    if (action === 'analyze') {
      const { analysisId, argumentId, scores, strengths, weaknesses, suggestions, counterpoints } = input;

      const { data, error } = await supabase
        .from('analyses')
        .insert({
          id: analysisId,
          argument_id: argumentId,
          type: 'feedback',
          scores: scores || null,
          strengths: strengths || [],
          weaknesses: weaknesses || [],
          suggestions: suggestions || [],
          counterpoints: counterpoints || [],
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

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

      const { data, error } = await supabase
        .from('analyses')
        .insert({
          id: analysisId,
          argument_id: argumentId,
          type: 'suggestion',
          improved_content: improvedContent,
          original_content: originalContent,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { analysisId, argumentId, improvedContent, originalContent };
    }

    if (action === 'getByArgument') {
      const { argumentId } = input;

      const { data: analyses, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('argument_id', argumentId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);

      // Map snake_case to camelCase
      const mappedAnalyses = (analyses || []).map(a => ({
        id: a.id,
        argumentId: a.argument_id,
        type: a.type,
        scores: a.scores,
        strengths: a.strengths,
        weaknesses: a.weaknesses,
        suggestions: a.suggestions,
        counterpoints: a.counterpoints,
        improvedContent: a.improved_content,
        originalContent: a.original_content,
        createdAt: a.created_at,
      }));

      return { analyses: mappedAnalyses };
    }

    throw new Error(`Unknown action: ${action}`);
  }
};
