import React from 'react';
import { MapPin, ArrowRight, Phone } from 'lucide-react';

const Footer = () => {
  // URL formatada para busca direta do endereço no Google Maps
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Rua+Arroio+da+Sal,+700+-+Canoas,+RS";

  return (
    <footer className="bg-[#CB0000] border-t border-white/10 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Container Principal: Coluna no mobile, Linha no desktop */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* 1. Identificação */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🍞</span>
            <span className="text-lg font-bold text-white whitespace-nowrap uppercase tracking-tight">
              App Padaria Modelo
            </span>
          </div>

          {/* 2. Endereço e Contato (Centralizados) */}
          <div className="flex flex-col items-center text-center">
            <p className="text-gray-300 text-sm flex items-center gap-1 leading-tight">
              <MapPin className="w-4 h-4 text-white shrink-0" />
              Rua Arroio da Sal, 700 – Canoas, RS
            </p>
            <p className="text-[#DAA520] text-sm font-bold flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" /> (51) 99366-7248
            </p>
          </div>

          {/* 3. Ação e Copyright */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white text-sm font-semibold hover:text-[#DAA520] transition-colors group"
            >
              Ver no Google Maps
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="text-gray-500 text-[10px]">
              © 2026 Todos os direitos reservados.
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;