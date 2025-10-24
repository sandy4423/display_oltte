-- Enable realtime for posts table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Channels table
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme JSONB DEFAULT '{}',
  spotlight_duration INTEGER DEFAULT 5,
  wall_layout TEXT DEFAULT 'masonry' CHECK (wall_layout IN ('masonry', 'list')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  spotlight_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitter TEXT
);

-- Moderation rules table
CREATE TABLE moderation_rules (
  channel_id TEXT PRIMARY KEY REFERENCES channels(id) ON DELETE CASCADE,
  banned_keywords TEXT[] DEFAULT '{}',
  allow_auto_approve BOOLEAN DEFAULT false
);

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Insert default channel
INSERT INTO channels (id, name, theme, spotlight_duration, wall_layout) 
VALUES (
  'main', 
  '메인 매장', 
  '{
    "primaryColor": "#e36e42",
    "backgroundColor": "#fef7f0", 
    "textColor": "#1f2937",
    "fontSize": "1rem"
  }',
  5,
  'masonry'
);

-- Insert default moderation rules
INSERT INTO moderation_rules (channel_id, banned_keywords, allow_auto_approve)
VALUES ('main', '{}', true);

-- Create indexes for performance
CREATE INDEX idx_posts_channel_status ON posts(channel_id, status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_spotlight_at ON posts(spotlight_at DESC);