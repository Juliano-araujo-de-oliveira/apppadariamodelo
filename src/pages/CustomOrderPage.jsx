import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, Loader2, ShoppingBag, ChevronUp, ChevronDown, AlertCircle, ImageIcon, Clock } from 'lucide-react'; // Adicionado Clock
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

const CustomOrderPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [observations, setObservations] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(''); // NOVO ESTADO PARA HORA
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'encomenda');

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleStepQuantity = (productId, delta) => {
    setSelectedQuantities(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newSelected = { ...prev };
      if (newQty === 0) delete newSelected[productId];
      else newSelected[productId] = newQty;
      return newSelected;
    });
  };

  const getItemPrice = (product, quantity) => {
    const basePrice = Number(product.price);
    return (basePrice / 100) * quantity;
  };

  const calculateTotal = () => {
    return Object.entries(selectedQuantities).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + getItemPrice(product, quantity);
    }, 0);
  };

  const getMinDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedQuantities).length === 0) {
      toast({ title: 'Atenção', description: 'Selecione a quantidade de itens.', variant: 'destructive' });
      return;
    }
    if (!deliveryDate || !deliveryTime) { // VALIDAÇÃO DE DATA E HORA
      toast({ title: 'Atenção', description: 'Selecione a data e o horário para a entrega.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      for (const [productId, quantity] of Object.entries(selectedQuantities)) {
        const product = products.find(p => p.id === productId);

        if (product) {
          const calculatedPrice = getItemPrice(product, quantity);

          await addToCart({
            ...product,
            id: product.id,
            name: `${product.name} (${quantity} unid)`,
            price: calculatedPrice,
            quantity: 1,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime, // ENVIA O HORÁRIO PARA O CARRINHO
            observations,
            is_encomenda: true,
            order_quantity: quantity
          });
        }
      }

      toast({ title: 'Sucesso!', className: 'bg-green-600 text-white' });
      setTimeout(() => navigate('/cart'), 1000);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Erro ao adicionar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Package className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-[18px] font-bold text-gray-900 uppercase italic leading-tight">
              Encomendas de Salgadinhos para Todas as Ocasiões
            </h1>
          </div>

          {productsLoading ? (
            <div className="text-center text-gray-600"><Loader2 className="animate-spin mx-auto" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Listagem de Produtos (Mantida igual) */}
              <div className="bg-white rounded-2xl p-6 border border-red-600 shadow-sm">
                <div className="grid gap-4">
                  {products.map((product) => {
                    const qty = selectedQuantities[product.id] || 0;
                    return (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-red-100 gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-20 h-20 shrink-0 bg-white rounded-lg border border-red-100 overflow-hidden flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="text-gray-300 w-8 h-8" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-900 font-bold leading-tight">{product.name}</h3>
                            <p className="text-[#DAA520] text-sm font-semibold">Cento: R$ {Number(product.price).toFixed(2)}</p>
                            {qty > 0 && <p className="text-green-600 text-[16px] font-bold">Subtotal: R$ {getItemPrice(product, qty).toFixed(2)}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-center bg-white border border-red-200 p-2 rounded-lg shrink-0 min-w-[60px]">
                          <button type="button" onClick={() => handleStepQuantity(product.id, 50)} className="text-red-600 hover:scale-110"><ChevronUp /></button>
                          <span className="text-gray-900 font-bold text-lg px-2">{qty}</span>
                          <button type="button" onClick={() => handleStepQuantity(product.id, -50)} className="text-gray-400 hover:text-red-500"><ChevronDown /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO DE DATA E HORÁRIO (ATUALIZADA) */}
              <div className="bg-white p-6 rounded-2xl border border-red-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DATA */}
                  <div>
                    <label className="text-gray-900 font-bold text-lg flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-red-600" /> Data de Entrega
                    </label>
                    <input
                      type="date"
                      min={getMinDeliveryDate()}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-gray-50 border border-red-100 rounded-xl p-4 text-gray-900 font-bold outline-none focus:border-red-600 cursor-pointer"
                    />
                  </div>

                  {/* HORÁRIO */}
                  <div>
                    <label className="text-gray-900 font-bold text-lg flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-red-600" /> Horário Desejado
                    </label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full bg-gray-50 border border-red-100 rounded-xl p-4 text-gray-900 font-bold outline-none focus:border-red-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-amber-600 text-sm mt-4">
                  <AlertCircle size={14} />
                  <span>Pedido mínimo com 2 dias de antecedência. Verifique nosso horário de funcionamento.</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-red-600">
                <label className="block text-gray-700 font-bold mb-2 uppercase text-sm">Observações do Pedido</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Alguma preferência de fritura ou embalagem?"
                  className="w-full bg-gray-50 border border-red-100 rounded-lg p-3 text-gray-900 h-[80px] resize-none outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div className="bg-red-600 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6 text-white font-bold">
                  <span className="text-lg uppercase">Subtotal da Encomenda:</span>
                  <span className="text-4xl text-[#DAA520]">R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 py-8 text-2xl font-black rounded-xl transition-all shadow-lg text-white"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'CONFIRMAR ENCOMENDA'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

export default CustomOrderPage;