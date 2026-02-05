-- Create commissions table
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  president_id UUID,
  vice_president_id UUID,
  member_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Homme', 'Femme')),
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  role TEXT NOT NULL,
  commission_id UUID REFERENCES public.commissions(id) ON DELETE SET NULL,
  commission_role TEXT CHECK (commission_role IN ('president', 'vice-president', 'member')),
  is_adult BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  cotisation_homme INTEGER NOT NULL,
  cotisation_femme INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cotisations table
CREATE TABLE public.cotisations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  paid_amount INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id, event_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_history table
CREATE TABLE public.report_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('event', 'annual')),
  name TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security_codes table (single row for app settings)
CREATE TABLE public.security_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archive_code TEXT NOT NULL DEFAULT 'ARCHIVE2024',
  reset_code TEXT NOT NULL DEFAULT 'DAHIRA2024',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default security codes
INSERT INTO public.security_codes (id) VALUES (gen_random_uuid());

-- Enable RLS on all tables
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (no auth required for this app)
CREATE POLICY "Allow public read access" ON public.commissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.commissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.commissions FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.members FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.events FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.cotisations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.cotisations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.cotisations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.cotisations FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.transactions FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.report_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.report_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.report_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.report_history FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.security_codes FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON public.security_codes FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cotisations_updated_at BEFORE UPDATE ON public.cotisations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_codes_updated_at BEFORE UPDATE ON public.security_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();