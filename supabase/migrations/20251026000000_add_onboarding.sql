-- Create onboarding_checklists table
CREATE TABLE IF NOT EXISTS public.onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Checklist items
  tally_form_completed boolean DEFAULT false,
  google_drive_created boolean DEFAULT false,
  google_drive_link text,
  identity_document_created boolean DEFAULT false,
  google_business_access boolean DEFAULT false,
  visuals_uploaded boolean DEFAULT false,
  visuals_count integer DEFAULT 0,
  first_meeting_scheduled boolean DEFAULT false,
  first_meeting_date timestamptz,
  contract_signed boolean DEFAULT false,
  first_invoice_sent boolean DEFAULT false,
  
  -- Custom notes
  notes text
);

-- Create client_documents_links table for storing Google Drive and other links
CREATE TABLE IF NOT EXISTS public.client_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  link_type text NOT NULL, -- 'google_drive', 'tally_form', 'other'
  link_url text NOT NULL,
  link_name text NOT NULL,
  description text
);

-- Create client_tasks table for custom to-do lists per client
CREATE TABLE IF NOT EXISTS public.client_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date timestamptz,
  completed_at timestamptz
);

-- Create notifications table for reminders
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  type text NOT NULL, -- 'renewal', 'payment_reminder', 'report_due', 'custom'
  title text NOT NULL,
  message text NOT NULL,
  due_date timestamptz,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false
);

-- Add RLS policies
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_checklists
CREATE POLICY "Users can view own onboarding checklists"
  ON public.onboarding_checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own onboarding checklists"
  ON public.onboarding_checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding checklists"
  ON public.onboarding_checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding checklists"
  ON public.onboarding_checklists FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for client_links
CREATE POLICY "Users can view own client links"
  ON public.client_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own client links"
  ON public.client_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client links"
  ON public.client_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client links"
  ON public.client_links FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for client_tasks
CREATE POLICY "Users can view own client tasks"
  ON public.client_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own client tasks"
  ON public.client_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client tasks"
  ON public.client_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client tasks"
  ON public.client_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_onboarding_checklists_client_id ON public.onboarding_checklists(client_id);
CREATE INDEX idx_onboarding_checklists_user_id ON public.onboarding_checklists(user_id);
CREATE INDEX idx_client_links_client_id ON public.client_links(client_id);
CREATE INDEX idx_client_links_user_id ON public.client_links(user_id);
CREATE INDEX idx_client_tasks_client_id ON public.client_tasks(client_id);
CREATE INDEX idx_client_tasks_user_id ON public.client_tasks(user_id);
CREATE INDEX idx_client_tasks_status ON public.client_tasks(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_due_date ON public.notifications(due_date);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

