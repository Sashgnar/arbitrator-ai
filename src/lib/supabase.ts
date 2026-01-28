// lib/supabase.ts - Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for admin operations)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          creator_id: string;
          opponent_id: string | null;
          status: string;
          max_arguments: number;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          creator_id: string;
          opponent_id?: string | null;
          status?: string;
          max_arguments?: number;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          creator_id?: string;
          opponent_id?: string | null;
          status?: string;
          max_arguments?: number;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          dispute_id: string;
          code: string;
          email: string | null;
          expires_at: string | null;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          code: string;
          email?: string | null;
          expires_at?: string | null;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          dispute_id?: string;
          code?: string;
          email?: string | null;
          expires_at?: string | null;
          used?: boolean;
          created_at?: string;
        };
      };
      arguments: {
        Row: {
          id: string;
          dispute_id: string;
          author_id: string;
          content: string;
          evidence: string | null;
          argument_number: number;
          is_final: boolean;
          ai_assisted: boolean;
          original_content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          author_id: string;
          content: string;
          evidence?: string | null;
          argument_number: number;
          is_final?: boolean;
          ai_assisted?: boolean;
          original_content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dispute_id?: string;
          author_id?: string;
          content?: string;
          evidence?: string | null;
          argument_number?: number;
          is_final?: boolean;
          ai_assisted?: boolean;
          original_content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          argument_id: string;
          type: string;
          scores: Record<string, any> | null;
          strengths: string[] | null;
          weaknesses: string[] | null;
          suggestions: string[] | null;
          counterpoints: string[] | null;
          improved_content: string | null;
          original_content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          argument_id: string;
          type: string;
          scores?: Record<string, any> | null;
          strengths?: string[] | null;
          weaknesses?: string[] | null;
          suggestions?: string[] | null;
          counterpoints?: string[] | null;
          improved_content?: string | null;
          original_content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          argument_id?: string;
          type?: string;
          scores?: Record<string, any> | null;
          strengths?: string[] | null;
          weaknesses?: string[] | null;
          suggestions?: string[] | null;
          counterpoints?: string[] | null;
          improved_content?: string | null;
          original_content?: string | null;
          created_at?: string;
        };
      };
      resolutions: {
        Row: {
          id: string;
          dispute_id: string;
          summary: string;
          detailed_analysis: string;
          verdict: Record<string, any>;
          party_a_eval: Record<string, any> | null;
          party_b_eval: Record<string, any> | null;
          key_factors: string[] | null;
          recommendations: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          summary: string;
          detailed_analysis: string;
          verdict: Record<string, any>;
          party_a_eval?: Record<string, any> | null;
          party_b_eval?: Record<string, any> | null;
          key_factors?: string[] | null;
          recommendations?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          dispute_id?: string;
          summary?: string;
          detailed_analysis?: string;
          verdict?: Record<string, any>;
          party_a_eval?: Record<string, any> | null;
          party_b_eval?: Record<string, any> | null;
          key_factors?: string[] | null;
          recommendations?: string[] | null;
          created_at?: string;
        };
      };
      acceptances: {
        Row: {
          id: string;
          resolution_id: string;
          user_id: string;
          accepted: boolean | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resolution_id: string;
          user_id: string;
          accepted?: boolean | null;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resolution_id?: string;
          user_id?: string;
          accepted?: boolean | null;
          feedback?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
