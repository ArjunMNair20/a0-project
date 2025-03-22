import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlaeetuyksxjjocrzwcf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYWVldHV5a3N4ampvY3J6d2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzkxMjUsImV4cCI6MjA1NjU1NTEyNX0.E-8V178dX4eR1PDfhUK3YGHnBiTi_Jg5y_R_q6krWPo';

const options = {
  auth: {
    persistSession: false,
    detectSessionInUrl: false
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);