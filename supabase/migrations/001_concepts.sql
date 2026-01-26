-- Migration: 001_concepts.sql
-- Description: Create tables for all concepts in the ArgumentApp

-- User profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute concept
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles NOT NULL,
  opponent_id UUID REFERENCES profiles,
  status TEXT DEFAULT 'pending_opponent' CHECK (status IN ('pending_opponent', 'arguing', 'pending_resolution', 'resolved', 'closed')),
  max_arguments INT DEFAULT 5,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitation concept
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  expires_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Argument concept
CREATE TABLE IF NOT EXISTS arguments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes NOT NULL,
  author_id UUID REFERENCES profiles NOT NULL,
  content TEXT NOT NULL,
  evidence TEXT,
  argument_number INT NOT NULL,
  is_final BOOLEAN DEFAULT FALSE,
  ai_assisted BOOLEAN DEFAULT FALSE,
  original_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispute_id, author_id, argument_number)
);

-- Analysis concept
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id UUID REFERENCES arguments NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'suggestion', 'comparison')),
  scores JSONB,
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  counterpoints TEXT[],
  improved_content TEXT,
  original_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resolution concept
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis TEXT NOT NULL,
  verdict JSONB NOT NULL,
  party_a_eval JSONB,
  party_b_eval JSONB,
  key_factors TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acceptance concept
CREATE TABLE IF NOT EXISTS acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID REFERENCES resolutions NOT NULL,
  user_id UUID REFERENCES profiles NOT NULL,
  accepted BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolution_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_creator ON disputes(creator_id);
CREATE INDEX IF NOT EXISTS idx_disputes_opponent ON disputes(opponent_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_invitations_dispute ON invitations(dispute_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);
CREATE INDEX IF NOT EXISTS idx_arguments_dispute ON arguments(dispute_id);
CREATE INDEX IF NOT EXISTS idx_arguments_author ON arguments(author_id);
CREATE INDEX IF NOT EXISTS idx_analyses_argument ON analyses(argument_id);
CREATE INDEX IF NOT EXISTS idx_acceptances_resolution ON acceptances(resolution_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE arguments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceptances ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Disputes: Participants can see their disputes
CREATE POLICY "Users can view their disputes" ON disputes
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Participants can update disputes" ON disputes
  FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

-- Invitations: Creator can manage, anyone can validate
CREATE POLICY "Dispute creator can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = invitations.dispute_id
      AND d.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read invitations by code" ON invitations
  FOR SELECT USING (true);

-- Arguments: Participants can view and manage their arguments
CREATE POLICY "Participants can view arguments" ON arguments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = arguments.dispute_id
      AND (d.creator_id = auth.uid() OR d.opponent_id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own arguments" ON arguments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own arguments" ON arguments
  FOR UPDATE USING (auth.uid() = author_id);

-- Analyses: Participants can view
CREATE POLICY "Participants can view analyses" ON analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM arguments a
      JOIN disputes d ON d.id = a.dispute_id
      WHERE a.id = analyses.argument_id
      AND (d.creator_id = auth.uid() OR d.opponent_id = auth.uid())
    )
  );

-- Resolutions: Participants can view
CREATE POLICY "Participants can view resolutions" ON resolutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = resolutions.dispute_id
      AND (d.creator_id = auth.uid() OR d.opponent_id = auth.uid())
    )
  );

-- Acceptances: Participants can manage their own
CREATE POLICY "Participants can view acceptances" ON acceptances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resolutions r
      JOIN disputes d ON d.id = r.dispute_id
      WHERE r.id = acceptances.resolution_id
      AND (d.creator_id = auth.uid() OR d.opponent_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own acceptances" ON acceptances
  FOR ALL USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arguments_updated_at
  BEFORE UPDATE ON arguments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
