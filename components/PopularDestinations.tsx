'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
  Sparkles,
  Calendar
} from 'lucide-react';
import { getDestinations } from '@/lib/supabase';
import { Destination } from '@/types';

// Fallback season/vibe information for richer editorial feel
const DESTINATION_META: Record<string, { season: string; vibe: string; defaultImg: string }> = {
  'andamantourpackage': {
    season: 'Oct – May',
    vibe: 'Tropical Coral Lagoons',
    defaultImg: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
  },
  'sikkim-tour-package': {
    season: 'Mar – Jun & Oct – Dec',
    vibe: 'High Himalayan Peaks',
    defaultImg: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  },
  'kashmirtourpackage': {
    season: 'Year-Round Romance',
    vibe: 'Alpine Meadows & Snow',
    defaultImg: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  },
  'kerala-tour-packages': {
    season: 'Sep – Mar',
    vibe: 'Backwaters & Tea Hills',
    defaultImg: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  },
  'bhutan-tour-packages': {
    season: 'Oct – Dec & Mar – May',
    vibe: 'Thunder Dragon Kingdom',
    defaultImg: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  },
  'bali-tour-packages': {
    season: 'Apr – Oct',
    vibe: 'Spiritual Island Sanctuary',
    defaultImg: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  },
  'darjeelingtourpackages': {
    season: 'Apr – Jun & Oct – Dec',
    vibe: 'Queen of the Hills',
    defaultImg: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
  },
};

export default function PopularDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDestinations() {
      const data = await getDestinations();
      // Ensure we display destinations with valid images
      const enhanced = data.map((d) => {
        const meta = DESTINATION_META[d.slug] || DESTINATION_META['sikkim-tour-package'];
        return {
          ...d,
          imageUrl: d.imageUrl && d.imageUrl.trim() !== '' ? d.imageUrl : meta?.defaultImg || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        };
      });
      setDestinations(enhanced);
      setLoading(false);
    }
    loadDestinations();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth > 768 ? clientWidth * 0.6 : clientWidth * 0.85;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-midnight">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5 text-primaryCyan" />
              <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
                Curated Travel Horizons
              </span>
            </div>
            <h2 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Iconic Escapes & Destinations
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              Immerse yourself in handpicked sanctuaries across snow-clad mountain passes, serene backwaters, and pristine tropical archipelagos.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-11 h-11 rounded-full bg-white/[0.05] hover:bg-primaryCyan hover:text-white border border-white/[0.1] text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full bg-white/[0.05] hover:bg-primaryCyan hover:text-white border border-white/[0.1] text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primaryCyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          /* Horizontal Destination Showcase */
          <div
            ref={scrollContainerRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {destinations.map((dest) => {
              const meta = DESTINATION_META[dest.slug];
              return (
                <div
                  key={dest.id}
                  className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px] snap-start shrink-0"
                >
                  <Link
                    href={`/location/${dest.slug}`}
                    className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden block border border-white/[0.08] hover:border-primaryCyan/50 transition-all duration-500 shadow-card hover:shadow-cardHover"
                  >
                    {/* Destination Image */}
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                    {/* Top Chips */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 bg-midnight/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.1] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold" />
                        <span>{meta?.season || 'Best Season'}</span>
                      </span>

                      <span className="text-[10px] font-bold text-primaryCyan bg-primaryCyan/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-primaryCyan/40">
                        {dest.packageCount || 4}+ Tours
                      </span>
                    </div>

                    {/* Bottom Editorial Content */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10">
                      <span className="text-[11px] font-semibold text-gold tracking-widest uppercase block mb-1">
                        {meta?.vibe || 'Curated Escape'}
                      </span>

                      <h3 className="editorial-heading text-xl sm:text-2xl font-bold text-white group-hover:text-primaryCyan transition-colors leading-tight mb-3">
                        {dest.name}
                      </h3>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.1] text-xs font-semibold text-slate-300">
                        <span className="group-hover:text-white transition-colors">
                          Explore Custom Itineraries
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/[0.08] group-hover:bg-primaryCyan group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
