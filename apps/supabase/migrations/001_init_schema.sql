-- ============================================================================
-- 001_init_schema.sql
-- Esquema inicial. Los nombres de columna siguen exactamente los tipos
-- definidos en packages/types/index.ts (Model, User, FeaturedListing,
-- ModelPhoto, Review, Transaction) para que las queries puedan mapear
-- fila -> tipo sin renombrar campos.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- Enums -------------------------------------------------------------
CREATE TYPE gender_enum AS ENUM ('WOMAN', 'MAN', 'TRANSGENDER');
CREATE TYPE role_enum AS ENUM ('admin', 'model', 'customer');
CREATE TYPE model_status_enum AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE featured_status_enum AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE featured_type_enum AS ENUM ('TOP', 'BANNER');
CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- --- Users ---------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role role_enum NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --- Models ----------------------------------------------------------------
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  age INT NOT NULL CHECK (age >= 18 AND age <= 100),
  gender gender_enum NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  city VARCHAR(100),
  services TEXT[],
  height INT,
  weight INT,
  clothing_size VARCHAR(10),
  languages TEXT[],
  cities_travel TEXT[],
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  telegram VARCHAR(100),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status model_status_enum NOT NULL DEFAULT 'PENDING',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  featured_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_percentage INT NOT NULL DEFAULT 0 CHECK (onboarding_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --- Model photos ------------------------------------------------------
CREATE TABLE model_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  cloudinary_id VARCHAR(255) NOT NULL,
  cloudinary_url VARCHAR(500) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --- Featured listings -------------------------------------------------
CREATE TABLE featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  type featured_type_enum NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMPTZ NOT NULL,
  status featured_status_enum NOT NULL DEFAULT 'ACTIVE',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  payment_id UUID,
  created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --- Reviews -------------------------------------------------------------
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --- Checklists (catálogo de servicios/atributos reutilizable) -------------
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (model_id, checklist_id)
);

-- --- Transactions --------------------------------------------------------
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  featured_listing_id UUID REFERENCES featured_listings(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
  payment_status payment_status_enum NOT NULL DEFAULT 'PENDING',
  verified_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --- Indexes ---------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_gender ON models(gender);
CREATE INDEX idx_models_status ON models(status);
CREATE INDEX idx_models_is_verified ON models(is_verified);
CREATE INDEX idx_models_is_featured ON models(is_featured);
CREATE INDEX idx_models_featured_expires_at ON models(featured_expires_at);
CREATE INDEX idx_model_photos_model_id ON model_photos(model_id);
CREATE INDEX idx_featured_listings_model_id ON featured_listings(model_id);
CREATE INDEX idx_featured_listings_status ON featured_listings(status);
CREATE INDEX idx_featured_listings_end_date ON featured_listings(end_date);
CREATE INDEX idx_reviews_model_id ON reviews(model_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_model_checklists_model_id ON model_checklists(model_id);
CREATE INDEX idx_transactions_model_id ON transactions(model_id);

-- --- updated_at triggers ----------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_featured_listings_updated_at BEFORE UPDATE ON featured_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
