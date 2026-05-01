import { createClient } from '@supabase/supabase-js';

// NOTE: These are public/anon credentials — safe to include in client-side code.
// Using hardcoded values to ensure Vite's static analysis replaces them correctly
// regardless of how environment variables are configured in the host (Vercel).
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)
  || 'https://crmhkvvjrblajemgtrpz.supabase.co';

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
  || 'sb_publishable_Xuq5iGDn_eFzbBtG6Q18ng_hpf4dl6h';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
