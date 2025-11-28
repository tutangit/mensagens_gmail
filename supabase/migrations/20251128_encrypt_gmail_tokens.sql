-- Migration: encrypt Gmail tokens and enforce policies
-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add encrypted columns to gmail_accounts
ALTER TABLE public.gmail_accounts
  ADD COLUMN access_token_enc TEXT,
  ADD COLUMN refresh_token_enc TEXT;

-- 3. Migrate existing data (use a static key; replace with env variable in production)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id, access_token, refresh_token FROM public.gmail_accounts LOOP
    UPDATE public.gmail_accounts
    SET access_token_enc = pgp_sym_encrypt(rec.access_token, 'gmail_secret_key'),
        refresh_token_enc = pgp_sym_encrypt(rec.refresh_token, 'gmail_secret_key')
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 4. Drop plain token columns (optional – keep for backup if needed)
ALTER TABLE public.gmail_accounts DROP COLUMN access_token;
ALTER TABLE public.gmail_accounts DROP COLUMN refresh_token;

-- 5. Create helper function to decrypt tokens
CREATE OR REPLACE FUNCTION public.decrypt_gmail_token(enc TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT pgp_sym_decrypt(enc, 'gmail_secret_key')::TEXT;
$$;

-- 6. Policies (ensure only owner can access own rows)
-- profiles
CREATE POLICY "owner can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- gmail_accounts
CREATE POLICY "owner can view own gmail account" ON public.gmail_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner can insert own gmail account" ON public.gmail_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner can update own gmail account" ON public.gmail_accounts FOR UPDATE USING (auth.uid() = user_id);

-- sent_emails
CREATE POLICY "owner can view own sent emails" ON public.sent_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner can insert own sent emails" ON public.sent_emails FOR INSERT WITH CHECK (auth.uid() = user_id);

-- email_templates
CREATE POLICY "owner can view own templates" ON public.email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner can insert own templates" ON public.email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner can update own templates" ON public.email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner can delete own templates" ON public.email_templates FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS (already enabled, but ensure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
