/**
 * Utility for safe debug logging of Supabase and Auth operations.
 */

export const logSupabaseConfig = (url, key) => {
  const timestamp = new Date().toISOString();
  // Safe logging - never log full keys in production
  const maskedUrl = url ? `${url.substring(0, 20)}...` : 'undefined';
  const maskedKey = key ? `${key.substring(0, 10)}...` : 'undefined';
  
  console.group(`🔌 Supabase Configuration Check [${timestamp}]`);
  console.log(`URL: ${maskedUrl}`);
  console.log(`Anon Key Present: ${!!key}`);
  console.log(`Anon Key Preview: ${maskedKey}`);
  
  if (!url) console.error('❌ CRITICAL: Supabase URL is missing');
  if (!key) console.error('❌ CRITICAL: Supabase Anon Key is missing');
  
  console.groupEnd();
};

export const logAuthAttempt = (action, email, details = {}) => {
  const timestamp = new Date().toISOString();
  console.group(`🔐 Auth Attempt: ${action} [${timestamp}]`);
  console.log(`Email: ${email}`);
  if (Object.keys(details).length > 0) {
    console.log('Details:', details);
  }
  console.groupEnd();
};

export const logAuthResponse = (action, success, error = null, data = null) => {
  const timestamp = new Date().toISOString();
  const statusIcon = success ? '✅' : '❌';
  
  console.group(`${statusIcon} Auth Response: ${action} [${timestamp}]`);
  console.log(`Success: ${success}`);
  
  if (success && data) {
    console.log('Result Data:', data);
  }
  
  if (!success && error) {
    console.error('Error Details:', error);
    if (error.message) console.error('Message:', error.message);
    if (error.code) console.error('Code:', error.code);
  }
  
  console.groupEnd();
};

export const logDebug = (message, data) => {
  console.log(`🐞 DEBUG: ${message}`, data || '');
};