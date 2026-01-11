import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vljdthpanckrahdmddqc.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsamR0aHBhbmNrcmFoZG1kZHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMDgwODYsImV4cCI6MjA4MzY4NDA4Nn0.K4-zPKzNUL7HJkgPSfk2umVeJWD3PYW9p-w9t5K8xMk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    flowType: 'implicit',
  },
});
