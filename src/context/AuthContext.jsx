import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, executeWithRetry } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { logAuthAttempt, logAuthResponse, logDebug } from '@/lib/debugLogger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    logDebug('Initializing AuthContext', { timestamp: new Date().toISOString() });

    if (!supabase) {
      console.error('Supabase client is not initialized. AuthContext cannot function.');
      toast({
        title: 'Erro de Configuração',
        description: 'Não foi possível conectar ao servidor. Verifique as configurações do sistema.',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user && mounted) {
          logDebug('Session restored', { userId: session.user.id });
          await fetchUserProfile(session.user);
        } else {
          logDebug('No active session found on init');
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      logDebug(`Auth State Change: ${event}`, session?.user ? { userId: session.user.id } : 'No User');

      if (session?.user) {
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'INITIAL_SESSION'].includes(event)) {
             await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user) => {
    if (!supabase) return;
    try {
      // Use maybeSingle() instead of single() to handle cases where the user record doesn't exist yet
      const { data: profile, error } = await executeWithRetry(async () => 
        await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
      );

      if (error) {
        console.error('Error fetching profile:', error);
      }

      // Gracefully handle missing profile data
      const mergedUser = {
        ...user,
        ...(profile || {}), // Spread profile if it exists, otherwise empty object
        name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
      };

      setCurrentUser(mergedUser);
    } catch (err) {
      console.error('Profile fetch exception:', err);
      // Fallback to basic user data if profile fetch fails completely
      setCurrentUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, name, phone }) => {
    if (!supabase) return { success: false, error: 'Erro de configuração do sistema.' };
    logAuthAttempt('SIGNUP', email, { name, phone });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        logAuthResponse('SIGNUP', true, null, { userId: data.user.id });
        
        // Manual profile creation backup
        const profileData = {
          id: data.user.id,
          email: email,
          full_name: name,
          phone: phone,
          created_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase.from('users').upsert(profileData);
        if (profileError) console.error('Profile creation warning:', profileError);

        toast({ title: 'Conta criada!', description: 'Bem-vindo à nossa padaria.' });
        return { success: true };
      }
    } catch (error) {
      logAuthResponse('SIGNUP', false, error);
      
      let message = 'Ocorreu um erro ao criar conta.';
      if (error.message.includes('User already registered')) message = 'Este email já está cadastrado.';
      if (error.message.includes('Password should be')) message = 'A senha não atende aos requisitos.';
      
      return { success: false, error: message, fullError: error };
    }
  };

  const login = async (email, password) => {
    if (!supabase) return { success: false, error: 'Erro de configuração do sistema.' };
    logAuthAttempt('LOGIN', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      logAuthResponse('LOGIN', true, null, { userId: data.user.id });
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      return { success: true };
    } catch (error) {
      logAuthResponse('LOGIN', false, error);
      
      let message = 'Verifique suas credenciais.';
      if (error.message.includes('Invalid login credentials')) message = 'Email ou senha incorretos.';
      
      return { success: false, error: message, fullError: error };
    }
  };

  const logout = async () => {
    if (!supabase) {
      setCurrentUser(null);
      return;
    }
    logAuthAttempt('LOGOUT', currentUser?.email || 'unknown');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      logAuthResponse('LOGOUT', true);
      setCurrentUser(null);
      toast({ title: 'Volte Sempre!', description: 'Até Logo!' });
    } catch (error) {
      logAuthResponse('LOGOUT', false, error);
      setCurrentUser(null); 
    }
  };

  const updateProfile = async (updates) => {
    if (!supabase) return { success: false, error: 'Erro de configuração do sistema.' };
    try {
      if (!currentUser) return;
      
      // Use upsert to handle cases where the user record might be missing
      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: currentUser.id, 
          email: currentUser.email,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCurrentUser(prev => ({ ...prev, ...updates }));
      toast({ title: 'Sucesso', description: 'Perfil atualizado.' });
      return { success: true };
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar perfil.', variant: 'destructive' });
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};