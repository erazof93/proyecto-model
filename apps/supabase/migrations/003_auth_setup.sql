-- ============================================================================
-- 003_auth_setup.sql
-- Auditoría de eventos de autenticación. No se usa Supabase Auth (ver
-- decisión de arquitectura de Fase 2): el login/registro se resuelve
-- directamente contra public.users (password_hash + JWT propio), así que
-- no hay auth.users ni trigger handle_new_user que sincronizar.
-- ============================================================================

CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);
