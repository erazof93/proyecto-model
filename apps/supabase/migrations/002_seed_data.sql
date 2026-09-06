-- ============================================================================
-- 002_seed_data.sql
-- Datos de desarrollo: admin, checklists, 8 modelos, customers, reviews,
-- featured listings y el vínculo modelo <-> checklist.
-- Nota: la sintaxis "RETURNING id INTO TEMP ..." del prompt original no es
-- SQL válido fuera de un bloque PL/pgSQL; aquí cada INSERT en `models`
-- resuelve el user_id con una subconsulta por username, que es la forma
-- correcta en SQL plano ejecutado vía psql -f / docker exec.
-- ============================================================================

-- --- Admin -----------------------------------------------------------------
INSERT INTO users (email, username, password_hash, role, is_active)
VALUES (
  'admin@modelosmkt.com',
  'admin',
  crypt('admin123', gen_salt('bf')),
  'admin',
  true
);

-- --- Checklists --------------------------------------------------------
INSERT INTO checklists (name, description, is_active) VALUES
  ('24 horas disponible', 'Disponibilidad 24/7', true),
  ('Masaje', 'Servicio de masaje profesional', true),
  ('Conversación', 'Disponible para conversación', true),
  ('Compañía', 'Servicio de acompañamiento', true),
  ('Fotos privadas', 'Fotos personalizadas', true);

-- --- Modelos (8, para desarrollo) -------------------------------------
INSERT INTO users (username, password_hash, role) VALUES
  ('sofia_lima', crypt('password123', gen_salt('bf')), 'model'),
  ('camila_pro', crypt('password123', gen_salt('bf')), 'model'),
  ('valentina_vip', crypt('password123', gen_salt('bf')), 'model'),
  ('ale_lima', crypt('password123', gen_salt('bf')), 'model'),
  ('mariana_callao', crypt('password123', gen_salt('bf')), 'model'),
  ('isabella_vip', crypt('password123', gen_salt('bf')), 'model'),
  ('diana_lima', crypt('password123', gen_salt('bf')), 'model'),
  ('paula_pro', crypt('password123', gen_salt('bf')), 'model');

INSERT INTO models (
  user_id, username, name, slug, age, gender, bio, height, weight, clothing_size,
  languages, cities_travel, city, phone, whatsapp, instagram, tiktok, telegram,
  services, is_verified, status, onboarding_completed, onboarding_percentage
) VALUES
(
  (SELECT id FROM users WHERE username = 'sofia_lima'), 'sofia_lima', 'Sofía', 'sofia-lima',
  24, 'WOMAN', 'Profesional de modelaje con 5 años de experiencia. Amable y discreta.',
  170, 58, 'S', ARRAY['Español', 'Inglés'], ARRAY['Lima', 'Callao'], 'Lima',
  '987654321', '987654321', 'sofia.professional', 'sofiamodelo', 'sofia_modelo',
  ARRAY['24 horas disponible', 'Compañía', 'Fotos privadas'], true, 'ACTIVE', true, 100
),
(
  (SELECT id FROM users WHERE username = 'camila_pro'), 'camila_pro', 'Camila', 'camila-pro',
  22, 'WOMAN', 'Modelo independiente. Ojos azules, cabello oscuro. Fines de semana disponible.',
  168, 56, 'XS', ARRAY['Español'], ARRAY['Lima'], 'Lima',
  '987654322', '987654322', 'camilapro', 'camilamodelo', 'camila_mod',
  ARRAY['Conversación', 'Masaje'], true, 'ACTIVE', true, 100
),
(
  (SELECT id FROM users WHERE username = 'valentina_vip'), 'valentina_vip', 'Valentina', 'valentina-vip',
  26, 'WOMAN', 'Modelo VIP con cartera selecta. Disponible jueves a domingo.',
  172, 62, 'M', ARRAY['Español', 'Inglés', 'Portugués'], ARRAY['Lima', 'Callao'], 'Callao',
  '987654323', '987654323', 'valentina.vip', 'valentinavip', 'valentina_vip_',
  ARRAY['24 horas disponible', 'Compañía', 'Fotos privadas'], true, 'ACTIVE', true, 100
),
(
  (SELECT id FROM users WHERE username = 'ale_lima'), 'ale_lima', 'Alejandra', 'alejandra-lima',
  21, 'WOMAN', 'Nueva en la plataforma. Universitaria, educada y discreta.',
  165, 54, 'XS', ARRAY['Español'], ARRAY['Lima'], 'Lima',
  '987654324', '987654324', 'alejandraa_', 'alemodelo', 'ale_mod21',
  ARRAY['Conversación', 'Masaje', 'Fotos privadas'], false, 'PENDING', true, 75
),
(
  (SELECT id FROM users WHERE username = 'mariana_callao'), 'mariana_callao', 'Mariana', 'mariana-callao',
  25, 'WOMAN', 'Modelo profesional. Disponibilidad flexible. Respeto mutuo es prioridad.',
  169, 59, 'S', ARRAY['Español', 'Inglés'], ARRAY['Callao'], 'Callao',
  '987654325', '987654325', 'mariana.modelo', 'marianabella', 'mariana_mod25',
  ARRAY['24 horas disponible', 'Masaje', 'Compañía'], true, 'ACTIVE', true, 100
),
(
  (SELECT id FROM users WHERE username = 'isabella_vip'), 'isabella_vip', 'Isabella', 'isabella-vip',
  28, 'WOMAN', 'Modelo experimentada. Ambiente discreto y profesional garantizado.',
  171, 61, 'M', ARRAY['Español', 'Inglés', 'Italiano'], ARRAY['Lima', 'Callao'], 'Lima',
  '987654326', '987654326', 'isabella.vip', 'isabellam', 'isabella_vip28',
  ARRAY['24 horas disponible', 'Conversación', 'Compañía'], true, 'ACTIVE', true, 100
),
(
  (SELECT id FROM users WHERE username = 'diana_lima'), 'diana_lima', 'Diana', 'diana-lima',
  23, 'WOMAN', 'Educada y atenta. Disponible fines de semana y noches.',
  167, 57, 'S', ARRAY['Español'], ARRAY['Lima'], 'Lima',
  '987654327', '987654327', 'diana.modelo', 'dianamodelo', 'diana_mod23',
  ARRAY['Masaje', 'Fotos privadas', 'Conversación'], false, 'PENDING', true, 80
),
(
  (SELECT id FROM users WHERE username = 'paula_pro'), 'paula_pro', 'Paula', 'paula-pro',
  27, 'WOMAN', 'Profesional de modelaje. Reservas con anticipación.',
  170, 60, 'M', ARRAY['Español', 'Inglés'], ARRAY['Lima'], 'Lima',
  '987654328', '987654328', 'paula.professional', 'paulapro', 'paula_prof27',
  ARRAY['24 horas disponible', 'Compañía', 'Masaje'], true, 'ACTIVE', true, 100
);

