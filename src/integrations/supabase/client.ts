
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ktrbaiijlhssaxpxpzhj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cmJhaWlqbGhzc2F4cHhwemhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjE2MDksImV4cCI6MjA1NjIzNzYwOX0.k2MVB81LUxuAc2PMJOgO8U4yk_lLbNzTkCbqErd0nqE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
