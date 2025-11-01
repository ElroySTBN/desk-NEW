-- ============================================================================
-- 📊 MONTHLY REPORTS (Rapports mensuels automatiques)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_scans INTEGER DEFAULT 0,
  total_positive_reviews INTEGER DEFAULT 0,
  total_negative_reviews INTEGER DEFAULT 0,
  scans_by_employee JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, month, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS monthly_reports_user_id_idx ON public.monthly_reports(user_id);
CREATE INDEX IF NOT EXISTS monthly_reports_client_id_idx ON public.monthly_reports(client_id);
CREATE INDEX IF NOT EXISTS monthly_reports_year_month_idx ON public.monthly_reports(year, month);

-- Trigger for updated_at
CREATE TRIGGER monthly_reports_updated_at
  BEFORE UPDATE ON public.monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own monthly reports"
  ON public.monthly_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly reports"
  ON public.monthly_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly reports"
  ON public.monthly_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly reports"
  ON public.monthly_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.monthly_reports TO authenticated;

