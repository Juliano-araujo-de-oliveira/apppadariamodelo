import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingBag, CheckCircle2, Loader2, Phone } from 'lucide-react'; // Importamos ArrowLeft
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('retirada');

  // Cálculo do total
  const total = getCartTotal();

  const handleFinalizeOrder = async () => {
    setLoading(true);
    try {
      // Simulação de finalização
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Pedido Finalizado!",
        description: "Seu pedido foi enviado com sucesso.",
        className: "bg-green-600 text-white"
      });
      clearCart();
      navigate('/profile'); // Ou uma página de sucesso
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao finalizar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6]">
      <Navigation />

      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* BOTÃO VOLTAR (IGUAL AO DO CARRINHO) */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-6 font-semibold uppercase text-sm"
          >
            <ArrowLeft size={20} />
            Voltar para o Carrinho
          </button>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
              Finalizar Pedido
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-xl border border-gray-800">
                {/* Seleção de Método */}
                <div className="flex bg-black/50 p-1 rounded-xl mb-8">
                  <button
                    onClick={() => setDeliveryMethod('retirada')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${deliveryMethod === 'retirada' ? 'bg-[#DAA520] text-black' : 'text-gray-400'
                      }`}
                  >
                    <ShoppingBag size={20} /> Retirada
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('entrega')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${deliveryMethod === 'entrega' ? 'bg-[#DAA520] text-black' : 'text-gray-400'
                      }`}
                  >
                    <MapPin size={20} /> Entrega
                  </button>
                </div>

                {/* Campos do Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-[#DAA520]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2">WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-[#DAA520]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA DA DIREITA: RESUMO */}
            <div className="lg:col-span-1">
              <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-xl border border-gray-800 sticky top-32">
                <h2 className="text-white font-bold uppercase tracking-wider mb-6 border-b border-gray-800 pb-2">
                  Resumo Financeiro
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-400">
                    <span>Produtos:</span>
                    <span className="text-white font-bold">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taxa de Entrega:</span>
                    <span className="text-green-500 font-bold">Grátis</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                    <span className="text-[#DAA520] text-xl font-black uppercase">Total:</span>
                    <span className="text-[#DAA520] text-2xl font-black">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleFinalizeOrder}
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-black py-8 text-lg rounded-xl shadow-lg transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Confirmar e Finalizar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;