-- --- Vincular servicios (services TEXT[]) con el catálogo de checklists ----
INSERT INTO model_checklists (model_id, checklist_id)
SELECT m.id, c.id
FROM models m
JOIN checklists c ON c.name = ANY(m.services)
ON CONFLICT (model_id, checklist_id) DO NOTHING;

-- --- Customers -------------------------------------------------------------
INSERT INTO users (username, password_hash, role) VALUES
  ('customer1', crypt('password123', gen_salt('bf')), 'customer'),
  ('customer2', crypt('password123', gen_salt('bf')), 'customer');

-- --- Reviews -----------------------------------------------------------
INSERT INTO reviews (model_id, customer_id, rating, comment)
SELECT m.id, (SELECT id FROM users WHERE username = 'customer1'), 5,
  'Excelente experiencia, muy profesional.'
FROM models m WHERE m.slug = 'sofia-lima';

INSERT INTO reviews (model_id, customer_id, rating, comment)
SELECT m.id, (SELECT id FROM users WHERE username = 'customer2'), 4,
  'Muy buena atención, volveré a contactar.'
FROM models m WHERE m.slug = 'camila-pro';

-- --- Featured listings (2 activos: uno TOP, uno BANNER) --------------------
INSERT INTO featured_listings (model_id, type, price, duration_days, start_date, end_date, status, is_pinned, created_by_admin_id, approved_at)
SELECT m.id, 'TOP', 50.00, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days',
  'ACTIVE', true, (SELECT id FROM users WHERE role = 'admin' LIMIT 1), CURRENT_TIMESTAMP
FROM models m WHERE m.slug = 'sofia-lima';

INSERT INTO featured_listings (model_id, type, price, duration_days, start_date, end_date, status, is_pinned, created_by_admin_id, approved_at)
SELECT m.id, 'BANNER', 75.00, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days',
  'ACTIVE', false, (SELECT id FROM users WHERE role = 'admin' LIMIT 1), CURRENT_TIMESTAMP
FROM models m WHERE m.slug = 'camila-pro';

-- Mantener el flag denormalizado models.is_featured / featured_expires_at
-- en sync con los featured_listings activos recién creados.
UPDATE models m
SET is_featured = true,
    featured_expires_at = fl.end_date
FROM featured_listings fl
WHERE fl.model_id = m.id AND fl.status = 'ACTIVE';
