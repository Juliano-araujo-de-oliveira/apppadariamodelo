import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rezwukolnsnzjqmbescn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlend1a29sbnNuempxbWJlc2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDk5ODUsImV4cCI6MjA4NTgyNTk4NX0.84o2Yay0D7FBuvIWk4kV_HFw2Ek0lmK_YGk-48Vi4WU';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
