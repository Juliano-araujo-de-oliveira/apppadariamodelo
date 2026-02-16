import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['Todos', 'Pães', 'Salgados', 'Doces', 'Bolos', "Bebidas"];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('category', 'ilike', 'Encomenda')
        .order('name');

      if (error) throw error;

      const produtosFiltrados = (data || []).filter(
        product => product.category?.trim().toLowerCase() !== 'encomenda'
      );

      setProducts(produtosFiltrados);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Erro ao carregar cardápio. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductDelete = (deletedId) => {
    setProducts(prev => prev.filter(p => p.id !== deletedId));
  };

  const filteredProducts = products.filter(product => {
    const productCategory = product.category || 'Outros'; 
    const matchesCategory = selectedCategory === 'Todos' || productCategory === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    /* A div principal agora força o fundo clarinho para cobrir qualquer vazamento roxo */
    <div className="flex flex-col min-h-screen bg-[#FFF5F5] w-full overflow-x-hidden">
      <Helmet>
        <title>Cardápio - App Padaria Modelo</title>
        {/* Injeção de estilo para garantir que o body do HTML também não seja roxo */}
        <style>{`
          body, html { background-color: #FFF5F5 !important; }
        `}</style>
      </Helmet>

      <Navigation />

      {/* MAIN com degradê de BAIXO para CIMA:
        - Começa no vermelho do Footer (from-red-600)
        - Sobe para o vermelho bem clarinho (to-[#FFF5F5])
      */}
      <main className="flex-1 pt-32 pb-0 bg-gradient-to-t from-red-600/30 via-[#FFF5F5] to-[#FFF5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-black text-red-900 mb-4 uppercase italic">
              Nosso Cardápio 🍞
            </h1>
            <p className="text-xl text-red-800/70 max-w-2xl mx-auto font-medium">
              Produtos artesanais feitos diariamente para você.
            </p>
          </motion.div>

          {/* Busca e Filtros */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <div className="w-full max-w-md relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5 group-focus-within:text-red-600 transition-colors" />
              <input 
                type="text"
                placeholder="O que você procura hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-red-100 rounded-2xl text-red-900 shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-white text-red-600 border border-red-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Listagem de Produtos */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
              <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto col-span-full" />
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-red-100">
               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <Button onClick={fetchProducts} className="bg-red-600 text-white">Tentar Novamente</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDeleteSuccess={handleProductDelete} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};

export default MenuPage;