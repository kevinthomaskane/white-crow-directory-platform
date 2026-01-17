-- Fix infinite recursion in admin RLS policies
-- The issue: admin policies query the profiles table, which has its own admin policy
-- that queries profiles again, causing infinite recursion.
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to check admin status.

-- Create the is_admin function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Drop all existing admin policies
DROP POLICY IF EXISTS "admins have full access to business_categories" ON "public"."business_categories";
DROP POLICY IF EXISTS "admins have full access to business_review_sources" ON "public"."business_review_sources";
DROP POLICY IF EXISTS "admins have full access to business_reviews" ON "public"."business_reviews";
DROP POLICY IF EXISTS "admins have full access to businesses" ON "public"."businesses";
DROP POLICY IF EXISTS "admins have full access to categories" ON "public"."categories";
DROP POLICY IF EXISTS "admins have full access to cities" ON "public"."cities";
DROP POLICY IF EXISTS "admins have full access to jobs" ON "public"."jobs";
DROP POLICY IF EXISTS "admins have full access to profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "admins have full access to site_businesses" ON "public"."site_businesses";
DROP POLICY IF EXISTS "admins have full access to site_categories" ON "public"."site_categories";
DROP POLICY IF EXISTS "admins have full access to site_cities" ON "public"."site_cities";
DROP POLICY IF EXISTS "admins have full access to sites" ON "public"."sites";
DROP POLICY IF EXISTS "admins have full access to states" ON "public"."states";
DROP POLICY IF EXISTS "admins have full access to verticals" ON "public"."verticals";

-- Recreate all admin policies using is_admin() function
CREATE POLICY "admins have full access to business_categories" ON "public"."business_categories"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to business_review_sources" ON "public"."business_review_sources"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to business_reviews" ON "public"."business_reviews"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to businesses" ON "public"."businesses"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to categories" ON "public"."categories"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to cities" ON "public"."cities"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to jobs" ON "public"."jobs"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to profiles" ON "public"."profiles"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to site_businesses" ON "public"."site_businesses"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to site_categories" ON "public"."site_categories"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to site_cities" ON "public"."site_cities"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to sites" ON "public"."sites"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to states" ON "public"."states"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins have full access to verticals" ON "public"."verticals"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
