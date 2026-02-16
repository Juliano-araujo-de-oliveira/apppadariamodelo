import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, image: "https://rezwukolnsnzjqmbescn.supabase.co/storage/v1/object/public/Banner/1.jpg" },
    { id: 2, image: "https://rezwukolnsnzjqmbescn.supabase.co/storage/v1/object/public/Banner/2.jpg" },
    { id: 3, image: "https://rezwukolnsnzjqmbescn.supabase.co/storage/v1/object/public/Banner/3.jpg" },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .not('category', 'ilike', 'Encomenda')
        .limit(6);

      if (fetchError) throw fetchError;

      const produtosFiltrados = (data || []).filter(
        product => product.category?.trim().toLowerCase() !== 'encomenda'
      );

      setProducts(produtosFiltrados);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white overflow-x-hidden">
      <Helmet>
        <title>App Padaria Modelo - Pães, doces e salgados fresquinhos</title>
      </Helmet>

      <Navigation />

      {/* --- CARROSSEL --- */}
      <section className="relative pt-20">
        <div className="relative w-full aspect-[2.5/1] sm:aspect-[4/1] md:aspect-[5/1] overflow-hidden bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slides[currentSlide].image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full h-full object-contain sm:object-cover object-center"
            />
          </AnimatePresence>

          {/* Indicadores */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 sm:h-1.5 rounded-full transition-all ${index === currentSlide ? 'bg-red-600 w-4 sm:w-6' : 'bg-white/60 w-1 sm:w-1.5'
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DE PRODUTOS --- */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
         Destaques Do Dia <Star className="w-6 h-6 md:w-8 md:h-8 text-[#DAA520] fill-[#DAA520]" />
            </h2>
            <div className="h-1 w-16 md:w-20 bg-[#DAA520] mx-auto rounded-full"></div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl h-[350px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* BOTÃO MOVIDO PARA CÁ (FINAL DOS PRODUTOS) */}
              <div className="mt-12 flex justify-center">
                <Link to="/menu">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 sm:px-12 sm:py-8 text-lg sm:text-2xl font-black rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-3 italic uppercase">
                    Ver Cardápio <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;