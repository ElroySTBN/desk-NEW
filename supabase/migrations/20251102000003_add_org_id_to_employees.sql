-- ============================================================================
-- Add organization_id to employees table (keep client_id for compatibility)
-- ============================================================================

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);

COMMENT ON COLUMN public.employees.client_id IS 'DEPRECATED: Use organization_id instead';
COMMENT ON COLUMN public.employees.organization_id IS 'Modern foreign key to organizations table';

-- ============================================================================
-- Create campaigns table for review campaigns
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'physical' CHECK (campaign_type IN ('physical', 'digital', 'hybrid')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_campaigns_organization_id ON public.review_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_client_id ON public.review_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_user_id ON public.review_campaigns(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_review_campaigns_updated_at ON public.review_campaigns;
CREATE TRIGGER update_review_campaigns_updated_at
  BEFORE UPDATE ON public.review_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.review_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can view their own review campaigns"
  ON public.review_campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can insert their own review campaigns"
  ON public.review_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can update their own review campaigns"
  ON public.review_campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can delete their own review campaigns"
  ON public.review_campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.review_campaigns TO authenticated;

COMMENT ON TABLE public.review_campaigns IS 'Campagnes de récolte d''avis (physique, digital, hybride)';

