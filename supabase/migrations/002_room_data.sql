-- Generic room-based persistence table.
-- Each row = one room (identified by id).
-- data JSONB holds ALL state for that room: circuit entries, categories,
-- grid, timing, podium, flags, pits, rally entries, graphics settings,
-- layout positions, etc.

CREATE TABLE IF NOT EXISTS room_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

ALTER TABLE room_data REPLICA IDENTITY FULL;

ALTER TABLE room_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "anon_select" ON room_data FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_insert" ON room_data FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon_update" ON room_data FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE room_data;

-- The old circuit_data table is no longer needed; you can drop it:
-- DROP TABLE IF EXISTS circuit_data;
