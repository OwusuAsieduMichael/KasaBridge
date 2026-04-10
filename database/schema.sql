-- KasaBridge AI — PostgreSQL schema
-- Run: psql $DATABASE_URL -f database/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  source_language VARCHAR(50) NOT NULL,
  target_language VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
