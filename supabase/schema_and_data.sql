-- ==============================================================================
-- RESEARCH ERP - COMPLETE SUPABASE SETUP FROM SCRATCH
-- ==============================================================================
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
--
-- This script:
--   1. Enables required extensions (uuid-ossp, pgcrypto)
--   2. Wipes any old/conflicting ERP tables (CASCADE) for a 100% clean slate
--   3. Recreates all 8 database tables fresh with complete schemas:
--        - profiles (scholars & admins)
--        - projects (with team[], description_long, github_repo, etc.)
--        - tasks
--        - executions
--        - github_commits
--        - meetings
--        - documents
--        - notifications
--   4. Creates high-performance indexes & permissive Row Level Security (RLS)
--   5. Sets up the auth synchronization trigger (handle_new_user)
--   6. Creates or updates authorized login credentials in auth.users:
--        - Admin: admin@researcherp.org / Admin@123456
--        - Candidate: priya.sharma@researcherp.org / Worker@123456
--   7. Seeds permanent data for all 8 ERP modules
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- STEP 2: CLEAN SLATE (DROP OLD TABLES)
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.github_commits CASCADE;
DROP TABLE IF EXISTS public.executions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ------------------------------------------------------------------------------
-- STEP 3: CREATE FRESH TABLES FROM SCRATCH
-- ------------------------------------------------------------------------------

-- 1. PROFILES (Users, Scholars, and Admins)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id TEXT UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker')),
  department TEXT,
  designation TEXT,
  phone TEXT,
  github_username TEXT,
  skills TEXT[] DEFAULT '{}',
  avatar TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  performance INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS
CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  description_long TEXT,
  category TEXT,
  manager_id TEXT,
  team TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  progress INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  github_repo TEXT,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'completed', 'failed')),
  progress INT DEFAULT 0,
  start_date DATE,
  due_date DATE,
  github_repo TEXT,
  github_branch TEXT,
  expected_output TEXT,
  submitted_at TIMESTAMPTZ,
  comments TEXT[] DEFAULT '{}',
  execution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXECUTIONS (CI/CD Sandbox Logs)
CREATE TABLE public.executions (
  id TEXT PRIMARY KEY,
  submission_id TEXT,
  student_id TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  commit_hash TEXT,
  commit_message TEXT,
  execution_time TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'passed' CHECK (status IN ('passed', 'failed', 'running', 'queued')),
  tests_passed INT DEFAULT 0,
  tests_failed INT DEFAULT 0,
  total_tests INT DEFAULT 0,
  console_output TEXT,
  error_output TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  final_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GITHUB COMMITS
CREATE TABLE public.github_commits (
  id TEXT PRIMARY KEY,
  repo TEXT,
  branch TEXT,
  sha TEXT,
  message TEXT,
  author_id TEXT,
  author_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT,
  task_id TEXT,
  additions INT DEFAULT 0,
  deletions INT DEFAULT 0,
  changed_files INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MEETINGS
CREATE TABLE public.meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  date DATE,
  time TEXT,
  duration TEXT,
  participants TEXT[] DEFAULT '{}',
  meeting_link TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  agenda TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DOCUMENTS
CREATE TABLE public.documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  uploaded_by TEXT,
  version TEXT,
  date DATE,
  size TEXT,
  type TEXT,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  user_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  link TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ATTENDANCE RECORDS (Admin Only)
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  check_in_time TIMESTAMPTZ NULL,
  check_out_time TIMESTAMPTZ NULL,
  remarks TEXT NULL,
  marked_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, attendance_date)
);

