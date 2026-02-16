import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast'; // 1. IMPORTAÇÃO DO TOAST

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast(); // 2. INICIALIZAÇÃO
  const [isHovered, setIsHovered] = useState(false);

  // 3. FUNÇÃO PARA ADICIONAR E NOTIFICAR
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      variant: "success", // Usa a cor verde claro que criamos no toast.jsx
      title: "Sucesso! 🥐",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  return (
    <motion.div
      
      className="group relative bg-white rounded-3xl overflow-hidden border border-[#DAA520] transition-all duration-300 shadow-lg flex flex-col h-full"
    
    >
      {/* Imagem do Produto */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          {/* Título Dourado */}
          <h3 className="text-xl font-bold text-[#DAA520] mb-2 line-clamp-1">
            {product.name}
          </h3>
          {/* Descrição Vermelha */}
          <p className="text-red-600 text-sm line-clamp-2 min-h-[40px] font-medium">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          {/* Substitua o bloco <div className="flex flex-col"> por este: */}
          <div className="flex flex-col">
            {/* Corrigido o erro de digitação na classe abaixo */}
            <span className="text-xs text-red-600 font-medium">Preço</span>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#DAA520]">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </span>

              {/* Unidade dinâmica: se não houver no banco, mostra 'un' */}
              <span className="text-sm font-bold text-[#DAA520] lowercase">
                /{product.unit || 'un'}
              </span>
            </div>
          </div>

          {/* Botão Vermelho com conteúdo Branco */}
          <Button
            onClick={handleAddToCart}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold flex items-center gap-2 px-6 shadow-md border-none"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="text-white">Adicionar</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;