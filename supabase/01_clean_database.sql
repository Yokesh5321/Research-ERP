-- ==============================================================================
-- RESEARCH ERP — COMPLETE SUPABASE DATABASE SETUP
-- Type: FRESH DATABASE SCRIPT (Type A)
-- ==============================================================================
-- INSTRUCTIONS:
--   Supabase Dashboard → SQL Editor → New Query → Paste → Run
--
-- ⚠ WARNING: This script DROPS and RECREATES all ERP tables.
--   Run this on a FRESH Supabase database, or when you want a complete reset.
--   If you have existing data to preserve, do NOT run this script.
--
-- DEPENDENCY ORDER:
--   1. Extensions
--   2. Drop existing objects (clean slate)
--   3. Create tables (profiles first, then dependent tables)
--   4. Create indexes
--   5. Enable RLS + create policies
--   6. Create functions
--   7. Create triggers
--   8. Create storage buckets + policies
--   9. Create auth users (admin + sample worker)
--  10. Seed profile data (linked to auth users)
--  11. Seed project, task, execution, commit, meeting, document, notification data
-- ==============================================================================


-- ==============================================================================
-- STEP 1: EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==============================================================================
-- STEP 2: CLEAN SLATE — DROP EXISTING ERP OBJECTS
-- ==============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.github_commits CASCADE;
DROP TABLE IF EXISTS public.executions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ==============================================================================
-- STEP 3: CREATE TABLES
-- ==============================================================================

-- ── 3.1 PROFILES ──────────────────────────────────────────────────────────────
-- Linked 1-to-1 with auth.users via id (UUID from auth.users.id)
-- role: exactly 'admin' or 'worker' — no other values allowed
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  erp_id        TEXT UNIQUE,
  name          TEXT NOT NULL DEFAULT 'User',
  full_name     TEXT,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL DEFAULT 'worker'
                  CHECK (role IN ('admin', 'worker')),
  department    TEXT DEFAULT 'Research',
  designation   TEXT DEFAULT 'Research Scholar',
  phone         TEXT DEFAULT '',
  github_username TEXT DEFAULT '',
  skills        TEXT[] DEFAULT '{}',
  avatar        TEXT,
  join_date     DATE DEFAULT CURRENT_DATE,
  status        TEXT DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'on_leave')),
  performance   INT DEFAULT 0 CHECK (performance >= 0 AND performance <= 100),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.2 PROJECTS ──────────────────────────────────────────────────────────────
CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT DEFAULT '',
  description_long TEXT DEFAULT '',
  category        TEXT DEFAULT 'Artificial Intelligence',
  manager_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  team            UUID[] DEFAULT '{}',
  status          TEXT DEFAULT 'planning'
                    CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority        TEXT DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  progress        INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date      DATE,
  end_date        DATE,
  github_repo     TEXT DEFAULT '',
  total_tasks     INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.3 TASKS ─────────────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  project_id      UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority        TEXT DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status          TEXT DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'submitted', 'completed', 'failed')),
  progress        INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date      DATE,
  due_date        DATE,
  github_repo     TEXT DEFAULT '',
  github_branch   TEXT DEFAULT '',
  expected_output TEXT DEFAULT '',
  submitted_at    TIMESTAMPTZ,
  comments        TEXT[] DEFAULT '{}',
  execution_id    UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.4 EXECUTIONS (CI/CD Sandbox Logs) ───────────────────────────────────────
CREATE TABLE public.executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   TEXT,
  student_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id      UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id         UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  commit_hash     TEXT DEFAULT '',
  commit_message  TEXT DEFAULT '',
  execution_time  TEXT DEFAULT '',
  start_time      TIMESTAMPTZ,
  end_time        TIMESTAMPTZ,
  status          TEXT DEFAULT 'queued'
                    CHECK (status IN ('passed', 'failed', 'running', 'queued')),
  tests_passed    INT DEFAULT 0,
  tests_failed    INT DEFAULT 0,
  total_tests     INT DEFAULT 0,
  console_output  TEXT DEFAULT '',
  error_output    TEXT DEFAULT '',
  test_cases      JSONB DEFAULT '[]'::jsonb,
  final_result    TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.5 GITHUB COMMITS ────────────────────────────────────────────────────────
