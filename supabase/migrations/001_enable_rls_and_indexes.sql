-- ══════════════════════════════════════════════════════════════════
-- MIGRACIÓN 001: HABILITAR RLS EN TODAS LAS TABLAS
-- Oratorio Don Bosco — Supabase
--
-- INSTRUCCIONES:
--   Opción A (Dashboard): Supabase Dashboard → SQL Editor → New Query → Pegar y ejecutar
--   Opción B (CLI):       supabase db push
-- ══════════════════════════════════════════════════════════════════

-- ── houses ──────────────────────────────────────────────────────
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_houses"
  ON houses FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_houses"
  ON houses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_houses"
  ON houses FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_houses"
  ON houses FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ── children ────────────────────────────────────────────────────
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_children"
  ON children FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_children"
  ON children FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_children"
  ON children FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ── medications ──────────────────────────────────────────────────
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_medications"
  ON medications FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_medications"
  ON medications FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ── attendance_records ───────────────────────────────────────────
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_attendance_records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_attendance_records"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_attendance_records"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ── attendance_children ──────────────────────────────────────────
ALTER TABLE attendance_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_attendance_children"
  ON attendance_children FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_attendance_children"
  ON attendance_children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_attendance_children"
  ON attendance_children FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════════════════════════
-- MIGRACIÓN 002: ÍNDICES DE PERFORMANCE
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_children_house_id
  ON children(house_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_date
  ON attendance_records(date);

CREATE INDEX IF NOT EXISTS idx_attendance_children_attendance_id
  ON attendance_children(attendance_id);

CREATE INDEX IF NOT EXISTS idx_attendance_children_child_id
  ON attendance_children(child_id);
