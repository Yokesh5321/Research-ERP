-- ==============================================================================
-- RESEARCH ERP - SUPABASE AUTHENTICATION & LOGIN ACCESS SETUP
-- ==============================================================================
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- This sets up the automatic profile sync trigger and creates authorized accounts.
-- ==============================================================================

-- 1. Enable pgcrypto extension for password encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure public.profiles table exists and has all required columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS erp_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'worker';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS performance INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely remove any NOT NULL constraints on legacy/starter template columns (e.g. full_name, username)
DO $$
DECLARE
  col record;
BEGIN
  FOR col IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND is_nullable = 'NO' 
      AND column_name NOT IN ('id', 'role', 'name', 'email')
  LOOP
    EXECUTE format('ALTER TABLE public.profiles ALTER COLUMN %I DROP NOT NULL', col.column_name);
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_erp_id ON public.profiles(erp_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Create the Trigger Function to automatically sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_erp_id TEXT;
  v_department TEXT;
  v_designation TEXT;
  v_phone TEXT;
BEGIN
  -- Extract metadata or set defaults
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_erp_id := COALESCE(NEW.raw_user_meta_data->>'erp_id', NEW.id::text);
  v_department := COALESCE(NEW.raw_user_meta_data->>'department', 'Research');
  v_designation := COALESCE(NEW.raw_user_meta_data->>'designation', 
    CASE WHEN v_role = 'admin' THEN 'Research Director' ELSE 'Research Scholar' END
  );
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- Upsert into profiles table (populating both name and full_name for compatibility)
  INSERT INTO public.profiles (
    id,
    erp_id,
    email,
    name,
    full_name,
    role,
    department,
    designation,
    phone,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_erp_id,
    NEW.email,
    v_name,
    v_name,
    v_role,
    v_department,
    v_designation,
    v_phone,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    erp_id = COALESCE(EXCLUDED.erp_id, profiles.erp_id),
    department = COALESCE(EXCLUDED.department, profiles.department),
    designation = COALESCE(EXCLUDED.designation, profiles.designation),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 4. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data, email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. DIRECT SQL QUERIES TO ADD AUTHORIZED USERS IN SUPABASE
-- ==============================================================================

-- A. Create Authorized ADMIN Account (Dr. Rajesh Kumar)
DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_admin_email TEXT := 'admin@researcherp.org';
  v_admin_pass TEXT := 'Admin@123456'; -- Change this password as desired
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      v_admin_email,
      crypt(v_admin_pass, gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr. Rajesh Kumar", "role": "admin", "erp_id": "admin-001", "department": "Administration", "designation": "Research Director", "phone": "+91 98765 43210"}',
      NOW(),
      NOW()
    );

    -- Also insert into auth.identities so Supabase recognizes the email login provider
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id,
      v_admin_id,
      format('{"sub":"%s","email":"%s"}', v_admin_id, v_admin_email)::jsonb,
      'email',
      v_admin_id::text,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- B. Create Authorized WORKER Account (Priya Sharma)
DO $$
DECLARE
  v_worker_id UUID := gen_random_uuid();
  v_worker_email TEXT := 'priya.sharma@researcherp.org';
  v_worker_pass TEXT := 'Worker@123456'; -- Change this password as desired
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_worker_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_worker_id,
      'authenticated',
      'authenticated',
      v_worker_email,
      crypt(v_worker_pass, gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Priya Sharma", "role": "worker", "erp_id": "w-001", "department": "Artificial Intelligence", "designation": "Research Scholar", "phone": "+91 98100 11001"}',
      NOW(),
      NOW()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_worker_id,
      v_worker_id,
      format('{"sub":"%s","email":"%s"}', v_worker_id, v_worker_email)::jsonb,
      'email',
      v_worker_id::text,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;