CREATE TABLE public.github_commits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo          TEXT DEFAULT '',
  branch        TEXT DEFAULT '',
  sha           TEXT DEFAULT '',
  message       TEXT DEFAULT '',
  author_id     TEXT DEFAULT '',
  author_name   TEXT DEFAULT '',
  timestamp     TIMESTAMPTZ DEFAULT NOW(),
  status        TEXT DEFAULT 'pending',
  task_id       UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  additions     INT DEFAULT 0,
  deletions     INT DEFAULT 0,
  changed_files INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.6 MEETINGS ──────────────────────────────────────────────────────────────
CREATE TABLE public.meetings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  date          DATE,
  time          TEXT DEFAULT '',
  duration      TEXT DEFAULT '',
  participants  UUID[] DEFAULT '{}',
  meeting_link  TEXT DEFAULT '',
  status        TEXT DEFAULT 'upcoming'
                  CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  agenda        TEXT DEFAULT '',
  notes         TEXT DEFAULT '',
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.7 DOCUMENTS ─────────────────────────────────────────────────────────────
CREATE TABLE public.documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT DEFAULT 'General',
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  uploaded_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  version       TEXT DEFAULT '1.0',
  date          DATE DEFAULT CURRENT_DATE,
  size          TEXT DEFAULT '',
  type          TEXT DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  file_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.8 NOTIFICATIONS ─────────────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT DEFAULT 'info',
  title         TEXT NOT NULL,
  message       TEXT DEFAULT '',
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read          BOOLEAN DEFAULT FALSE,
  timestamp     TIMESTAMPTZ DEFAULT NOW(),
  link          TEXT DEFAULT '',
  icon          TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.9 ATTENDANCE RECORDS ────────────────────────────────────────────────────
CREATE TABLE public.attendance_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  check_in_time   TIMESTAMPTZ,
  check_out_time  TIMESTAMPTZ,
  remarks         TEXT DEFAULT '',
  marked_by       UUID NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, attendance_date)
);

-- ── 3.10 ACTIVITY LOGS (Audit Trail) ──────────────────────────────────────────
CREATE TABLE public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  details     JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 4: INDEXES
-- ==============================================================================
CREATE INDEX idx_profiles_role         ON public.profiles(role);
CREATE INDEX idx_profiles_email        ON public.profiles(email);
CREATE INDEX idx_profiles_status       ON public.profiles(status);
CREATE INDEX idx_projects_status       ON public.projects(status);
CREATE INDEX idx_projects_manager      ON public.projects(manager_id);
CREATE INDEX idx_projects_created_at   ON public.projects(created_at DESC);
CREATE INDEX idx_tasks_project_id      ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to     ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status          ON public.tasks(status);
CREATE INDEX idx_tasks_due_date        ON public.tasks(due_date);
CREATE INDEX idx_executions_project_id ON public.executions(project_id);
CREATE INDEX idx_executions_task_id    ON public.executions(task_id);
CREATE INDEX idx_executions_student_id ON public.executions(student_id);
CREATE INDEX idx_executions_created_at ON public.executions(created_at DESC);
CREATE INDEX idx_commits_repo          ON public.github_commits(repo);
CREATE INDEX idx_commits_timestamp     ON public.github_commits(timestamp DESC);
CREATE INDEX idx_meetings_project_id   ON public.meetings(project_id);
CREATE INDEX idx_meetings_date         ON public.meetings(date);
CREATE INDEX idx_documents_project_id  ON public.documents(project_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read    ON public.notifications(read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_attendance_date       ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_candidate  ON public.attendance_records(candidate_id);
CREATE INDEX idx_activity_user_id      ON public.activity_logs(user_id);
CREATE INDEX idx_activity_created_at   ON public.activity_logs(created_at DESC);


-- ==============================================================================
-- STEP 5: ROW LEVEL SECURITY — ENABLE RLS ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_commits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs    ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 6: RLS POLICIES
-- ==============================================================================

-- ── PROFILES ──────────────────────────────────────────────────────────────────
-- Anyone authenticated can read profiles (needed for team listings)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can do everything on profiles
CREATE POLICY "profiles_all_admin"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── PROJECTS ──────────────────────────────────────────────────────────────────
-- All authenticated users can read projects
CREATE POLICY "projects_select_authenticated"
  ON public.projects FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can create, update, delete projects
CREATE POLICY "projects_write_admin"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "projects_update_admin"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "projects_delete_admin"
  ON public.projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── TASKS ─────────────────────────────────────────────────────────────────────
-- All authenticated users can read tasks
CREATE POLICY "tasks_select_authenticated"
  ON public.tasks FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can create and delete tasks
CREATE POLICY "tasks_insert_admin"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "tasks_delete_admin"
  ON public.tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any task; workers can only update their own assigned tasks
CREATE POLICY "tasks_update_admin_or_assigned"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR assigned_to = auth.uid()
  );

-- ── EXECUTIONS ────────────────────────────────────────────────────────────────
-- Admins can see all; workers can only see their own
CREATE POLICY "executions_select_admin"
  ON public.executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR student_id = auth.uid()
  );

