'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BedDouble, Headphones, Hotel as HotelIcon, IndianRupee, MapPin, ShieldCheck, Star } from 'lucide-react';
import { getHotels } from '@/lib/supabase';
import { HOTEL_REGIONS, type Hotel } from '@/types';
import { POPULAR_HOTEL_CITIES } from '@/data/travelContent';
import SectionTitle from '@/components/SectionTitle';
import FilterSidebar, { StarLabel, emptyFilters, passesGroup, passesPrice, type FilterValues } from '@/components/FilterSidebar';
import type { HeroSlide } from '@/components/HeroBanner';
import type { QuoteRequest } from '@/components/booking/QuoteRequestModal';

const HeroBanner = dynamic(() => import('@/components/HeroBanner'), { ssr: false });
const QuoteRequestModal = dynamic(() => import('@/components/booking/QuoteRequestModal'), { ssr: false });

const HOTEL_SLIDES: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80',
    title: 'Hotels & Resorts',
    title2: 'At Best Rates',
    subtitle: 'Handpicked, verified stays across the hills, beaches and cities of India and abroad.',
    tags: ['Hotels', 'Resorts', 'Homestays'],
    cta: 'Search Hotels',
    href: '#booking',
  },
  {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1800&q=80',
    title: 'Mountain Stays',
    title2: 'Shimla & Manali',
    subtitle: 'Valley-view rooms, riverside cottages and snow-side resorts.',
    tags: ['Valley views', 'Riverside cottages'],
    cta: 'Search Hotels',
    href: '#booking',
  },
];

