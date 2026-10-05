'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ChevronsRight, Headphones, Hotel, Map, Mountain } from 'lucide-react';
import { TourPackage } from '@/types';
import { getTours, submitInquiry } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';
import { TRENDING_PACKAGES, WELCOME } from '@/data/travelContent';
import {
  DOMESTIC_TILES,
  FEATURED_TRIPS,
  HOLIDAY_CATEGORIES,
  INTERNATIONAL_TILES,
  OFFERS,
  SERVICE_PILLARS,
  Tile,
  WHY_BLOCKS,
  WHY_IMAGES,
} from '@/data/homeContent';
import SectionTitle from '@/components/SectionTitle';
import { PackageCard } from '@/components/TourPackageCard';
import type { QuoteRequest } from '@/components/booking/QuoteRequestModal';

const HeroBanner = dynamic(() => import('@/components/HeroBanner'), { ssr: false });
const InquiryModal = dynamic(() => import('@/components/InquiryModal'), { ssr: false });
const QuoteRequestModal = dynamic(() => import('@/components/booking/QuoteRequestModal'), { ssr: false });

const PILLAR_ICONS = [Headphones, Map, Hotel, Mountain];

const tileHref = (t: Tile) => (t.slug ? `/location/${t.slug}` : undefined);

function ViewMore({ href }: { href: string }) {
  return (
    <div className="text-right mt-4">
      <Link href={href} className="inline-flex items-center text-[13px] font-medium text-brand-blue hover:underline">
        View More <ChevronsRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/** Square destination tile with the name centred in the upper third (Holiday Destinations grid). */
function DestinationTile({ tile, onEnquire }: { tile: Tile; onEnquire: () => void }) {
  const body = (
    <>
      <img src={tile.image} alt={tile.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
      <span className="absolute inset-x-2 top-[30%] text-center text-white text-lg font-semibold uppercase [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
        {tile.title}
      </span>
    </>
  );
  const cls = 'group relative block h-[170px] sm:h-[240px] overflow-hidden';
  const href = tileHref(tile);
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onEnquire} className={`${cls} w-full`}>
      {body}
    </button>
  );
}

export default function HomePage() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedTourForInquiry, setSelectedTourForInquiry] = useState<TourPackage | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [tripTab, setTripTab] = useState(0);
  const [whyImage, setWhyImage] = useState(0);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSent, setCallbackSent] = useState(false);
  const offersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTours().then(setTours);
  }, []);

  const openInquiry = (tour: TourPackage | null) => {
    setSelectedTourForInquiry(tour);
    setInquiryModalOpen(true);
  };

  const enquire = (title: string, summary: QuoteRequest['summary'] = []) => setQuote({ title, summary });

  const scrollOffers = (dir: number) => offersRef.current?.scrollBy({ left: dir * 290, behavior: 'smooth' });

  const submitCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitInquiry({ name: 'Website call-back request', email: '', phone: `+91 ${callbackPhone}`, tourTitle: 'Call-back request', message: 'Requested a call back from the home page.' });
    setCallbackSent(true);
    setCallbackPhone('');
  };

  const trip = FEATURED_TRIPS[tripTab];

  return (
    <div className="bg-white">
      <HeroBanner />

      {/* ---------- Offers & Deals ---------- */}
      <section className="pt-6 pb-12">
        <div className="container-bb">
          <SectionTitle light="Offers &" bold="Deals" />
          <div className="relative">
            <button
              onClick={() => scrollOffers(-1)}
              className="hidden md:flex absolute -left-5 top-[110px] z-10 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] items-center justify-center text-brand-blue"
              aria-label="Previous offers"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div ref={offersRef} className="flex gap-[30px] overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
              {OFFERS.map((o) => (
                <div key={o.heading} className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-15px)] lg:w-[calc(25%-23px)] flex flex-col">
                  <button
                    type="button"
                    onClick={() => enquire(`Offer: ${o.caption}`, [{ label: 'Offer', value: o.caption }, { label: 'Route', value: o.tagline }])}
                    className="relative h-[220px] overflow-hidden text-left bg-gradient-to-br from-white to-[#eef2fb]"
                  >
                    <img
                      src={o.image}
                      alt={o.heading}
                      className="absolute right-0 bottom-0 w-[62%] h-[62%] object-cover rounded-tl-[60px]"
                    />
                    <span className="absolute top-3 left-4 right-4">
                      <span className="block text-[22px] leading-[1.15] font-bold text-brand-heading">{o.heading}</span>
                      <span className="block text-[10px] font-medium text-brand-heading mt-1.5">{o.tagline}</span>
                    </span>
                    <span className="absolute left-4 bottom-4 bg-[#f7c32e] text-brand-heading text-[9px] font-semibold px-2.5 py-0.5 rounded-full">Learn More</span>
                  </button>
                  <div className="flex-1 mx-0 border border-[#ddd] border-t-0 shadow-[0_2px_3px_rgba(0,0,0,0.08)] px-2.5 py-3">
                    <h3 className="text-sm font-medium text-brand-heading leading-tight mb-2">{o.caption}</h3>
                    <p className="text-[13px] text-brand-heading uppercase leading-snug">{o.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollOffers(1)}
              className="hidden md:flex absolute -right-5 top-[110px] z-10 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] items-center justify-center text-brand-blue"
              aria-label="Next offers"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section className="pb-10">
        <div className="container-bb text-center">
          <span className="block text-[17px] md:text-xl font-light text-brand-gray capitalize">{WELCOME.subtitle}</span>
          <h1 className="text-[24px] md:text-[28px] font-medium text-brand-gray mt-3 mb-5">{WELCOME.title}</h1>
          <p className={`text-sm text-brand-ink text-justify leading-[1.7] ${aboutOpen ? '' : 'line-clamp-2'}`}>{WELCOME.body}</p>
          <div className="text-right mt-4">
            <button onClick={() => setAboutOpen((o) => !o)} className="px-2.5 py-1.5 rounded-sm bg-brand-blue hover:bg-brand-blueDark text-white text-[13px]">
              {aboutOpen ? 'Read Less' : 'Read More'}
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Holiday Category (mosaic) ---------- */}
      <section className="pb-14">
        <div className="container-bb">
          <SectionTitle light="Holiday" bold="Category" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px] md:gap-[30px]">
            {HOLIDAY_CATEGORIES.map((c, i) => {
              const wide = i === 0 || i === 5;
              const href = tileHref(c);
              const body = (
                <>
                  <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute left-2.5 right-14 bottom-3 text-left text-white">
                    <span className="block text-[13px] md:text-sm font-semibold uppercase leading-tight">{c.title}</span>
                    <span className="block text-[11px] md:text-[13px] font-semibold uppercase mt-2">{c.sub}</span>
                  </span>
                  <ArrowRight className="absolute right-3 bottom-3 w-7 h-7 text-white" strokeWidth={1.5} />
                </>
              );
              const cls = `group relative h-[180px] md:h-[270px] overflow-hidden ${wide ? 'col-span-2' : ''}`;
              return href ? (
                <Link key={c.title} href={href} className={cls}>
                  {body}
                </Link>
              ) : (
                <button key={c.title} type="button" onClick={() => enquire(`Holiday: ${c.title}`, [{ label: 'Interest', value: c.title }])} className={cls}>
                  {body}
                </button>
              );
            })}
          </div>
          <ViewMore href="/#destinations" />
        </div>
      </section>

      {/* ---------- Blue slanted band: call back ---------- */}
      <section
        className="relative bg-brand-blue text-white py-16 md:py-20"
        style={{ clipPath: 'polygon(0 5%, 100% 0, 100% 92%, 0 100%)' }}
      >
        <div className="container-bb grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-[24px] md:text-[28px] font-medium">Plan Your Trip With Us!</h3>
            <p className="text-sm font-medium mt-2">Best travel deals for Himachal, Spiti, Kashmir & beyond</p>
            <p className="text-xs uppercase mt-8 mb-2">Get a free call back</p>
            {callbackSent ? (
              <p className="bg-white/15 rounded px-4 py-3 text-sm">Thank you! Our travel expert will call you shortly.</p>
            ) : (
              <form onSubmit={submitCallback} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-[640px]">
                <div className="flex flex-1">
                  <span className="bg-brand-field text-brand-muted text-base px-3 flex items-center rounded-l">+91</span>
                  <input
                    required
                    type="tel"
                    pattern="[0-9]{10}"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter Your  mobile number"
                    className="flex-1 min-w-0 h-[38px] px-3 text-base text-brand-ink rounded-r focus:outline-none"
                  />
                </div>
                <button type="submit" className="h-[38px] sm:w-[188px] bg-brand-red hover:brightness-110 text-white text-base rounded">
                  Submit
                </button>
              </form>
            )}
            <div className="flex gap-3 mt-8">
              <a href={siteConfig.phoneCallUrl} className="px-5 py-2.5 border border-white rounded-md text-sm font-medium hover:bg-white hover:text-brand-blue">
                Call {siteConfig.phoneNumber}
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-black rounded-md text-sm font-medium hover:bg-black/80"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=700&q=75"
              alt="Himachal mountains"
              className="mx-auto w-full max-w-[420px] h-[230px] object-cover rounded-md shadow-lg"
            />
            <h3 className="text-[24px] md:text-[30px] font-medium mt-6">Himachal &amp; Spiti Specialists</h3>
          </div>
        </div>
      </section>

      {/* ---------- Top Selling Holiday Packages ---------- */}
      <section id="top-selling" className="py-12">
        <div className="container-bb">
          <SectionTitle light="Top Selling" bold="Holiday Packages" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
            {TRENDING_PACKAGES.map((p) => (
              <PackageCard
                key={p.title}
                pkg={{ title: p.title, imageUrl: p.image, durationNights: p.nights, durationDays: p.days }}
                onEnquire={() =>
                  enquire(`Package: ${p.title} (${p.nights}N/${p.days}D)`, [
                    { label: 'Package', value: p.title },
                    { label: 'Duration', value: `${p.nights} Nights / ${p.days} Days` },
                    { label: 'Route', value: p.route.join(' – ') },
                  ])
                }
              />
            ))}
            {tours.slice(0, 4).map((t) => (
              <PackageCard
                key={t.id}
                pkg={{
                  title: t.title,
                  imageUrl: t.imageUrl,
                  durationNights: t.durationNights,
                  durationDays: t.durationDays,
                  rating: t.rating,
                  href: `/tour/${t.slug}`,
                }}
                onEnquire={() => openInquiry(t)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Holiday Destinations In India ---------- */}
      <section id="destinations" className="bg-brand-cream py-12">
        <div className="container-bb">
          <SectionTitle light="Holiday" bold="Destinations In India" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[30px] gap-y-4">
            {DOMESTIC_TILES.map((t) => (
              <DestinationTile key={t.title} tile={t} onEnquire={() => enquire(`Holiday: ${t.title}`, [{ label: 'Destination', value: t.title }])} />
            ))}
          </div>
          <ViewMore href="/contact" />
        </div>
      </section>

      {/* ---------- International Holiday Destination ---------- */}
      <section className="bg-brand-cream py-12 mt-6">
        <div className="container-bb">
          <SectionTitle light="International" bold="Holiday Destination" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-[30px] gap-y-4">
            {INTERNATIONAL_TILES.map((t) => (
              <DestinationTile key={t.title} tile={t} onEnquire={() => enquire(`International: ${t.title}`, [{ label: 'Destination', value: t.title }])} />
            ))}
          </div>
          <ViewMore href="/contact" />
        </div>
      </section>

      {/* ---------- Luxury Packages ---------- */}
      <section className="py-4">
        <div className="container-bb grid md:grid-cols-2 gap-8 items-center">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=75"
            alt="Luxury resort"
            className="w-full max-w-[430px] h-[250px] object-cover rounded-[40%_60%_55%_45%/50%_45%_55%_50%]"
          />
          <div className="text-center">
            <SectionTitle light="Luxury" bold="Packages" className="!mb-6" />
            <p className="text-[28px] md:text-[42px] font-bold text-brand-ink uppercase leading-tight">Booking a luxury just a click away.</p>
            <button
              onClick={() => enquire('Luxury Holiday', [{ label: 'Interest', value: 'Luxury holiday package' }])}
              className="mt-6 px-6 py-2 rounded-md bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-bold"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Why Choose Us ---------- */}
      <section className="bg-brand-cream py-12">
        <div className="container-bb">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-14">
            <h2 className="text-[30px] md:text-[36px] text-[#ffcd00] md:w-[300px] shrink-0">Why Choose Us</h2>
            <span className="hidden md:block w-[3px] self-stretch bg-gradient-to-b from-brand-blue to-brand-orange" />
            <p className="text-[15px] text-brand-ink leading-relaxed">
              We treat our customers as our guests, and craft seamless, personalised and unforgettable journeys — navigating every detail so your trip is completely hassle-free.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div>
              {WHY_BLOCKS.map((b) => (
                <div key={b.title} className={`${b.color} text-white px-3 py-4`}>
                  <h3 className="text-xl mb-3">{b.title}</h3>
                  <p className="text-sm leading-[1.5]">{b.text}</p>
                </div>
              ))}
            </div>
            <div className="relative min-h-[300px] mx-0 md:mx-8">
              {WHY_IMAGES.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt="Travel with The Navigators"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === whyImage ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              <button
                onClick={() => setWhyImage((i) => (i - 1 + WHY_IMAGES.length) % WHY_IMAGES.length)}
                className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-brand-blue"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setWhyImage((i) => (i + 1) % WHY_IMAGES.length)}
                className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-brand-blue"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Trending trips with package pills ---------- */}
      <section className="py-16">
        <div className="container-bb">
          <div className="text-center mb-8">
            <h2 className="text-[32px] md:text-[46px] font-bold text-brand-ink leading-tight">Trending Tour Packages</h2>
            <p className="text-base text-brand-ink mt-2">Handcrafted mountain circuits with 24/7 on-tour support.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {FEATURED_TRIPS.map((t, i) => (
              <button
                key={t.tab}
                onClick={() => setTripTab(i)}
                className={`px-6 py-3 rounded-full text-sm border transition-colors ${
                  tripTab === i ? 'bg-[#1c2e6e] border-[#1c2e6e] text-white' : 'bg-white border-[#ccc] text-brand-ink hover:border-[#1c2e6e]'
                }`}
              >
                {t.tab}
              </button>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1fr_1fr_1.15fr] gap-5 items-start">
            {trip.images.map((src) => (
              <img key={src} src={src} alt={trip.title} className="hidden sm:block w-full h-[360px] object-cover" />
            ))}
            <div>
              <h3 className="text-[26px] md:text-[30px] font-bold text-brand-heading leading-tight">{trip.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {trip.tags.map((tag) => (
                  <span key={tag} className="bg-[#e9e9e9] text-[11px] text-brand-ink px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[15px] text-brand-ink leading-relaxed mt-5">{trip.text}</p>
              <div className="flex items-center justify-between mt-6 text-sm">
                <span className="font-semibold text-brand-ink">{trip.route}</span>
                <span className="italic text-brand-ink">{trip.duration}</span>
              </div>
              <button
                onClick={() =>
                  enquire(`Package: ${trip.title}`, [
                    { label: 'Package', value: trip.title },
                    { label: 'Duration', value: trip.duration },
                    { label: 'Route', value: trip.route },
                  ])
                }
                className="w-full mt-4 h-12 bg-[#f39237] hover:bg-brand-orangeDark text-white text-sm font-bold"
              >
                Get Quotes For This Package
              </button>
              <p className="text-[13px] text-brand-muted mt-3">
                24/7{' '}
                <a href={siteConfig.phoneCallUrl} className="text-brand-blue">
                  {siteConfig.phoneNumber}
                </a>{' '}
                ·{' '}
                <a href={`mailto:${siteConfig.emailAddress}`} className="text-brand-blue">
                  {siteConfig.emailAddress}
                </a>
              </p>
            </div>
          </div>
          <p className="text-center text-[13px] text-brand-muted mt-12">
            <b className="text-brand-ink">Specialists in:</b> Himachal Pradesh, Spiti Valley, Jammu &amp; Kashmir, Uttarakhand, Rajasthan
          </p>
        </div>
      </section>

      {/* ---------- Here for you ---------- */}
      <section className="bg-brand-cream py-12">
        <div className="container-bb">
          <h2 className="text-center text-[24px] md:text-[32px] font-light text-brand-ink mb-8">We navigate every detail and we are here for you</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-[#ddd] gap-y-8">
            {SERVICE_PILLARS.map((p, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <div key={p.title} className="text-center px-6">
                  <Icon className="w-11 h-11 mx-auto text-brand-orange" strokeWidth={1.3} />
                  <h3 className="text-sm text-brand-ink mt-3">{p.title}</h3>
                  <p className="text-[13px] text-[#999] mt-1 leading-snug">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <InquiryModal tour={selectedTourForInquiry} isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} />
      <QuoteRequestModal request={quote} onClose={() => setQuote(null)} />
    </div>
  );
}
