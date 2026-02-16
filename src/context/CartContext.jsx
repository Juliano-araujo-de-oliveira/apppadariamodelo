import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. BUSCA DE ITENS (Garante que o ID do produto seja puro)
  const fetchCartFromDatabase = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', userId);

      if (error) throw error;

      return data ? data.map(item => {
        const isEncomenda = item.products.category === 'encomenda';
        const basePrice = Number(item.products.price);
        const finalPrice = isEncomenda ? (basePrice / 100) * item.quantity : basePrice;

        return {
          ...item.products,
          cart_item_id: item.id, // ID real da linha no banco
          displayQuantity: isEncomenda ? 1 : item.quantity,
          quantity: item.quantity,
          id: item.product_id, // ID puro do produto (UUID)
          price: finalPrice,
          is_encomenda: isEncomenda
        };
      }) : [];
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      return [];
    }
  }, []);

  const syncCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUser = session?.user;

      if (activeUser) {
        const items = await fetchCartFromDatabase(activeUser.id);
        setCartItems(items);
        localStorage.removeItem('bakery_cart_guest');
      } else {
        const savedCart = localStorage.getItem('bakery_cart_guest');
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      }
    } catch (err) {
      console.error("Erro na sincronização:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartFromDatabase]);

  useEffect(() => {
    syncCart();
  }, [isAuthenticated, currentUser?.id, syncCart]);

  // 2. ADICIONAR AO CARRINHO (Limpa o ID antes de enviar ao banco)
  const addToCart = async (product, quantity = 1) => {
    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user;

    // IMPORTANTE: Remove qualquer sufixo do ID para evitar o erro UUID 22P02
    const cleanProductId = String(product.id).split('-')[0].length < 10 ? product.id : String(product.id).split('-').slice(0, 5).join('-');

    const orderQty = product.is_encomenda ? (product.order_quantity || 50) : quantity;

    if (activeUser) {
      try {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', activeUser.id)
          .eq('product_id', cleanProductId)
          .maybeSingle();

        if (existing) {
          const newQty = product.is_encomenda ? orderQty : (existing.quantity + quantity);
          await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
        } else {
          await supabase.from('cart_items').insert({
            user_id: activeUser.id,
            product_id: cleanProductId,
            quantity: orderQty
          });
        }
        const updatedItems = await fetchCartFromDatabase(activeUser.id);
        setCartItems(updatedItems);
      } catch (err) {
        toast({ title: 'Erro', description: 'Falha ao salvar no banco.', variant: 'destructive' });
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === cleanProductId);
        let newState;
        if (existing) {
          newState = prev.map(item => item.id === cleanProductId ? { ...item, quantity: orderQty } : item);
        } else {
          newState = [...prev, { ...product, id: cleanProductId, quantity: orderQty, price: (product.price / 100) * orderQty }];
        }
        localStorage.setItem('bakery_cart_guest', JSON.stringify(newState));
        return newState;
      });
    }
    toast({ title: 'Sucesso! 🥐', description: 'Item atualizado no carrinho.' });
  };

  const removeFromCart = async (productId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('cart_items').delete().eq('product_id', productId).eq('user_id', session.user.id);
    }
    setCartItems(prev => {
      const newState = prev.filter(item => item.id !== productId);
      if (!session?.user) localStorage.setItem('bakery_cart_guest', JSON.stringify(newState));
      return newState;
    });
  };

  // 3. ATUALIZAR QUANTIDADE (Corrige o bug de pular/mudar ordem)
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user;

    if (activeUser) {
      // Atualização otimista do estado local (mantém a ordem)
      setCartItems(prev => prev.map(item => {
        if (item.id === productId) {
          const originalProductPrice = item.price / (item.is_encomenda ? (item.quantity / 100) : 1);
          const basePrice = Number(item.price_cento || 38); // Exemplo coxinha
          const finalPrice = item.is_encomenda ? (basePrice / 100) * newQuantity : item.price;
          return { ...item, quantity: newQuantity, price: finalPrice };
        }
        return item;
      }));

      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('user_id', activeUser.id)
          .eq('product_id', productId);

        if (error) throw error;
      } catch (err) {
        console.error("Erro ao atualizar:", err);
        const items = await fetchCartFromDatabase(activeUser.id);
        setCartItems(items);
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.is_encomenda) return total + item.price;
      return total + (Number(item.price) * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartTotal,
      getCartItemsCount: () => cartItems.length,
      cartCount: cartItems.length
    }}>
      {children}
    </CartContext.Provider>
  );
};