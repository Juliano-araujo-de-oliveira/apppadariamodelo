import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'; // Importamos a ArrowLeft
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* BOTÃO VOLTAR */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-6 font-semibold uppercase text-sm"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
              Meu Carrinho
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-xl mb-6">Seu carrinho está vazio</p>
              <Button
                onClick={() => navigate('/menu')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-xl"
              >
                VER CARDÁPIO
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-red-600 overflow-hidden shadow-sm">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_item_id || item.id}
                    className="flex items-center justify-between p-4 border-b border-red-50 last:border-0 gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold leading-tight">{item.name}</h3>
                        <p className="text-[#DAA520] font-bold">
                          R$ {Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Se for encomenda, podemos esconder os botões de +/- para não quebrar o cálculo */}
                      {!item.is_encomenda && (
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}

                      {/* Se for encomenda, mostramos apenas a quantidade fixa selecionada */}
                      {item.is_encomenda && (
                        <span className="text-gray-500 text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">
                          Unidades: {item.quantity}
                        </span>
                      )}

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-600 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold uppercase tracking-wider">Total do Pedido</span>
                  <span className="text-4xl font-black text-[#DAA520]">
                    R$ {getCartTotal().toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={() => navigate('/payment')}
                  className="w-full bg-green-600 hover:bg-green-700 py-8 text-2xl font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  FINALIZAR PEDIDO
                  <ArrowLeft className="rotate-180" /> {/* Seta para a direita no botão */}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;