-- Create circuit_data table for sharing entries, categories, and event data
-- across devices via Supabase.

CREATE TABLE IF NOT EXISTS circuit_data (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

ALTER TABLE circuit_data REPLICA IDENTITY FULL;

-- Row Level Security: allow anonymous read/write
-- (this is a broadcast tool, not auth-based, so anon access is intentional)
ALTER TABLE circuit_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select" ON circuit_data FOR SELECT USING (true);
CREATE POLICY "anon_insert" ON circuit_data FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update" ON circuit_data FOR UPDATE USING (true);

-- Add to the realtime publication for cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE circuit_data;
