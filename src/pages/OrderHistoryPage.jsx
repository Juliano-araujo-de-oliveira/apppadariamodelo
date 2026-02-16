import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Package, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const OrderHistoryPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Não foi possível carregar seu histórico de pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Entregue';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <>
      <Helmet>
        <title>Meus Pedidos - Padaria Teste</title>
      </Helmet>

      <Navigation />

      <div className="min-h-screen pt-24 pb-16 bg-[#121212]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <Package className="w-8 h-8 text-[#DAA520]" /> Histórico de Pedidos
            </h1>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#DAA520] animate-spin mb-4" />
                <p className="text-gray-400">Carregando seus pedidos...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-200">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-400 mb-6">Você ainda não realizou nenhuma compra conosco.</p>
                <Button onClick={() => window.location.href='/menu'} className="bg-[#8B6F47] hover:bg-[#6d5638] text-white">
                  Ver Cardápio
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20"
                  >
                    {/* Order Header */}
                    <div 
                      onClick={() => toggleOrder(order.id)}
                      className="p-6 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <span className="text-white font-mono text-xs opacity-50">#{order.id.slice(0, 8)}</span>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#DAA520] font-bold text-lg">
                            R$ {Number(order.total_amount).toFixed(2)}
                          </span>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="text-gray-400" />
                          ) : (
                            <ChevronDown className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Details (Expanded) */}
                    {expandedOrder === order.id && (
                      <div className="px-6 pb-6 pt-0 border-t border-white/10">
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Itens do Pedido</h4>
                          <div className="space-y-2">
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-white/10 overflow-hidden">
                                     <img src={item.image_url || item.image} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <span className="text-gray-300">
                                    <span className="text-white font-bold">{item.quantity}x</span> {item.name}
                                  </span>
                                </div>
                                <span className="text-gray-400">
                                  R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {order.observations && (
                            <div className="mt-4 p-3 bg-black/20 rounded-lg text-sm text-gray-400">
                              <span className="font-bold text-gray-300">Obs:</span> {order.observations}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OrderHistoryPage;