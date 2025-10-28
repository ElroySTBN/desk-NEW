-- Create emails table for archiving sent emails
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES public.clients,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_client_id ON public.emails(client_id);
CREATE INDEX idx_emails_sent_at ON public.emails(sent_at DESC);

-- Enable RLS
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own emails"
  ON public.emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
  ON public.emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.emails IS 'Archived sent emails for client communications';


