'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsRight, Calendar } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';
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
      const enhanced = data?.map((d) => {
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
    <section className="py-12 bg-white text-brand-ink text-sm">
      <div className="container-bb">
        {/* Section Header */}
        <SectionTitle
          light="Iconic Escapes &"
          bold="Destinations"
          subtitle="Immerse yourself in handpicked sanctuaries across snow-clad mountain passes, serene backwaters, and pristine tropical archipelagos."
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative">
            {/* Carousel Arrows */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-5 top-[95px] z-10 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] items-center justify-center text-brand-blue"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Horizontal Destination Showcase */}
            <div
              ref={scrollContainerRef}
              className="flex gap-[30px] overflow-x-auto pb-2 pt-1 px-[2px] snap-x snap-mandatory scroll-smooth no-scrollbar"
            >
              {destinations?.map((dest) => {
                const meta = DESTINATION_META[dest.slug];
                return (
                  <div key={dest.id} className="w-[85%] sm:w-[calc(50%-15px)] lg:w-[calc(25%-23px)] snap-start shrink-0">
                    <Link
                      href={`/location/${dest.slug}`}
                      className="group h-full flex flex-col bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] border-b-2 border-brand-blue"
                    >
                      {/* Destination Image */}
                      <div className="relative h-[190px] overflow-hidden">
                        <img
                          src={dest.imageUrl}
                          alt={dest.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-5 right-0 bg-brand-blue text-white text-[13px] font-medium px-2.5 py-1">
                          {dest.packageCount || 4}+ Tours
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="px-2.5 pt-2.5 pb-2.5 flex-1 flex flex-col">
                        <h3 className="text-sm font-medium text-brand-ink leading-snug group-hover:text-brand-blue">{dest.name}</h3>
                        <span className="text-[13px] text-brand-muted mt-0.5">{meta?.vibe || 'Curated Escape'}</span>
                        <span className="flex items-center gap-1 text-[13px] text-brand-muted mt-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-orange" strokeWidth={1.5} />
                          {meta?.season || 'Best Season'}
                        </span>

                        <span className="mt-auto pt-2 inline-flex items-center gap-1 text-[13px] font-medium text-brand-blue group-hover:underline">
                          Explore Custom Itineraries <ChevronsRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-5 top-[95px] z-10 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] items-center justify-center text-brand-blue"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
