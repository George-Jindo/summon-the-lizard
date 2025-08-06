import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkakznzlcembgbpwlynk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWt6bnpsY2VtYmdicHdseW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTg4ODQsImV4cCI6MjA3MDA5NDg4NH0.clPxL0ft8dLr8Ab_nX3IIlvYaks2BoE-JpIxGZtzPoY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