CREATE POLICY "executions_insert_authenticated"
  ON public.executions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ── GITHUB COMMITS ────────────────────────────────────────────────────────────
-- All authenticated users can read commits
CREATE POLICY "commits_select_authenticated"
  ON public.github_commits FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "commits_insert_authenticated"
  ON public.github_commits FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ── MEETINGS ──────────────────────────────────────────────────────────────────
-- All authenticated users can read meetings
CREATE POLICY "meetings_select_authenticated"
  ON public.meetings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete meetings
CREATE POLICY "meetings_write_admin"
  ON public.meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "meetings_update_admin"
  ON public.meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "meetings_delete_admin"
  ON public.meetings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── DOCUMENTS ─────────────────────────────────────────────────────────────────
-- All authenticated users can read documents
CREATE POLICY "documents_select_authenticated"
  ON public.documents FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can create/delete; workers can upload (insert)
CREATE POLICY "documents_insert_authenticated"
  ON public.documents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "documents_delete_admin"
  ON public.documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
-- Users can only see their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all notifications
CREATE POLICY "notifications_select_admin"
  ON public.notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can create notifications (for system events)
CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ── ATTENDANCE RECORDS ────────────────────────────────────────────────────────
-- Only admins can access attendance records
CREATE POLICY "attendance_admin_only"
  ON public.attendance_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── ACTIVITY LOGS ─────────────────────────────────────────────────────────────
-- Only admins can read logs
CREATE POLICY "activity_logs_select_admin"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All authenticated users can insert log entries
CREATE POLICY "activity_logs_insert_authenticated"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- ==============================================================================
-- STEP 7: FUNCTIONS
-- ==============================================================================

-- ── updated_at auto-update trigger function ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── handle_new_user: Auto-create profile on auth.users INSERT/UPDATE ──────────
-- This ensures every Supabase Auth user always has a corresponding profile row.
-- role is taken from raw_user_meta_data.role (set during user creation).
-- Defaults to 'worker' if no role is provided.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role        TEXT;
  v_name        TEXT;
  v_erp_id      TEXT;
  v_department  TEXT;
  v_designation TEXT;
  v_phone       TEXT;
