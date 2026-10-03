'use client';

import React from 'react';
import { siteConfig } from '@/config/siteConfig';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppWidget() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Hello The Navigators! I would like to plan a bespoke holiday package and get customized quotes.')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 group flex items-center gap-3"
      title="Chat with The Navigators on WhatsApp"
    >
      {/* Sleek Luxury Tooltip */}
      <div className="hidden sm:flex items-center gap-2 bg-midnight/90 backdrop-blur-xl text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-glass border border-white/[0.12] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Chat with 24/7 Travel Concierge</span>
      </div>

      {/* Pulsing Floating Button */}
      <div className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4eed88] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all duration-300 transform group-hover:scale-110 active:scale-95 relative border border-white/20">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 relative z-10 fill-white/10" />
      </div>
    </a>
  );
}