const PERKS = [
  { Icon: HotelIcon, title: 'Verified Properties', text: 'Every hotel is personally vetted by our team.' },
  { Icon: BedDouble, title: 'Partner Rates', text: 'Special rates and upgrades where available.' },
  { Icon: ShieldCheck, title: 'Clear Policies', text: 'Cancellation terms shared before you confirm.' },
  { Icon: Headphones, title: '24/7 Support', text: 'Early check-in, late check-out or changes — just call.' },
];

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/hotel/?slug=${encodeURIComponent(hotel.slug)}`}
      className="group bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] border-b-2 border-brand-blue flex flex-col h-full hover:shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-shadow"
    >
      <div className="relative h-[160px] overflow-hidden">
        <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {hotel.isFeatured && (
          <span className="absolute top-5 right-0 bg-brand-blue text-white text-[13px] font-medium px-2.5 py-1">Featured</span>
        )}
      </div>
      <div className="px-2.5 pt-2.5 pb-2 flex-1 flex flex-col">
        <h3 className="text-[14px] font-medium text-brand-ink leading-snug line-clamp-2 group-hover:text-brand-blue">{hotel.name}</h3>
        <p className="flex items-center gap-1 text-[12px] text-brand-muted mt-1 mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{hotel.location}</span>
        </p>
        {hotel.amenities.length > 0 && (
          <p className="text-[12px] text-[#777] line-clamp-1 mb-2">{hotel.amenities.slice(0, 3).join(' · ')}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex gap-1" aria-label={`${hotel.starRating} star hotel`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < hotel.starRating ? 'fill-brand-navy text-brand-navy' : 'text-[#ccc]'}`} />
            ))}
          </span>
          <span className="flex items-center text-[14px] text-brand-orange">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>
              {hotel.pricePerNight.toLocaleString('en-IN')}
              {hotel.originalPrice ? <s className="text-[11px] text-brand-muted ml-1">{hotel.originalPrice.toLocaleString('en-IN')}</s> : null}
              <span className="text-[11px] text-brand-muted">/night</span>
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HotelsPage() {
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);

  useEffect(() => {
    // getHotels already returns North India -> South India -> International
    getHotels().then(setHotels);
  }, []);

  // Filter options come from the hotels on the site
  const priceRange = useMemo(() => {
    const prices = hotels.map((h) => h.pricePerNight).filter((p) => p > 0);
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices), suffix: '/night' } : undefined;
  }, [hotels]);

  const filterGroups = useMemo(() => {
    const stars = [...new Set(hotels.map((h) => h.starRating))].filter((n) => n >= 1 && n <= 5).sort((a, b) => b - a);
    const amenities = [...new Set(hotels.flatMap((h) => h.amenities))].sort((a, b) => a.localeCompare(b));
    return [
      { id: 'stars', title: 'Star Rating', options: stars.map((n) => ({ value: String(n), label: <StarLabel count={n} /> })) },
      {
        id: 'region',
        title: 'Region',
        options: HOTEL_REGIONS.filter((r) => hotels.some((h) => h.region === r.value)).map((r) => ({ value: r.value, label: r.label })),
      },
      { id: 'amenities', title: 'Amenities', options: amenities.map((a) => ({ value: a, label: a })) },
    ];
  }, [hotels]);

  const visibleHotels = hotels.filter(
    (h) =>
      passesPrice(filters, h.pricePerNight) &&
      passesGroup(filters, 'stars', String(h.starRating)) &&
      passesGroup(filters, 'region', h.region) &&
      passesGroup(filters, 'amenities', h.amenities)
  );

  return (
    <div className="bg-white">
      <HeroBanner slides={HOTEL_SLIDES} initialTab="hotel" />

      <section className="py-12 bg-brand-cream">
        <div className="container-bb">
          <SectionTitle light="Popular" bold="Hotel Destinations" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[30px] gap-y-4">
            {POPULAR_HOTEL_CITIES?.map((c) => (
              <button
                key={c.city}
                onClick={() => setQuote({ title: `Hotel: ${c.city}`, summary: [{ label: 'City', value: c.city }] })}
                className="group relative h-[170px] sm:h-[240px] overflow-hidden"
              >
                <img src={c.image} alt={c.city} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                <span className="absolute inset-x-2 top-[30%] text-center text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                  <span className="block text-lg font-semibold uppercase">{c.city}</span>
                  <span className="block text-[13px]">{c.tag}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {hotels.length > 0 && (
        <section className="py-12">
          <div className="container-bb">
            <SectionTitle light="Our" bold="Hotels & Resorts" />
            <div className="flex flex-col lg:flex-row lg:items-start gap-[30px]">
              <FilterSidebar
                price={priceRange}
                groups={filterGroups}
                value={filters}
                onChange={setFilters}
                resultCount={visibleHotels.length}
              />

              <div className="flex-1 min-w-0 space-y-10">
                {visibleHotels.length === 0 ? (
                  <div className="bg-white border border-[#ddd] p-10 text-center">
                    <p className="text-sm text-brand-ink mb-3">No hotels match these filters.</p>
                    <button type="button" onClick={() => setFilters(emptyFilters())} className="text-sm text-brand-blue hover:underline">
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  HOTEL_REGIONS?.map((region) => {
                    const regionHotels = visibleHotels.filter((h) => h.region === region.value);
                    if (regionHotels.length === 0) return null;
                    return (
                      <div key={region.value}>
                        <h3 className="inline-block text-[19px] text-brand-ink pr-6 pb-1 mb-5 border-b-2 border-brand-green">
                          {region.label} Hotels
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[30px]">
                          {regionHotels?.map((h) => (
                            <HotelCard key={h.id} hotel={h} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={`py-12 ${hotels.length > 0 ? 'bg-brand-cream' : ''}`}>
        <div className="container-bb">
          <SectionTitle light="Why Book" bold="Hotels With Us" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-[#ddd] gap-y-8">
            {PERKS?.map(({ Icon, title, text }) => (
              <div key={title} className="text-center px-6">
                <Icon className="w-11 h-11 mx-auto text-brand-orange" strokeWidth={1.3} />
                <h3 className="text-sm text-brand-ink mt-3">{title}</h3>
                <p className="text-[13px] text-[#999] mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteRequestModal request={quote} onClose={() => setQuote(null)} />
    </div>
  );
}
