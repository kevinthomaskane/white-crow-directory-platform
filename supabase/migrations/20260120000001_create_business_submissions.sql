-- Create business_submissions table for tracking submitted businesses pending review

CREATE TABLE IF NOT EXISTS public.business_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,

  -- Submitted data
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_website TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  city_id UUID NOT NULL REFERENCES public.cities(id),

  -- Review workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  admin_notes TEXT,

  -- Link to created business if approved
  business_id UUID REFERENCES public.businesses(id)
);

-- Index for querying submissions by site and status
CREATE INDEX idx_business_submissions_site_status ON public.business_submissions(site_id, status);

-- Index for querying pending submissions
CREATE INDEX idx_business_submissions_pending ON public.business_submissions(status) WHERE status = 'pending';

-- RLS policies
ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage business submissions"
  ON public.business_submissions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Anyone can insert (submit a business)
CREATE POLICY "Anyone can submit a business"
  ON public.business_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