-- 10. ACTIVITY LOGS (Audit Trail)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- STEP 4: INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_erp_id ON public.profiles(erp_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_executions_project_id ON public.executions(project_id);
CREATE INDEX idx_executions_task_id ON public.executions(task_id);
CREATE INDEX idx_executions_student_id ON public.executions(student_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_candidate ON public.attendance_records(candidate_id);
CREATE INDEX idx_attendance_status ON public.attendance_records(status);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- ------------------------------------------------------------------------------
-- STEP 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for executions" ON public.executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for github_commits" ON public.github_commits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for meetings" ON public.meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- STRICT ADMIN-ONLY POLICY FOR ATTENDANCE
-- Candidates / Workers have ZERO access to attendance_records
CREATE POLICY "Admins only attendance access" ON public.attendance_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Activity Logs Policies
CREATE POLICY "Admins view activity logs" ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated insert activity logs" ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Storage buckets for ERP documents and user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id IN ('documents', 'avatars'));
CREATE POLICY "Authenticated Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('documents', 'avatars') AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('documents', 'avatars') AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('documents', 'avatars') AND auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- STEP 6: AUTH TRIGGER (Auto-sync new auth users with public.profiles)
-- ------------------------------------------------------------------------------
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
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_erp_id := COALESCE(NEW.raw_user_meta_data->>'erp_id', NEW.id::text);
  v_department := COALESCE(NEW.raw_user_meta_data->>'department', 'Research');
  v_designation := COALESCE(NEW.raw_user_meta_data->>'designation', 
    CASE WHEN v_role = 'admin' THEN 'System Administrator' ELSE 'Research Scholar' END
  );
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  INSERT INTO public.profiles (
    id, erp_id, email, name, full_name, role, department, designation, phone, status, created_at, updated_at
  )
  VALUES (
    NEW.id, v_erp_id, NEW.email, v_name, v_name, v_role, v_department, v_designation, v_phone, 'active', NOW(), NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data, email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- STEP 7: CREATE AUTHORIZED LOGIN ACCOUNTS IN AUTH.USERS
-- ------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------
-- STEP 7: CREATE AUTHORIZED LOGIN ACCOUNTS IN AUTH.USERS (PURE SQL, NO DO BLOCKS)
-- ------------------------------------------------------------------------------

-- A. Admin Account: admin@researcherp.org / Admin@123456
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@researcherp.org',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Dr. Rajesh Kumar", "role": "admin", "erp_id": "admin-001", "department": "Administration", "designation": "System Administrator", "phone": "+91 98765 43210"}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@researcherp.org');

UPDATE auth.users 
SET encrypted_password = crypt('Admin@123456', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = '{"name": "Dr. Rajesh Kumar", "role": "admin", "erp_id": "admin-001", "department": "Administration", "designation": "System Administrator", "phone": "+91 98765 43210"}'::jsonb,
    updated_at = NOW()
WHERE email = 'admin@researcherp.org';

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
SELECT
  id,
  id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email',
  id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@researcherp.org'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = auth.users.id
  );

-- B. Candidate / Worker Account: priya.sharma@researcherp.org / Worker@123456
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'priya.sharma@researcherp.org',
  crypt('Worker@123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Priya Sharma", "role": "worker", "erp_id": "w-001", "department": "Artificial Intelligence", "designation": "Research Scholar", "phone": "+91 98100 11001"}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'priya.sharma@researcherp.org');

UPDATE auth.users 
SET encrypted_password = crypt('Worker@123456', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = '{"name": "Priya Sharma", "role": "worker", "erp_id": "w-001", "department": "Artificial Intelligence", "designation": "Research Scholar", "phone": "+91 98100 11001"}'::jsonb,
    updated_at = NOW()
WHERE email = 'priya.sharma@researcherp.org';

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
SELECT
  id,
  id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email',
  id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'priya.sharma@researcherp.org'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = auth.users.id
  );

-- C. Admin Account: yokeshkumar5321@gmail.com / Admin@123456
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'yokeshkumar5321@gmail.com',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Yokesh Kumar", "role": "admin", "erp_id": "admin-002", "department": "Administration", "designation": "System Administrator", "phone": "+91 98765 43211"}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'yokeshkumar5321@gmail.com');

UPDATE auth.users 
SET encrypted_password = crypt('Admin@123456', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = '{"name": "Yokesh Kumar", "role": "admin", "erp_id": "admin-002", "department": "Administration", "designation": "System Administrator", "phone": "+91 98765 43211"}'::jsonb,
    updated_at = NOW()
WHERE email = 'yokeshkumar5321@gmail.com';

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
SELECT
  id,
  id,
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
  'email',
  id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'yokeshkumar5321@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = auth.users.id
  );

-- ------------------------------------------------------------------------------
-- STEP 8: SEED PERMANENT ERP DATA
-- ------------------------------------------------------------------------------

-- A. SEED PROFILES
INSERT INTO public.profiles (id, erp_id, name, full_name, email, role, department, designation, phone, github_username, skills, join_date, status, performance)
VALUES
(COALESCE((SELECT id FROM auth.users WHERE email = 'admin@researcherp.org'), gen_random_uuid()), 'admin-001', 'Dr. Rajesh Kumar', 'Dr. Rajesh Kumar', 'admin@researcherp.org', 'admin', 'Administration', 'System Administrator', '+91 98765 43210', 'rajeshkumar-research', ARRAY['Project Management', 'Machine Learning', 'Research Methodology'], '2020-01-15', 'active', 98),
(COALESCE((SELECT id FROM auth.users WHERE email = 'yokeshkumar5321@gmail.com'), gen_random_uuid()), 'admin-002', 'Yokesh Kumar', 'Yokesh Kumar', 'yokeshkumar5321@gmail.com', 'admin', 'Administration', 'System Administrator', '+91 98765 43211', 'yokeshkumar', ARRAY['Project Management', 'Full Stack Development', 'Research Methodology'], '2021-01-15', 'active', 100),
(COALESCE((SELECT id FROM auth.users WHERE email = 'priya.sharma@researcherp.org'), gen_random_uuid()), 'w-001', 'Priya Sharma', 'Priya Sharma', 'priya.sharma@researcherp.org', 'worker', 'Artificial Intelligence', 'Research Scholar', '+91 98100 11001', 'priya-sharma-ai', ARRAY['Python', 'TensorFlow', 'Computer Vision', 'Deep Learning'], '2022-06-01', 'active', 92),
(gen_random_uuid(), 'w-002', 'Arjun Mehta', 'Arjun Mehta', 'arjun.mehta@researcherp.org', 'worker', 'Data Science', 'Research Scholar', '+91 98100 11002', 'arjun-mehta-ds', ARRAY['Python', 'PyTorch', 'NLP', 'Statistical Analysis'], '2022-08-15', 'active', 88),
(gen_random_uuid(), 'w-003', 'Sneha Reddy', 'Sneha Reddy', 'sneha.reddy@researcherp.org', 'worker', 'Bioinformatics', 'Research Scholar', '+91 98100 11003', 'sneha-reddy-bio', ARRAY['Python', 'R', 'Genomics', 'Machine Learning'], '2021-09-01', 'active', 95),
(gen_random_uuid(), 'w-004', 'Karan Patel', 'Karan Patel', 'karan.patel@researcherp.org', 'worker', 'Robotics', 'Research Engineer', '+91 98100 11004', 'karan-patel-rob', ARRAY['C++', 'ROS', 'Python', 'Control Systems'], '2023-01-10', 'active', 78),
(gen_random_uuid(), 'w-005', 'Ananya Singh', 'Ananya Singh', 'ananya.singh@researcherp.org', 'worker', 'Artificial Intelligence', 'Research Scholar', '+91 98100 11005', 'ananya-singh-ml', ARRAY['Python', 'Keras', 'Data Analysis', 'Visualization'], '2022-03-20', 'active', 85),
(gen_random_uuid(), 'w-006', 'Rahul Nair', 'Rahul Nair', 'rahul.nair@researcherp.org', 'worker', 'Computer Vision', 'Research Scholar', '+91 98100 11006', 'rahul-nair-cv', ARRAY['Python', 'OpenCV', 'YOLO', 'Image Processing'], '2023-02-01', 'active', 82),
(gen_random_uuid(), 'w-007', 'Divya Krishnan', 'Divya Krishnan', 'divya.krishnan@researcherp.org', 'worker', 'Natural Language Processing', 'Research Scholar', '+91 98100 11007', 'divya-k-nlp', ARRAY['Python', 'BERT', 'Transformers', 'Text Mining'], '2022-11-15', 'active', 90),
(gen_random_uuid(), 'w-008', 'Vikram Joshi', 'Vikram Joshi', 'vikram.joshi@researcherp.org', 'worker', 'Data Science', 'Research Engineer', '+91 98100 11008', 'vikram-joshi-de', ARRAY['Python', 'Spark', 'SQL', 'Data Engineering'], '2021-06-01', 'inactive', 74),
(gen_random_uuid(), 'w-009', 'Meera Iyer', 'Meera Iyer', 'meera.iyer@researcherp.org', 'worker', 'Bioinformatics', 'Research Scholar', '+91 98100 11009', 'meera-iyer-bio', ARRAY['Python', 'R', 'Bioconductor', 'Proteomics'], '2023-04-01', 'active', 87),
(gen_random_uuid(), 'w-010', 'Suresh Babu', 'Suresh Babu', 'suresh.babu@researcherp.org', 'worker', 'Robotics', 'Research Scholar', '+91 98100 11010', 'suresh-babu-rob', ARRAY['C++', 'Python', 'Embedded Systems', 'IoT'], '2022-09-01', 'active', 81)
ON CONFLICT (email) DO UPDATE SET
  erp_id = EXCLUDED.erp_id,
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  designation = EXCLUDED.designation,
  phone = EXCLUDED.phone,
  github_username = EXCLUDED.github_username,
  skills = EXCLUDED.skills,
  status = EXCLUDED.status,
  performance = EXCLUDED.performance;

-- B. SEED PROJECTS
INSERT INTO public.projects (id, name, description, description_long, category, manager_id, team, status, priority, progress, start_date, end_date, github_repo, total_tasks, completed_tasks)
VALUES
('p-001', 'AI Based Medical Image Analysis', 'Developing deep learning models to analyze medical images including X-rays, MRI scans, and CT scans for automated disease detection and classification.', 'This project focuses on building convolutional neural network architectures for medical image analysis. The primary goal is to create a robust pipeline for preprocessing, augmenting, training, and evaluating models on publicly available medical imaging datasets.', 'Artificial Intelligence', 'w-001', ARRAY['w-001', 'w-005', 'w-006'], 'active', 'high', 65, '2024-01-15', '2024-12-31', 'research-org/medical-image-ai', 8, 5),
('p-002', 'NLP Based Sentiment Analysis for Social Media', 'Building transformer-based models to analyze sentiment and opinion in social media posts with multilingual support.', 'Sentiment analysis using advanced transformers to accurately evaluate opinion polarity across multiple dialects and languages.', 'Natural Language Processing', 'w-007', ARRAY['w-002', 'w-005', 'w-007'], 'active', 'medium', 45, '2024-03-01', '2024-11-30', 'research-org/nlp-sentiment', 6, 2),
('p-003', 'Real-Time Object Detection System', 'Implementing YOLO-based object detection system for real-time video analysis in surveillance and autonomous driving scenarios.', 'Optimized YOLOv8 system running on edge hardware with high FPS.', 'Computer Vision', 'w-006', ARRAY['w-001', 'w-006'], 'active', 'high', 72, '2023-09-01', '2024-08-31', 'research-org/realtime-object-detection', 7, 5),
('p-004', 'Big Data Analytics Pipeline', 'Designing and implementing a scalable big data pipeline using Apache Spark for processing and analyzing large research datasets.', 'Scalable distributed ETL workflows on large biological and sensor datasets.', 'Data Engineering', 'w-002', ARRAY['w-002', 'w-008'], 'on_hold', 'medium', 30, '2024-04-01', '2025-03-31', 'research-org/bigdata-pipeline', 5, 1),
('p-005', 'Genomic Data Analysis for Disease Prediction', 'Analyzing genomic sequences using machine learning to identify genetic markers associated with common diseases.', 'Identification of risk markers and disease susceptibility using deep learning.', 'Bioinformatics', 'w-003', ARRAY['w-003', 'w-009'], 'active', 'high', 55, '2024-02-01', '2024-12-31', 'research-org/genomics-disease-prediction', 6, 3),
('p-006', 'Autonomous Navigation Robot', 'Building an autonomous robot capable of navigating complex environments using LiDAR, computer vision, and reinforcement learning.', 'ROS2 and LiDAR based simultaneous localization and mapping (SLAM).', 'Robotics', 'w-004', ARRAY['w-004', 'w-010'], 'planning', 'low', 15, '2024-07-01', '2025-06-30', 'research-org/autonomous-robot', 4, 0),
('p-007', 'Multi-Agent Reinforcement Learning Framework', 'Developing a framework for training multiple agents to cooperate and compete in complex simulated environments.', 'Cooperative learning protocols and MARL environment benchmarks.', 'Artificial Intelligence', 'w-007', ARRAY['w-007', 'w-010'], 'active', 'medium', 40, '2024-05-01', '2025-04-30', 'research-org/marl-framework', 5, 2),
('p-008', 'Drug Discovery using Molecular ML', 'Applying graph neural networks and molecular fingerprinting to predict drug-target interactions for accelerated drug discovery.', 'Target interaction graph models for fast candidate screening.', 'Bioinformatics', 'w-009', ARRAY['w-009', 'w-003'], 'completed', 'high', 100, '2023-03-01', '2024-02-28', 'research-org/drug-discovery-ml', 7, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  description_long = EXCLUDED.description_long,
  category = EXCLUDED.category,
  manager_id = EXCLUDED.manager_id,
  team = EXCLUDED.team,
  progress = EXCLUDED.progress,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  github_repo = EXCLUDED.github_repo,
  total_tasks = EXCLUDED.total_tasks,
  completed_tasks = EXCLUDED.completed_tasks,
  updated_at = NOW();

-- C. SEED TASKS
INSERT INTO public.tasks (id, title, description, project_id, assigned_to, priority, status, progress, start_date, due_date, github_repo, github_branch, expected_output, submitted_at, comments, execution_id)
VALUES
('t-001', 'Medical Image Dataset Preprocessing', 'Clean, normalize, and augment the medical imaging dataset. Remove corrupted images, standardize dimensions to 224x224, apply CLAHE.', 'p-001', 'w-001', 'high', 'completed', 100, '2024-01-15', '2024-02-15', 'research-org/medical-image-ai', 'feature/data-preprocessing', 'Preprocessed dataset with 10,000+ images, data pipeline script', '2024-02-12T10:30:00Z', ARRAY['Great work on the augmentation pipeline!'], 'ex-001'),
('t-002', 'CNN Model Architecture Design', 'Design and implement the CNN architecture using ResNet-50 as backbone. Implement transfer learning with ImageNet weights.', 'p-001', 'w-001', 'high', 'completed', 100, '2024-02-16', '2024-03-31', 'research-org/medical-image-ai', 'feature/model-architecture', 'Model architecture code, training script', '2024-03-28T14:00:00Z', ARRAY[]::TEXT[], 'ex-002'),
('t-003', 'Model Training and Hyperparameter Tuning', 'Train the CNN model on the preprocessed dataset. Use Optuna for hyperparameter optimization. Track experiments using MLflow.', 'p-001', 'w-005', 'high', 'in_progress', 60, '2024-04-01', '2024-09-30', 'research-org/medical-image-ai', 'feature/model-training', 'Trained model with >90% accuracy, training logs', NULL, ARRAY['Need more GPU compute time.'], NULL),
('t-004', 'Model Evaluation and Benchmarking', 'Evaluate trained model on test set. Compute precision, recall, F1, AUC-ROC. Compare against baseline models.', 'p-001', 'w-006', 'medium', 'not_started', 0, '2024-10-01', '2024-11-30', 'research-org/medical-image-ai', 'feature/model-evaluation', 'Evaluation report, benchmark comparison', NULL, ARRAY[]::TEXT[], NULL),
('t-005', 'Social Media Data Collection and Cleaning', 'Collect social media posts using Twitter API. Clean and preprocess text data. Handle multilingual content.', 'p-002', 'w-002', 'high', 'completed', 100, '2024-03-01', '2024-04-15', 'research-org/nlp-sentiment', 'feature/data-collection', 'Clean dataset with 100K+ labeled posts', '2024-04-13T09:15:00Z', ARRAY[]::TEXT[], 'ex-003'),
('t-006', 'BERT Fine-tuning for Sentiment Classification', 'Fine-tune multilingual BERT model for sentiment classification. Implement training pipeline with gradient accumulation.', 'p-002', 'w-007', 'high', 'in_progress', 45, '2024-04-16', '2024-09-30', 'research-org/nlp-sentiment', 'feature/bert-finetuning', 'Fine-tuned model with >85% accuracy', NULL, ARRAY['Need to address class imbalance.'], NULL),
('t-007', 'API Development for Sentiment Service', 'Wrap the trained model in a FastAPI service for real-time inference. Implement caching and rate limiting.', 'p-002', 'w-005', 'medium', 'not_started', 0, '2024-10-01', '2024-11-15', 'research-org/nlp-sentiment', 'feature/api', 'REST API with documentation', NULL, ARRAY[]::TEXT[], NULL),
('t-008', 'YOLOv8 Setup and Configuration', 'Set up YOLOv8 environment. Configure model for custom dataset training. Implement data loading pipeline.', 'p-003', 'w-006', 'high', 'completed', 100, '2023-09-01', '2023-10-15', 'research-org/realtime-object-detection', 'feature/yolo-setup', 'Working YOLOv8 training pipeline', '2023-10-10T11:00:00Z', ARRAY[]::TEXT[], 'ex-004'),
('t-009', 'Custom Dataset Annotation and Training', 'Annotate 5000+ images using LabelImg. Train YOLOv8 model on annotated dataset. Achieve real-time inference at 30+ FPS.', 'p-003', 'w-006', 'high', 'completed', 100, '2023-10-16', '2024-02-29', 'research-org/realtime-object-detection', 'feature/training', 'Trained model with mAP > 0.85', '2024-02-25T16:20:00Z', ARRAY[]::TEXT[], 'ex-005'),
('t-010', 'Real-Time Video Processing Module', 'Implement real-time video processing using OpenCV. Optimize for deployment on edge devices.', 'p-003', 'w-001', 'medium', 'in_progress', 70, '2024-03-01', '2024-10-31', 'research-org/realtime-object-detection', 'feature/video-processing', 'Video processing pipeline with 30+ FPS', NULL, ARRAY[]::TEXT[], NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  assigned_to = EXCLUDED.assigned_to,
  priority = EXCLUDED.priority,
  progress = EXCLUDED.progress,
  status = EXCLUDED.status,
  updated_at = NOW();

-- D. SEED EXECUTIONS
INSERT INTO public.executions (id, submission_id, student_id, project_id, task_id, commit_hash, commit_message, execution_time, start_time, end_time, status, tests_passed, tests_failed, total_tests, console_output, error_output, final_result)
VALUES
('ex-001', 'SUB-2024-001', 'w-001', 'p-001', 't-001', 'a3f9c1d', 'Add CLAHE contrast enhancement to preprocessing pipeline', '3m 42s', '2024-02-12T10:30:00Z', '2024-02-12T10:33:42Z', 'passed', 8, 0, 8, 'Loading dataset from /data/medical_images...\nDataset loaded: 10,234 images\nRunning preprocessing pipeline...\n  ✓ Image resizing: 10,234/10,234\n  ✓ CLAHE enhancement: 10,234/10,234\n  ✓ Normalization: 10,234/10,234\n  ✓ Train/Val/Test split: 8187/1024/1023\nPipeline complete. Output saved to /output/preprocessed_data/', '', 'PASS'),
('ex-002', 'SUB-2024-002', 'w-001', 'p-001', 't-002', 'b2e8d4f', 'Implement ResNet-50 with transfer learning', '12m 15s', '2024-03-28T14:00:00Z', '2024-03-28T14:12:15Z', 'passed', 6, 0, 6, 'Loading practical ResNet-50 weights...\nWeights loaded from ImageNet checkpoint\nBuilding custom classification head...\nModel compiled successfully.\nAll test cases passed.', '', 'PASS'),
('ex-003', 'SUB-2024-003', 'w-002', 'p-002', 't-005', 'c7a1e9b', 'Complete data cleaning script', '5m 10s', '2024-04-13T09:15:00Z', '2024-04-13T09:20:10Z', 'passed', 5, 0, 5, 'Cleaned 100K+ tweets. Exported dataset to parquet.', '', 'PASS')
ON CONFLICT (id) DO NOTHING;

-- E. SEED GITHUB COMMITS
INSERT INTO public.github_commits (id, repo, branch, sha, message, author_id, author_name, timestamp, status, task_id, additions, deletions, changed_files)
VALUES
('gh-001', 'research-org/medical-image-ai', 'feature/data-preprocessing', 'a3f9c1d', 'Add CLAHE contrast enhancement to preprocessing pipeline', 'w-001', 'Priya Sharma', '2024-09-03T14:23:00Z', 'passed', 't-001', 124, 18, 3),
('gh-002', 'research-org/medical-image-ai', 'feature/model-training', 'b2e8d4f', 'Implement learning rate warmup scheduler', 'w-005', 'Ananya Singh', '2024-09-02T10:45:00Z', 'passed', 't-003', 67, 12, 2),
('gh-003', 'research-org/nlp-sentiment', 'feature/bert-finetuning', 'c7a1e9b', 'Add weighted loss for class imbalance handling', 'w-007', 'Divya Krishnan', '2024-09-01T16:30:00Z', 'failed', 't-006', 45, 8, 1),
('gh-004', 'research-org/realtime-object-detection', 'feature/video-processing', 'd4b2f7a', 'Optimize inference pipeline with TensorRT', 'w-001', 'Priya Sharma', '2024-08-31T09:15:00Z', 'passed', 't-010', 198, 43, 4)
ON CONFLICT (id) DO NOTHING;

-- F. SEED MEETINGS
INSERT INTO public.meetings (id, title, project_id, date, time, duration, participants, meeting_link, status, agenda, notes, created_by)
VALUES
('m-001', 'Medical Image AI - Weekly Progress Review', 'p-001', '2024-09-10', '10:00', '60', ARRAY['admin-001', 'w-001', 'w-005', 'w-006'], 'https://meet.google.com/abc-defg-hij', 'upcoming', 'Review model training progress, discuss hyperparameter tuning results.', '', 'admin-001'),
('m-002', 'NLP Sentiment Analysis - Sprint Planning', 'p-002', '2024-09-12', '14:00', '45', ARRAY['admin-001', 'w-002', 'w-007', 'w-005'], 'https://meet.google.com/xyz-uvwx-yz1', 'upcoming', 'Plan next sprint, assign tasks for API development phase.', '', 'admin-001'),
('m-003', 'Genomics Project Milestone Review', 'p-005', '2024-09-15', '11:00', '90', ARRAY['admin-001', 'w-003', 'w-009'], 'https://meet.google.com/pqr-stuv-wx2', 'upcoming', 'Q3 milestone review, feature engineering results.', '', 'admin-001'),
('m-004', 'Object Detection - Technical Review', 'p-003', '2024-08-28', '15:00', '60', ARRAY['admin-001', 'w-001', 'w-006'], 'https://meet.google.com/lmn-opqr-st3', 'completed', 'Review YOLOv8 training results.', 'Training results excellent (mAP=0.873). Video processing module approved.', 'admin-001')
ON CONFLICT (id) DO NOTHING;

-- G. SEED DOCUMENTS
INSERT INTO public.documents (id, name, category, project_id, uploaded_by, version, date, size, type, tags, file_url)
VALUES
('d-001', 'Medical Image AI - Project Proposal', 'Project Documents', 'p-001', 'admin-001', '1.2', '2024-01-10', '2.4 MB', 'pdf', ARRAY['proposal', 'medical imaging', 'AI'], NULL),
('d-002', 'Preprocessing Pipeline Documentation', 'Task Documents', 'p-001', 'w-001', '2.0', '2024-02-20', '1.1 MB', 'pdf', ARRAY['preprocessing', 'documentation', 'pipeline'], NULL),
('d-003', 'Literature Review - Medical Image Analysis', 'Research Papers', 'p-001', 'w-001', '1.0', '2024-01-25', '3.8 MB', 'pdf', ARRAY['literature review', 'medical imaging', 'CNN'], NULL),
('d-004', 'NLP Sentiment Analysis - Research Plan', 'Project Documents', 'p-002', 'admin-001', '1.0', '2024-02-20', '1.7 MB', 'pdf', ARRAY['NLP', 'sentiment', 'research plan'], NULL),
('d-005', 'BERT Fine-tuning Technical Guide', 'Task Documents', 'p-002', 'w-007', '1.3', '2024-05-10', '0.8 MB', 'docx', ARRAY['BERT', 'fine-tuning', 'guide'], NULL),
('d-006', 'Q3 Progress Report - All Projects', 'Reports', NULL, 'admin-001', '1.0', '2024-09-01', '5.2 MB', 'pdf', ARRAY['quarterly report', 'progress', 'Q3'], NULL)
ON CONFLICT (id) DO NOTHING;

-- H. SEED NOTIFICATIONS
INSERT INTO public.notifications (id, type, title, message, user_id, read, timestamp, link, icon)
VALUES
('n-001', 'task_assigned', 'New Task Assigned', 'You have been assigned "Model Training and Hyperparameter Tuning" for project AI Based Medical Image Analysis.', 'w-005', FALSE, '2024-09-03T14:00:00Z', '/worker/tasks/t-003', 'clipboard'),
('n-002', 'deadline_approaching', 'Task Deadline Approaching', 'Task "Model Training and Hyperparameter Tuning" is due in 3 days. Please submit your work.', 'w-001', FALSE, '2024-09-03T09:00:00Z', '/worker/tasks/t-003', 'clock'),
('n-003', 'commit_detected', 'GitHub Commit Detected', 'New commit detected in feature/bert-finetuning: "Add weighted loss for class imbalance handling" by Divya Krishnan.', 'admin-001', FALSE, '2024-09-01T16:30:00Z', '/admin/github', 'github'),
('n-004', 'execution_failed', 'Code Execution Failed', 'Code execution for task "BERT Fine-tuning for Sentiment Classification" failed with ImportError.', 'admin-001', FALSE, '2024-09-01T16:35:00Z', '/admin/executions/ex-010', 'x-circle'),
('n-005', 'execution_failed', 'Code Execution Failed', 'Your submission for "BERT Fine-tuning" failed. Check the error output for details.', 'w-007', FALSE, '2024-09-01T16:35:00Z', '/worker/executions/ex-010', 'x-circle')
ON CONFLICT (id) DO NOTHING;

-- I. SEED ATTENDANCE RECORDS (Admin Only)
DO $$
DECLARE
  v_admin_id UUID;
  v_p1 UUID; v_p2 UUID; v_p3 UUID; v_p4 UUID; v_p5 UUID;
  v_p6 UUID; v_p7 UUID; v_p8 UUID; v_p9 UUID; v_p10 UUID;
  v_today DATE := CURRENT_DATE;
  v_yest DATE := CURRENT_DATE - INTERVAL '1 day';
  v_prev DATE := CURRENT_DATE - INTERVAL '2 days';
BEGIN
  SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

  SELECT id INTO v_p1 FROM public.profiles WHERE email = 'priya.sharma@researcherp.org';
  SELECT id INTO v_p2 FROM public.profiles WHERE email = 'arjun.mehta@researcherp.org';
  SELECT id INTO v_p3 FROM public.profiles WHERE email = 'sneha.reddy@researcherp.org';
  SELECT id INTO v_p4 FROM public.profiles WHERE email = 'karan.patel@researcherp.org';
  SELECT id INTO v_p5 FROM public.profiles WHERE email = 'ananya.singh@researcherp.org';
  SELECT id INTO v_p6 FROM public.profiles WHERE email = 'rahul.nair@researcherp.org';
  SELECT id INTO v_p7 FROM public.profiles WHERE email = 'divya.krishnan@researcherp.org';
  SELECT id INTO v_p8 FROM public.profiles WHERE email = 'vikram.joshi@researcherp.org';
  SELECT id INTO v_p9 FROM public.profiles WHERE email = 'meera.iyer@researcherp.org';
  SELECT id INTO v_p10 FROM public.profiles WHERE email = 'suresh.babu@researcherp.org';

  IF v_admin_id IS NOT NULL THEN
    -- Today's Attendance
    IF v_p1 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p1, v_today, 'present', NOW() - INTERVAL '4 hours', NULL, 'On time - Medical AI project', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p2 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p2, v_today, 'present', NOW() - INTERVAL '3 hours 45 mins', NULL, 'Spark pipeline research', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p3 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p3, v_today, 'present', NOW() - INTERVAL '2 hours', NULL, 'Transit delay resolved - In lab', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p4 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p4, v_today, 'absent', NULL, NULL, 'Unplanned absence', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p5 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p5, v_today, 'present', NOW() - INTERVAL '4 hours 10 mins', NULL, 'Model training lab', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p6 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p6, v_today, 'absent', NULL, NULL, 'Approved medical absence', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p7 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p7, v_today, 'present', NOW() - INTERVAL '3 hours 30 mins', NULL, 'NLP BERT evaluation', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p9 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p9, v_today, 'present', NOW() - INTERVAL '4 hours', NULL, 'Bioinformatics lab', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p10 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p10, v_today, 'present', NOW() - INTERVAL '1 hour 45 mins', NULL, 'Hardware lab setup', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;

    -- Yesterday's Attendance
    IF v_p1 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p1, v_yest, 'present', v_yest + TIME '09:02:00', v_yest + TIME '17:30:00', 'Full day present', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p2 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p2, v_yest, 'present', v_yest + TIME '08:58:00', v_yest + TIME '17:15:00', 'Full day present', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p3 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p3, v_yest, 'present', v_yest + TIME '09:15:00', v_yest + TIME '17:45:00', 'Full day present', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p4 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p4, v_yest, 'present', v_yest + TIME '09:10:00', v_yest + TIME '17:00:00', 'Full day present', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;
    IF v_p5 IS NOT NULL THEN INSERT INTO public.attendance_records (candidate_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by) VALUES (v_p5, v_yest, 'present', v_yest + TIME '09:30:00', v_yest + TIME '18:00:00', 'Full day present', v_admin_id) ON CONFLICT (candidate_id, attendance_date) DO NOTHING; END IF;

    -- Audit Log entry
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (v_admin_id, 'INITIAL_SEED', 'attendance_records', 'bulk', '{"message": "Initial attendance records seeded successfully"}'::jsonb);
  END IF;
END $$;
