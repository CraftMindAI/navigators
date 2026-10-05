'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { BadgePercent, Headphones, Plane, ShieldCheck, Ticket } from 'lucide-react';
import { AIRPORTS, POPULAR_FLIGHT_ROUTES } from '@/data/travelContent';
import SectionTitle from '@/components/SectionTitle';
import type { HeroSlide } from '@/components/HeroBanner';
import type { QuoteRequest } from '@/components/booking/QuoteRequestModal';

const HeroBanner = dynamic(() => import('@/components/HeroBanner'), { ssr: false });
const QuoteRequestModal = dynamic(() => import('@/components/booking/QuoteRequestModal'), { ssr: false });

const city = (code: string) => AIRPORTS.find((a) => a.code === code)!;

const FLIGHT_SLIDES: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80',
    title: 'Cheap Flights',
    title2: 'Domestic & International',
    subtitle: 'One way, round trip or multi-city — we compare fares across airlines for you.',
    tags: ['Best fare assurance', 'Special fares'],
    cta: 'Search Flights',
    href: '#booking',
  },
  {
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1800&q=80',
    title: 'Fly to the',
    title2: 'Mountains',
    subtitle: 'Srinagar, Leh, Kullu, Dharamshala & Dehradun — combine flights with our holiday packages.',
    tags: ['Kashmir', 'Ladakh', 'Himachal'],
    cta: 'Search Flights',
    href: '#booking',
  },
];

const PERKS = [
  { Icon: BadgePercent, title: 'Best Fare Assurance', text: 'We compare across airlines and fare families for you.' },
  { Icon: Ticket, title: 'Special Fares', text: 'Student, senior citizen and armed forces fares on request.' },
  { Icon: ShieldCheck, title: 'Confirmed E-Tickets', text: 'Tickets issued promptly with complete itinerary details.' },
  { Icon: Headphones, title: '24/7 Support', text: 'Changes, cancellations and web check-in help any time.' },
];

export default function FlightsPage() {
  const [quote, setQuote] = useState<QuoteRequest | null>(null);

  return (
    <div className="bg-white">
      <HeroBanner slides={FLIGHT_SLIDES} initialTab="flight" />

      <section className="py-12">
        <div className="container-bb">
          <SectionTitle light="Popular" bold="Flight Routes" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {POPULAR_FLIGHT_ROUTES.map(({ from, to }) => {
              const a = city(from);
              const b = city(to);
              return (
                <button
                  key={`${from}-${to}`}
                  onClick={() => setQuote({ title: `Flight: ${from} → ${to}`, summary: [{ label: 'Route', value: `${a.city} (${from}) → ${b.city} (${to})` }] })}
                  className="flex items-center gap-4 p-4 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] border-b-2 border-brand-blue text-left hover:shadow-md transition-shadow"
                >
                  <span className="w-11 h-11 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-brand-ink truncate">
                      {a.city} → {b.city}
                    </span>
                    <span className="block text-[13px] text-brand-muted">
                      {from} – {to}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-brand-orange shrink-0">Get Fare</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-brand-cream">
        <div className="container-bb">
          <SectionTitle light="Why Book" bold="Flights With Us" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-[#ddd] gap-y-8">
            {PERKS.map(({ Icon, title, text }) => (
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
