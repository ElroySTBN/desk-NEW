-- ============================================================================
-- 🔧 UPDATE TASKS FOR ORGANIZATIONS
-- ============================================================================

-- Add organization_id to tasks
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Keep client_id for backwards compatibility but make it nullable
ALTER TABLE public.tasks 
  ALTER COLUMN client_id DROP NOT NULL;

-- Create index for organization_id
CREATE INDEX IF NOT EXISTS tasks_organization_id_idx ON public.tasks(organization_id);

