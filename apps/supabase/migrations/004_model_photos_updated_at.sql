-- ============================================================================
-- 004_model_photos_updated_at.sql
-- model_photos necesitaba updated_at para el PUT de /api/modelos/fotos/[id]
-- (marcar foto principal), igual que el resto de tablas mutables.
-- ============================================================================

ALTER TABLE model_photos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TRIGGER update_model_photos_updated_at
  BEFORE UPDATE ON model_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
