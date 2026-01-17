-- Migration: Update RLS policies to support admin and user roles
-- The `role` field on `profiles` table determines access level ('admin' or 'user')

-- ============================================================================
-- JOBS TABLE
-- Only admins need access (background job processing and monitoring)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.jobs;

CREATE POLICY "admins have full access to jobs" ON public.jobs
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- VERTICALS TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.verticals;

CREATE POLICY "admins have full access to verticals" ON public.verticals
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- CATEGORIES TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.categories;

CREATE POLICY "admins have full access to categories" ON public.categories
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SITES TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.sites;

CREATE POLICY "admins have full access to sites" ON public.sites
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SITE_CATEGORIES TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.site_categories;

CREATE POLICY "admins have full access to site_categories" ON public.site_categories
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SITE_CITIES TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.site_cities;

CREATE POLICY "admins have full access to site_cities" ON public.site_cities
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SITE_BUSINESSES TABLE
-- Admins: full access
-- Users: read own claimed businesses (writes via server actions)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.site_businesses;

CREATE POLICY "admins have full access to site_businesses" ON public.site_businesses
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "users can read own claimed businesses" ON public.site_businesses
  FOR SELECT
  USING (
    claimed_by = auth.uid()::text
  );

-- ============================================================================
-- BUSINESSES TABLE
-- Admins: full access
-- Users: read and update businesses they have claimed
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.businesses;

CREATE POLICY "admins have full access to businesses" ON public.businesses
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "users can read own claimed businesses" ON public.businesses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_businesses
      WHERE site_businesses.business_id = businesses.id
      AND site_businesses.claimed_by = auth.uid()::text
    )
  );

CREATE POLICY "users can update own claimed businesses" ON public.businesses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.site_businesses
      WHERE site_businesses.business_id = businesses.id
      AND site_businesses.claimed_by = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.site_businesses
      WHERE site_businesses.business_id = businesses.id
      AND site_businesses.claimed_by = auth.uid()::text
    )
  );

-- ============================================================================
-- BUSINESS_CATEGORIES TABLE
-- Admins: full access
-- Users: manage categories for their claimed businesses
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.business_categories;

CREATE POLICY "admins have full access to business_categories" ON public.business_categories
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "users can read categories for claimed businesses" ON public.business_categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_businesses
      WHERE site_businesses.business_id = business_categories.business_id
      AND site_businesses.claimed_by = auth.uid()::text
    )
  );

CREATE POLICY "users can insert categories for claimed businesses" ON public.business_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.site_businesses
      WHERE site_businesses.business_id = business_categories.business_id
      AND site_businesses.claimed_by = auth.uid()::text
    )
  );

CREATE POLICY "users can delete categories for claimed businesses" ON public.business_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.site_businesses
      WHERE site_businesses.business_id = business_categories.business_id
      AND site_businesses.claimed_by = auth.uid()::text
    )
  );

-- ============================================================================
-- BUSINESS_REVIEWS TABLE
-- Admins: full access
-- Users: read all, manage their own reviews
-- Note: Adding author_id column to track user-submitted reviews
-- ============================================================================

-- Add author_id column for user-submitted reviews (nullable for synced reviews)
ALTER TABLE public.business_reviews 
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "authenticated users have full access" ON public.business_reviews;

CREATE POLICY "admins have full access to business_reviews" ON public.business_reviews
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can read all reviews (reviews are public)
CREATE POLICY "users can read all reviews" ON public.business_reviews
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own reviews
CREATE POLICY "users can insert own reviews" ON public.business_reviews
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
  );

-- Users can update their own reviews
CREATE POLICY "users can update own reviews" ON public.business_reviews
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "users can delete own reviews" ON public.business_reviews
  FOR DELETE
  USING (author_id = auth.uid());

-- ============================================================================
-- BUSINESS_REVIEW_SOURCES TABLE
-- Admin-only (synced metadata)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.business_review_sources;

CREATE POLICY "admins have full access to business_review_sources" ON public.business_review_sources
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STATES TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.states;

CREATE POLICY "admins have full access to states" ON public.states
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- CITIES TABLE
-- Admin-only (frontend reads via service role)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users have full access" ON public.cities;

CREATE POLICY "admins have full access to cities" ON public.cities
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PROFILES TABLE
-- Admins: full access
-- Users: read own profile (updates via server actions to protect role field)
-- ============================================================================

DROP POLICY IF EXISTS "authenticated users can read profiles" ON public.profiles;

CREATE POLICY "admins have full access to profiles" ON public.profiles
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "users can read own profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

