import { createClient } from '@supabase/supabase-js';
import { logSupabaseConfig } from './debugLogger';

// Accessing environment variables using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation
const isConfigValid = !!supabaseUrl && !!supabaseAnonKey;

// Log configuration status immediately
try {
  logSupabaseConfig(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('Error logging Supabase config:', e);
}

if (!isConfigValid) {
  console.error('❌ CRITICAL: Supabase configuration missing. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Custom fetch with timeout to prevent hanging requests
const customFetch = (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000); // 10s timeout

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
};

// Create client only if variables exist
export const supabase = isConfigValid
  ? createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        },
        global: {
          fetch: customFetch
        }
      }
    )
  : null;

if (supabase) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.error('❌ Supabase client failed to initialize');
}

// Helper to execute operations with retry logic
export const executeWithRetry = async (operation, retries = 3, initialDelay = 1000) => {
  if (!supabase) throw new Error("Supabase client not initialized due to missing environment variables.");

  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt > retries) throw error;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.warn(`Retry attempt ${attempt}/${retries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Helper to check connection status
export const checkSupabaseConnection = async () => {
  if (!supabase) return { connected: false, error: "Missing environment variables", latency: 0 };

  const startTime = performance.now();
  try {
    const { error, status } = await supabase.from('products').select('count', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - startTime);
    
    if (error) {
      console.error('Connection check failed:', error);
      return { connected: false, error: error.message, latency };
    }
    console.log('✅ Connection check successful', { latency, status });
    return { connected: true, latency, status };
  } catch (err) {
    console.error('Connection check exception:', err);
    return { connected: false, error: err.message, latency: 0 };
  }
};