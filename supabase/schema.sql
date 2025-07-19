-- Create schema for UX Heuristics Analyzer

-- Leads table to store user contact information
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Sites table to store analyzed websites
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Requests table to store analysis results
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) NOT NULL,
  site_id UUID REFERENCES public.sites(id) NOT NULL,
  screenshot TEXT, -- Base64 encoded screenshot
  scores JSONB NOT NULL, -- Structured JSON with heuristic scores and details
  overall_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS requests_lead_id_idx ON public.requests(lead_id);
CREATE INDEX IF NOT EXISTS requests_site_id_idx ON public.requests(site_id);
CREATE INDEX IF NOT EXISTS requests_created_at_idx ON public.requests(created_at);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Public can read site information (URLs)
CREATE POLICY "Allow anyone to read sites" ON public.sites
  FOR SELECT USING (true);

-- Authenticated users can create leads
CREATE POLICY "Allow authenticated users to create leads" ON public.leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can read their own leads
CREATE POLICY "Allow users to read their own leads" ON public.leads
  FOR SELECT USING (auth.email() = email);

-- Service role can read/write all leads
CREATE POLICY "Allow service role full access to leads" ON public.leads
  USING (auth.jwt() ? 'service_role');

-- Anyone can create requests (analysis results)
CREATE POLICY "Allow anyone to create requests" ON public.requests
  FOR INSERT USING (true);

-- Users can read their own requests
CREATE POLICY "Allow users to read their own requests" ON public.requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_id
      AND leads.email = auth.email()
    )
  );

-- Service role can read/write all requests
CREATE POLICY "Allow service role full access to requests" ON public.requests
  USING (auth.jwt() ? 'service_role');

-- Create Storage bucket for screenshots if we want to migrate away from storing in database
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "Allow authenticated users to upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view their own screenshots
CREATE POLICY "Allow users to view their own screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'screenshots' AND
    auth.uid() = owner
  );