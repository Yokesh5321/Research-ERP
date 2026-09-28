import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nsunkgfvlgxvdjxfioth.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GB4BqS3Qgk6VglbrIB5QXw_DbESoRVG';

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    '[Supabase] Warning: VITE_SUPABASE_ANON_KEY is not set in .env. Please update your .env with your real Supabase Anon Key.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;
