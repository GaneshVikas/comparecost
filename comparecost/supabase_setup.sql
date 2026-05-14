-- Run this in your Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New Query → paste this → Run

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(5) NOT NULL,
  country_name VARCHAR(100),
  author_name VARCHAR(100) DEFAULT 'Anonymous',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  tips TEXT[] DEFAULT '{}',
  is_student BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read non-reported reviews
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  USING (reported = FALSE);

-- Allow anyone to insert reviews
CREATE POLICY "Public can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (TRUE);

-- Allow updates only for reporting (reported field)
CREATE POLICY "Public can report reviews"
  ON reviews FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- Index for faster country queries
CREATE INDEX IF NOT EXISTS idx_reviews_country ON reviews(country_code);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
