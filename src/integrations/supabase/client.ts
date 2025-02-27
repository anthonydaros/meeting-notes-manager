
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ktrbaiijlhssaxpxpzhj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cmJhaWlqbGhzc2F4cHhwemhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjE2MDksImV4cCI6MjA1NjIzNzYwOX0.k2MVB81LUxuAc2PMJOgO8U4yk_lLbNzTkCbqErd0nqE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