BEGIN
  v_role        := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');
  v_name        := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_erp_id      := COALESCE(NEW.raw_user_meta_data->>'erp_id', NEW.id::text);
  v_department  := COALESCE(NEW.raw_user_meta_data->>'department', 'Research');
  v_designation := COALESCE(
    NEW.raw_user_meta_data->>'designation',
    CASE WHEN v_role = 'admin' THEN 'System Administrator' ELSE 'Research Scholar' END
  );
  v_phone       := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- Normalize role to exactly 'admin' or 'worker'
  IF v_role NOT IN ('admin', 'worker') THEN
    v_role := 'worker';
  END IF;

  INSERT INTO public.profiles (
    id, erp_id, email, name, full_name,
    role, department, designation, phone,
    status, created_at, updated_at
  )
  VALUES (
    NEW.id, v_erp_id, NEW.email, v_name, v_name,
    v_role, v_department, v_designation, v_phone,
    'active', NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email       = EXCLUDED.email,
    name        = COALESCE(EXCLUDED.name, profiles.name),
    full_name   = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role        = COALESCE(EXCLUDED.role, profiles.role),
    erp_id      = COALESCE(EXCLUDED.erp_id, profiles.erp_id),
    department  = COALESCE(EXCLUDED.department, profiles.department),
    designation = COALESCE(EXCLUDED.designation, profiles.designation),
    phone       = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at  = NOW();

  RETURN NEW;
END;
$$;


-- ==============================================================================
-- STEP 8: TRIGGERS
-- ==============================================================================

-- Auto-create/update profile when auth user is inserted or their metadata changes
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data, email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on projects
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on tasks
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on attendance
CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ==============================================================================
-- STEP 9: STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', true),
  ('avatars',   'avatars',   true)
ON CONFLICT (id) DO NOTHING;

-- Drop old storage policies if they exist (idempotent)
DROP POLICY IF EXISTS "storage_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_insert"   ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_update"   ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_delete"   ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete"  ON storage.objects;

-- Anyone can read documents and avatars
CREATE POLICY "storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('documents', 'avatars'));

-- Authenticated users can upload
CREATE POLICY "storage_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('documents', 'avatars') AND auth.role() = 'authenticated');

-- Authenticated users can update their uploads
CREATE POLICY "storage_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('documents', 'avatars') AND auth.role() = 'authenticated');

-- Authenticated users can delete their uploads
CREATE POLICY "storage_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('documents', 'avatars') AND auth.role() = 'authenticated');


-- ==============================================================================
-- STEP 10: CREATE AUTH USERS
-- ==============================================================================
-- These users are created directly in auth.users so they can log in.
-- The handle_new_user trigger will automatically create their profiles.
-- Passwords are set here — change them in production via Supabase Dashboard.

-- ── A. Admin Account: Dr. Rajesh Kumar (admin@researcherp.org / Admin@123456) ──
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'admin@researcherp.org',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Dr. Rajesh Kumar","role":"admin","department":"Administration","designation":"System Administrator","phone":"+91 98765 43210"}'::jsonb,
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@researcherp.org');

-- Update password and metadata for existing admin account
UPDATE auth.users SET
  encrypted_password = crypt('Admin@123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  raw_user_meta_data = '{"name":"Dr. Rajesh Kumar","role":"admin","department":"Administration","designation":"System Administrator","phone":"+91 98765 43210"}'::jsonb,
  updated_at = NOW()
WHERE email = 'admin@researcherp.org';

-- Create identity entry for admin (needed for Supabase email login)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT id, id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email', id::text, NOW(), NOW(), NOW()
FROM auth.users WHERE email = 'admin@researcherp.org'
  AND NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@researcherp.org'));

-- ── B. Your Personal Admin Account (yokeshkumar5321@gmail.com / Admin@123456) ──
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'yokeshkumar5321@gmail.com',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Yokesh Kumar","role":"admin","department":"Administration","designation":"System Administrator","phone":"+91 98765 43211"}'::jsonb,
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'yokeshkumar5321@gmail.com');

UPDATE auth.users SET
  encrypted_password = crypt('Admin@123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  raw_user_meta_data = '{"name":"Yokesh Kumar","role":"admin","department":"Administration","designation":"System Administrator","phone":"+91 98765 43211"}'::jsonb,
  updated_at = NOW()
WHERE email = 'yokeshkumar5321@gmail.com';

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT id, id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email', id::text, NOW(), NOW(), NOW()
FROM auth.users WHERE email = 'yokeshkumar5321@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = 'yokeshkumar5321@gmail.com'));

-- ── C. Sample Worker Account: Priya Sharma (priya.sharma@researcherp.org / Worker@123456) ──
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'priya.sharma@researcherp.org',
  crypt('Worker@123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Priya Sharma","role":"worker","department":"Artificial Intelligence","designation":"Research Scholar","phone":"+91 98100 11001"}'::jsonb,
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'priya.sharma@researcherp.org');

UPDATE auth.users SET
  encrypted_password = crypt('Worker@123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  raw_user_meta_data = '{"name":"Priya Sharma","role":"worker","department":"Artificial Intelligence","designation":"Research Scholar","phone":"+91 98100 11001"}'::jsonb,
  updated_at = NOW()
WHERE email = 'priya.sharma@researcherp.org';

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT id, id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email', id::text, NOW(), NOW(), NOW()
FROM auth.users WHERE email = 'priya.sharma@researcherp.org'
  AND NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = 'priya.sharma@researcherp.org'));


-- ==============================================================================
-- STEP 11: SEED PROFILE DATA
-- ==============================================================================
-- Profiles for auth users are already created by the trigger (handle_new_user).
-- Here we UPDATE them with full details (skills, github, performance, etc.)
-- Additional worker profiles (no auth accounts — display/demo data only)

-- Update admin profile with full details
UPDATE public.profiles SET
  erp_id          = 'admin-001',
  name            = 'Dr. Rajesh Kumar',
  full_name       = 'Dr. Rajesh Kumar',
  department      = 'Administration',
  designation     = 'System Administrator',
  phone           = '+91 98765 43210',
  github_username = 'rajeshkumar-research',
  skills          = ARRAY['Project Management', 'Machine Learning', 'Research Methodology'],
  join_date       = '2020-01-15',
  status          = 'active',
  performance     = 98
WHERE email = 'admin@researcherp.org';

UPDATE public.profiles SET
  erp_id          = 'admin-002',
  name            = 'Yokesh Kumar',
  full_name       = 'Yokesh Kumar',
  department      = 'Administration',
  designation     = 'System Administrator',
  phone           = '+91 98765 43211',
  github_username = 'yokeshkumar',
  skills          = ARRAY['Project Management', 'Full Stack Development', 'Research Methodology'],
  join_date       = '2021-01-15',
  status          = 'active',
  performance     = 100
WHERE email = 'yokeshkumar5321@gmail.com';

UPDATE public.profiles SET
  erp_id          = 'w-001',
  name            = 'Priya Sharma',
  full_name       = 'Priya Sharma',
  department      = 'Artificial Intelligence',
  designation     = 'Research Scholar',
  phone           = '+91 98100 11001',
  github_username = 'priya-sharma-ai',
  skills          = ARRAY['Python', 'TensorFlow', 'Computer Vision', 'Deep Learning'],
  join_date       = '2022-06-01',
  status          = 'active',
  performance     = 92
WHERE email = 'priya.sharma@researcherp.org';


-- ==============================================================================
-- STEP 12: SEED PROJECTS (using real UUIDs — referenced by later seed data)
-- ==============================================================================
-- Note: manager_id and team now use real profile UUIDs.
-- We reference admin and priya's profile IDs using subqueries.

DO $$
DECLARE
  v_admin_id   UUID;
  v_yokesh_id  UUID;
  v_priya_id   UUID;
  v_p1 UUID; v_p2 UUID; v_p3 UUID; v_p4 UUID;
  v_p5 UUID; v_p6 UUID; v_p7 UUID; v_p8 UUID;
BEGIN
  SELECT id INTO v_admin_id  FROM public.profiles WHERE email = 'admin@researcherp.org';
  SELECT id INTO v_yokesh_id FROM public.profiles WHERE email = 'yokeshkumar5321@gmail.com';
  SELECT id INTO v_priya_id  FROM public.profiles WHERE email = 'priya.sharma@researcherp.org';

  -- Insert 8 seed projects (only if admin exists)
  IF v_admin_id IS NOT NULL THEN

    INSERT INTO public.projects (id, name, description, description_long, category, manager_id, team, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'AI Based Medical Image Analysis',
      'Developing deep learning models to analyze medical images including X-rays, MRI scans, and CT scans for automated disease detection.',
      'This project focuses on building convolutional neural network architectures for medical image analysis. The primary goal is to create a robust pipeline for preprocessing, augmenting, training, and evaluating models on publicly available medical imaging datasets.',
      'Artificial Intelligence', v_admin_id,
      CASE WHEN v_priya_id IS NOT NULL THEN ARRAY[v_priya_id] ELSE '{}'::UUID[] END,
      'active', 'high', 65, '2024-01-15', '2024-12-31', 'research-org/medical-image-ai', 8, 5)
    RETURNING id INTO v_p1;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'NLP Based Sentiment Analysis',
      'Building transformer-based models to analyze sentiment in social media posts with multilingual support.',
      'Natural Language Processing', v_admin_id, 'active', 'medium', 45, '2024-03-01', '2024-11-30', 'research-org/nlp-sentiment', 6, 2)
    RETURNING id INTO v_p2;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'Real-Time Object Detection System',
      'Implementing YOLO-based object detection for real-time video analysis in surveillance scenarios.',
      'Computer Vision', v_admin_id, 'active', 'high', 72, '2023-09-01', '2024-08-31', 'research-org/realtime-object-detection', 7, 5)
    RETURNING id INTO v_p3;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'Big Data Analytics Pipeline',
      'Designing a scalable big data pipeline using Apache Spark for processing large research datasets.',
      'Data Engineering', v_admin_id, 'on_hold', 'medium', 30, '2024-04-01', '2025-03-31', 'research-org/bigdata-pipeline', 5, 1)
    RETURNING id INTO v_p4;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'Genomic Data Analysis for Disease Prediction',
      'Analyzing genomic sequences using machine learning to identify genetic markers associated with diseases.',
      'Bioinformatics', v_admin_id, 'active', 'high', 55, '2024-02-01', '2024-12-31', 'research-org/genomics-disease-prediction', 6, 3)
    RETURNING id INTO v_p5;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'Autonomous Navigation Robot',
      'Building an autonomous robot capable of navigating complex environments using LiDAR and reinforcement learning.',
      'Robotics', v_admin_id, 'planning', 'low', 15, '2024-07-01', '2025-06-30', 'research-org/autonomous-robot', 4, 0)
    RETURNING id INTO v_p6;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'Multi-Agent Reinforcement Learning Framework',
      'Developing a framework for training multiple agents to cooperate in complex simulated environments.',
      'Artificial Intelligence', v_admin_id, 'active', 'medium', 40, '2024-05-01', '2025-04-30', 'research-org/marl-framework', 5, 2)
    RETURNING id INTO v_p7;

    INSERT INTO public.projects (id, name, description, category, manager_id, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
    VALUES (gen_random_uuid(), 'Drug Discovery using Molecular ML',
      'Applying graph neural networks to predict drug-target interactions for accelerated drug discovery.',
      'Bioinformatics', v_admin_id, 'completed', 'high', 100, '2023-03-01', '2024-02-28', 'research-org/drug-discovery-ml', 7, 7)
    RETURNING id INTO v_p8;

    -- Seed tasks for the first project (medical image AI) with Priya assigned
    IF v_p1 IS NOT NULL AND v_priya_id IS NOT NULL THEN
      INSERT INTO public.tasks (title, description, project_id, assigned_to, priority, status, progress, start_date, due_date, github_repo, github_branch, expected_output)
      VALUES
        ('Medical Image Dataset Preprocessing',
         'Clean, normalize, and augment the medical imaging dataset. Remove corrupted images, standardize dimensions to 224x224, apply CLAHE.',
         v_p1, v_priya_id, 'high', 'completed', 100, '2024-01-15', '2024-02-15',
         'research-org/medical-image-ai', 'feature/data-preprocessing',
         'Preprocessed dataset with 10,000+ images, data pipeline script'),

        ('CNN Model Architecture Design',
         'Design and implement the CNN architecture using ResNet-50 as backbone with transfer learning.',
         v_p1, v_priya_id, 'high', 'completed', 100, '2024-02-16', '2024-03-31',
         'research-org/medical-image-ai', 'feature/model-architecture',
         'Model architecture code, training script'),

        ('Model Training and Hyperparameter Tuning',
         'Train the CNN model on the preprocessed dataset. Use Optuna for hyperparameter optimization.',
         v_p1, v_priya_id, 'high', 'in_progress', 60, '2024-04-01', '2024-09-30',
         'research-org/medical-image-ai', 'feature/model-training',
         'Trained model with >90% accuracy, training logs'),

        ('Model Evaluation and Benchmarking',
         'Evaluate trained model on test set. Compute precision, recall, F1, AUC-ROC.',
         v_p1, v_priya_id, 'medium', 'not_started', 0, '2024-10-01', '2024-11-30',
         'research-org/medical-image-ai', 'feature/model-evaluation',
         'Evaluation report, benchmark comparison');
    END IF;

    -- Seed meetings
    IF v_p1 IS NOT NULL THEN
      INSERT INTO public.meetings (title, project_id, date, time, duration, meeting_link, status, agenda, created_by)
      VALUES
        ('Medical Image AI - Weekly Progress Review', v_p1, CURRENT_DATE + INTERVAL '3 days',
         '10:00', '60', 'https://meet.google.com/abc-defg-hij', 'upcoming',
         'Review model training progress, discuss hyperparameter tuning results.', v_admin_id),
        ('Q3 Research All-Hands', NULL, CURRENT_DATE + INTERVAL '7 days',
         '14:00', '90', 'https://meet.google.com/xyz-uvwx-yz1', 'upcoming',
         'Quarterly research status update for all projects.', v_admin_id);
    END IF;

    -- Seed documents
    INSERT INTO public.documents (name, category, project_id, uploaded_by, version, date, size, type, tags)
    VALUES
      ('Research ERP Project Proposal', 'Project Documents', v_p1, v_admin_id, '1.0', CURRENT_DATE, '2.4 MB', 'pdf', ARRAY['proposal', 'medical imaging', 'AI']),
      ('Q3 Progress Report - All Projects', 'Reports', NULL, v_admin_id, '1.0', CURRENT_DATE, '5.2 MB', 'pdf', ARRAY['quarterly report', 'progress', 'Q3']);

    -- Seed notifications for Priya
    IF v_priya_id IS NOT NULL THEN
      INSERT INTO public.notifications (type, title, message, user_id, read, link, icon)
      VALUES
        ('task_assigned', 'New Task Assigned',
         'You have been assigned "Model Training and Hyperparameter Tuning" for project AI Based Medical Image Analysis.',
         v_priya_id, FALSE, '/worker/tasks', 'clipboard'),

        ('meeting_scheduled', 'Meeting Scheduled',
         'A new weekly progress review meeting has been scheduled for your project.',
         v_priya_id, FALSE, '/worker/meetings', 'calendar');

      -- Seed notification for admin
      INSERT INTO public.notifications (type, title, message, user_id, read, link, icon)
      VALUES
        ('system', 'ERP System Ready',
         'The Research ERP has been successfully set up and is ready for use.',
         v_admin_id, FALSE, '/admin/dashboard', 'check-circle');
    END IF;

    -- Seed GitHub commits
    IF v_p1 IS NOT NULL THEN
      INSERT INTO public.github_commits (repo, branch, sha, message, author_id, author_name, timestamp, status, additions, deletions, changed_files)
      VALUES
        ('research-org/medical-image-ai', 'feature/data-preprocessing', 'a3f9c1d',
         'Add CLAHE contrast enhancement to preprocessing pipeline',
         'priya-sharma-ai', 'Priya Sharma', NOW() - INTERVAL '7 days', 'passed', 124, 18, 3),
        ('research-org/medical-image-ai', 'feature/model-training', 'b2e8d4f',
         'Implement learning rate warmup scheduler',
         'priya-sharma-ai', 'Priya Sharma', NOW() - INTERVAL '5 days', 'passed', 67, 12, 2);
    END IF;

    -- Log seed action
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_admin_id, 'INITIAL_SEED', 'database', 'all',
      '{"message":"Research ERP database seeded successfully","version":"2.0.0"}'::jsonb);

  END IF;
END $$;


-- ==============================================================================
-- VERIFICATION QUERIES — Run these after the script to confirm success
-- ==============================================================================
-- SELECT 'auth.users' AS table_name, COUNT(*) AS count FROM auth.users WHERE email LIKE '%researcherp%' OR email = 'yokeshkumar5321@gmail.com'
-- UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles
-- UNION ALL SELECT 'projects', COUNT(*) FROM public.projects
-- UNION ALL SELECT 'tasks',    COUNT(*) FROM public.tasks
-- UNION ALL SELECT 'meetings', COUNT(*) FROM public.meetings
-- UNION ALL SELECT 'documents', COUNT(*) FROM public.documents
-- UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
-- UNION ALL SELECT 'github_commits', COUNT(*) FROM public.github_commits;
