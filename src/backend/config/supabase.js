import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("[Supabase Backend] FATAL: SUPABASE_URL environment variable is not set.");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("[Supabase Backend] FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.");
  console.error("[Supabase Backend] Get it from: Supabase Dashboard → Project Settings → API → service_role secret");
  process.exit(1);
}

// Backend uses service_role key to bypass RLS and perform admin operations.
// This key MUST never be exposed to the frontend.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
