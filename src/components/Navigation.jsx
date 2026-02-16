import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogOut, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  const navigationLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Cardápio' },
    { path: '/custom-order', label: 'Encomendas', protected: true },
    { path: '/cart', label: 'Carrinho', icon: ShoppingCart, badge: getCartItemsCount() },
  ];

  const userLinks = isAuthenticated
    ? [
        { path: '/order-history', label: 'Meus Pedidos', icon: History },
        { path: '/profile', label: 'Perfil', icon: User },
      ]
    : [];

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#e80032] backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍞</span>
            <span className="text-xl font-black text-white uppercase italic">Padaria Modelo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-bold transition-colors ${
                    isActivePath(link.path)
                      ? 'text-white'
                      : 'text-red-100 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                    {link.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-red-600">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  {isActivePath(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l border-white/20 pl-6">
                <span className="text-sm font-medium text-white">
                  Olá, {currentUser?.name?.split(' ')[0]}!
                </span>
                <button
                  onClick={logout}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-white text-red-600 rounded-full font-black hover:bg-red-50 transition-all shadow-md uppercase text-xs"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - AQUI ESTÁ A CORREÇÃO QUE VOCÊ PEDIU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-red-100 bg-[#FFF5F5] shadow-2xl" // Fundo vermelho bem clarinho
          >
            <div className="px-4 py-6 space-y-3">
              {navigationLinks.map((link) => {
                if (link.protected && !isAuthenticated) return null;
                
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-black transition-all ${
                      isActivePath(link.path)
                        ? 'bg-red-600 text-white shadow-md' // Item ativo em vermelho forte
                        : 'text-red-600 hover:bg-red-100/50' // Letras em vermelho forte
                    }`}
                  >
                    {Icon && <Icon className="w-6 h-6" />}
                    <span className="uppercase italic">{link.label}</span>
                    {link.badge > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full px-3 py-1">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <div className="pt-4 space-y-3">
                  <div className="px-4 py-2 mb-2 bg-red-100/30 rounded-lg">
                    <p className="text-sm font-bold text-red-800">
                      Olá, {currentUser?.name}! 👋
                    </p>
                  </div>
                  {userLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-black text-red-600 hover:bg-red-100/50 transition-colors uppercase italic"
                      >
                        <Icon className="w-6 h-6" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-black text-red-800 hover:bg-red-200/50 transition-colors uppercase italic border-t border-red-200 mt-2"
                  >
                    <LogOut className="w-6 h-6" />
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <div className="pt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-4 bg-red-600 text-white rounded-2xl text-center font-black text-lg shadow-lg hover:bg-red-700 transition-all uppercase italic"
                  >
                    Entrar no App
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;