'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookingWidget, { BookingTab } from '@/components/booking/BookingWidget';

export interface HeroSlide {
  image: string;
  /** Big first line (golden-brown). */
  title: string;
  /** Big second line (navy). */
  title2: string;
  subtitle: string;
  tags: string[];
  cta: string;
  href: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: '/images/destinations/spiti.jpg',
    title: 'Spiti Valley',
    title2: 'Expedition 7N / 8D',
    subtitle: "Shimla – Kalpa – Kaza – Manali. Ride through one of India's most spectacular high-altitude circuits.",
    tags: ['High-altitude adventure', 'Monasteries & lakes'],
    cta: 'Book Now > Get Best Price',
    href: '#top-selling',
  },
  {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1800&q=80',
    title: 'Himachal',
    title2: 'Complete Delight 6N / 7D',
    subtitle: 'Shimla – Kullu – Manali with handpicked hotels, private cab and 24/7 on-tour support.',
    tags: ['Snow points', 'Family & honeymoon'],
    cta: 'Book Now > Get Best Price',
    href: '#top-selling',
  },
  {
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1800&q=80',
    title: 'Exotic Kashmir',
    title2: 'Valley 5N / 6D',
    subtitle: 'Srinagar houseboats, Gulmarg gondola and the meadows of Pahalgam.',
    tags: ['Dal Lake shikara', 'Gulmarg gondola'],
    cta: 'Book Now > Get Best Price',
    href: '#top-selling',
  },
  {
    image: '/images/destinations/nainital.jpg',
    title: 'Uttarakhand',
    title2: 'Hill Escape 5N / 6D',
    subtitle: 'Mussoorie – Rishikesh – Nainital. Hills, the holy Ganga and lakeside evenings.',
    tags: ['Ganga aarti', 'Lake district'],
    cta: 'Book Now > Get Best Price',
    href: '#top-selling',
  },
];

export default function HeroBanner({
  slides = DEFAULT_SLIDES,
  initialTab = 'flight',
  tabs,
}: {
  slides?: HeroSlide[];
  initialTab?: BookingTab;
  tabs?: BookingTab[];
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (dir: number) => setCurrent((p) => (p + dir + slides.length) % slides.length);

  return (
    <section className="relative bg-white">
      <div className="relative h-[230px] sm:h-[320px] md:h-[435px] overflow-hidden">
        {slides.map((s, i) => (
          <div key={s.image} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100 z-[1]' : 'opacity-0'}`}>
            <img src={s.image} alt={`${s.title} ${s.title2}`} className="absolute inset-0 w-full h-full object-cover" />
            {/* White wash on the left, like the painted brush area of the reference banners */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:via-white/75 md:to-55%" />
            <div className="relative h-full max-w-[1140px] mx-auto px-4 flex items-center md:items-start md:pt-14">
              <div className="max-w-[300px] sm:max-w-md md:max-w-[520px] text-center">
                <h2 className="font-display uppercase leading-[0.95]">
                  <span className="block text-[30px] sm:text-5xl md:text-[64px] font-bold bg-gradient-to-b from-[#a0661f] to-[#5e3a0a] bg-clip-text text-transparent">
                    {s.title}
                  </span>
                  <span className="block text-xl sm:text-3xl md:text-[40px] font-semibold text-[#14305e] mt-1">{s.title2}</span>
                </h2>
                <p className="hidden sm:block text-sm md:text-base text-[#1c2b4a] font-medium mt-4 leading-snug">{s.subtitle}</p>
                <p className="hidden md:block font-display uppercase text-[15px] text-[#14305e] tracking-wide mt-4">{s.tags.join('  |  ')}</p>
                <a
                  href={s.href}
                  className="inline-block mt-3 md:mt-5 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full bg-gradient-to-b from-[#8a5412] to-[#5e3a0a] text-white text-xs md:text-sm font-medium tracking-wide shadow"
                >
                  {s.cta}
                </a>
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[2] text-white/90 hover:text-white drop-shadow" aria-label="Previous slide">
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />
            </button>
            <button onClick={() => go(1)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[2] text-white/90 hover:text-white drop-shadow" aria-label="Next slide">
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />
            </button>
          </>
        )}
      </div>

      {/* Search widget overlapping the banner bottom */}
      <div className="relative z-10 md:max-w-[1140px] mx-auto md:px-4 md:-mt-[50px] pb-6 md:pb-8">
        <BookingWidget initialTab={initialTab} tabs={tabs} />
      </div>
    </section>
  );
}
