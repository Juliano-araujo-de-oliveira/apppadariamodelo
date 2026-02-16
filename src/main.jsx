import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Validate environment variables before rendering
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!supabaseUrl || !supabaseAnonKey) {
  // Render a helpful error screen if configuration is missing
  root.render(
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 border border-red-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Error</h1>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          The application cannot start because the Supabase environment variables are missing. 
          Please ensure your <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border border-gray-200">.env</code> file is correctly configured.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Missing Variables</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600">VITE_SUPABASE_URL</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${supabaseUrl ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {supabaseUrl ? 'Present' : 'Missing'}
              </span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600">VITE_SUPABASE_ANON_KEY</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${supabaseAnonKey ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {supabaseAnonKey ? 'Present' : 'Missing'}
              </span>
            </li>
          </ul>
        </div>
        
        <div className="text-sm text-gray-500 border-t pt-4">
          <p>
            Refer to <code className="text-gray-700 font-medium">.env.example</code> for the required format.
          </p>
        </div>
      </div>
    </div>
  );
} else {
  root.render(
    <App />
  );
}