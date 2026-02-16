import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { logAuthAttempt, logDebug } from '@/lib/debugLogger';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    if (generalError) setGeneralError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email é obrigatório";
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    logDebug('Login Page: Form submitted', { email: formData.email });

    if (!validate()) {
      logDebug('Login Page: Validation failed');
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        logDebug('Login Page: Redirecting to /menu');
        navigate('/menu');
      } else {
        logDebug('Login Page: Login failed', result.error);
        setGeneralError(result.error || 'Falha no login. Tente novamente.');
        if (result.fullError) console.error('Full Auth Error:', result.fullError);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setGeneralError('Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Padaria Teste</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#121212] to-[#1e1e1e]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B6F47] rounded-full mb-4 shadow-lg shadow-[#8B6F47]/20">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
            </div>

            {generalError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-100">{generalError}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl text-white`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl text-white`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8B6F47] hover:bg-[#6d5638] text-white font-semibold py-4 rounded-xl shadow-lg"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400">
                Não tem uma conta? <Link to="/signup" className="text-[#D4AF37] hover:underline">Cadastre-se</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Toaster />
    </>
  );
};

export default LoginPage;