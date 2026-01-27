-- Create site_business_reviews table for owner-submitted reviews (pro feature)
-- These are site-specific reviews linked to site_businesses, separate from
-- external source reviews (Google, etc.) in the business_reviews table

CREATE TABLE IF NOT EXISTS public.site_business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_business_id UUID NOT NULL REFERENCES public.site_businesses(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  is_verified BOOLEAN NOT NULL DEFAULT false
);

-- Index for querying reviews by site_business
CREATE INDEX idx_site_business_reviews_site_business_id ON public.site_business_reviews(site_business_id);

-- Index for querying reviews by creator (useful for user's review management)
CREATE INDEX idx_site_business_reviews_created_by ON public.site_business_reviews(created_by) WHERE created_by IS NOT NULL;

-- RLS policies
ALTER TABLE public.site_business_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read site business reviews"
  ON public.site_business_reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Business owners can manage reviews for their claimed businesses
CREATE POLICY "Business owners can manage their reviews"
  ON public.site_business_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.site_businesses sb
      WHERE sb.id = site_business_id
      AND sb.claimed_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.site_businesses sb
      WHERE sb.id = site_business_id
      AND sb.claimed_by = auth.uid()
    )
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all site business reviews"
  ON public.site_business_reviews
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
