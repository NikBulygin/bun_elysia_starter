-- Create database if it doesn't exist
-- This script runs in the postgres database context first
SELECT 'CREATE DATABASE app_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'app_db')\gexec

-- Connect to app_db and enable pgcrypto extension
\c app_db
CREATE EXTENSION IF NOT EXISTS pgcrypto;
