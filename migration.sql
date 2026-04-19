-- ============================================================
-- HumiGrow – Supabase migration
-- Table: measurement
-- ============================================================

CREATE TABLE IF NOT EXISTS measurement (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  device        TEXT          NOT NULL,
  location      TEXT          NOT NULL,
  temperature_c NUMERIC(6,2)  NOT NULL,
  humidity_pct  NUMERIC(5,2)  NOT NULL,
  wifi_rssi     INTEGER,
  uptime_s      BIGINT,
  sys_cts       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_measurement_device   ON measurement (device);
CREATE INDEX IF NOT EXISTS idx_measurement_sys_cts  ON measurement (sys_cts DESC);

-- Row-level security (adjust policies to your auth setup)
ALTER TABLE measurement ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by the backend)
CREATE POLICY "service_role_all" ON measurement
  FOR ALL
  USING (true)
  WITH CHECK (true);
