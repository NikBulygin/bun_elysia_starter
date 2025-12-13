-- Enable pgcrypto extension for encryption
-- Note: PostgreSQL automatically creates the database specified in POSTGRES_DB
-- This script runs in the context of that database
CREATE EXTENSION IF NOT EXISTS pgcrypto;
