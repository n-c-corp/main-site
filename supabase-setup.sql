-- ============================================================
-- N&C Reset Remodeling Corp — Supabase Table Setup
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Quote / Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id           BIGSERIAL PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  full_name    TEXT NOT NULL,
  company      TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  service      TEXT NOT NULL,
  location     TEXT,
  message      TEXT NOT NULL,
  referral     TEXT
);

-- 2. Career / Employment applications
CREATE TABLE IF NOT EXISTS career_applications (
  id           BIGSERIAL PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  position     TEXT NOT NULL,
  availability TEXT NOT NULL,
  experience   TEXT NOT NULL,
  additional   TEXT
);

-- ============================================================
-- Row Level Security — allow anonymous INSERT only
-- (No one can read, update, or delete from the frontend)
-- ============================================================

ALTER TABLE contact_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert" ON career_applications
  FOR INSERT TO anon WITH CHECK (true);
