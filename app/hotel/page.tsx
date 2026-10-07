'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Minus,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { getHotelBySlug, getHotelItinerary, submitInquiry } from '@/lib/supabase';
import { HOTEL_REGIONS, type Hotel, type HotelItineraryDay } from '@/types';
import SectionTitle from '@/components/SectionTitle';
import { addDays, daysBetween, todayISO } from '@/components/booking/fields';
import { siteConfig } from '@/config/siteConfig';

const panelCls = 'bg-white p-5 sm:p-6 rounded-sm border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)]';
const inputCls =
  'w-full bg-white border border-[#ccc] rounded-sm px-3 py-2 text-sm text-brand-ink placeholder-[#6c757d] focus:outline-none focus:border-brand-blue transition-colors';
const labelCls = 'block text-sm font-medium text-brand-blue mb-1';

const BOOKING_ID = 'book';

function scrollToBooking() {
  document.getElementById(BOOKING_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Stars({ count, className = 'w-3.5 h-3.5' }: { count: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} star hotel`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${className} ${i < count ? 'fill-amber-400 text-amber-400' : 'text-white/40'}`} />
      ))}
    </span>
  );
}

/** Booking request form. Submits as a lead so it shows up in Admin → Lead Inquiries. */
function HotelBookingForm({ hotel }: { hotel: Hotel }) {
  const today = todayISO();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState('');

  const nights = checkIn && checkOut ? daysBetween(checkIn, checkOut) : 0;
  const estimate = nights > 0 ? nights * rooms * hotel.pricePerNight : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (checkIn && checkOut && nights < 1) return setError('Check out must be after Check in.');

    setSubmitting(true);
    const details = [
      `Hotel: ${hotel.name} (${hotel.location})`,
      `Check in: ${checkIn || 'Flexible'}`,
      `Check out: ${checkOut || 'Flexible'}`,
      nights > 0 ? `Nights: ${nights}` : null,
      `Rooms: ${rooms}`,
      `Guests: ${guests}`,
      estimate > 0 ? `Estimated: ₹${estimate.toLocaleString('en-IN')}` : null,
    ].filter(Boolean);

    const res = await submitInquiry({
      name,
      phone,
      email,
      tourTitle: `Hotel Booking: ${hotel.name}`,
      travelDate: checkIn || undefined,
      guestsCount: guests,
      message: details.join('\n'),
    });
    setSubmitting(false);
    setDone(res.message);
  };

  if (done) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{done}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-3.5">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone / WhatsApp *</label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Check In</label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value && (!checkOut || checkOut <= e.target.value)) setCheckOut(addDays(e.target.value, 1));
            }}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Check Out</label>
          <input type="date" min={checkIn ? addDays(checkIn, 1) : today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Rooms</label>
          <input type="number" min={1} max={20} value={rooms} onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Guests</label>
          <input type="number" min={1} max={60} value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} />
        </div>
      </div>

      {estimate > 0 && (
        <p className="text-[13px] text-brand-muted">
          Estimated: <span className="font-bold text-brand-orange">₹{estimate.toLocaleString('en-IN')}</span> for {nights} night{nights > 1 ? 's' : ''} × {rooms} room{rooms > 1 ? 's' : ''}
        </p>
      )}

      {error && <p className="text-[13px] text-brand-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full h-[42px] rounded-sm bg-[#f39237] hover:bg-brand-orangeDark disabled:opacity-70 text-white text-sm font-bold transition-colors flex items-center justify-center gap-1.5`}
      >
        <Send className="w-3.5 h-3.5" />
        <span>{submitting ? 'Sending...' : 'Book Now'}</span>
      </button>
    </form>
  );
}

/** Day-wise itinerary timeline: dotted pin markers joined by a line, each day expandable. */
function ItineraryTimeline({ days }: { days: HotelItineraryDay[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(days.length ? [days[0].dayNumber] : []));
  const allOpen = open.size === days.length;

  const toggle = (day: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  return (
    <div className={panelCls}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-[22px] font-bold text-brand-ink">
          Itinerary <span className="font-normal text-brand-muted text-lg">(Day Wise)</span>
        </h2>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(days?.map((d) => d.dayNumber)))}
          className="text-sm text-brand-blue hover:underline"
        >
          {allOpen ? 'Collapse all days' : 'View all days'}
        </button>
      </div>

      <ol>
        {days?.map((d, i) => {
          const isOpen = open.has(d.dayNumber);
          const isLast = i === days.length - 1;
          return (
            <li key={d.dayNumber} className="relative flex gap-4">
              {/* Marker + connecting line */}
              <div className="relative flex flex-col items-center shrink-0 w-10">
                <span
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                    isOpen ? 'bg-brand-blue text-white' : 'bg-white text-brand-blue border-2 border-dashed border-brand-blue'
                  }`}
                >
                  <MapPin className="w-4 h-4" fill={isOpen ? 'currentColor' : 'none'} />
                </span>
                {!isLast && <span className="flex-1 w-[3px] bg-brand-blue" />}
              </div>

              <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-6'}`}>
                <button type="button" onClick={() => toggle(d.dayNumber)} className="w-full flex items-start justify-between gap-3 text-left" aria-expanded={isOpen}>
                  <span className="min-w-0">
                    <span className="block text-[12px] text-brand-muted">
                      Day {d.dayNumber}
                      {d.location ? ` / (${d.location})` : ''}
                    </span>
                    <span className="block text-[16px] font-semibold text-brand-ink leading-snug">
                      {d.title}
                      {d.nights ? (
                        <span className="font-normal text-[13px] text-brand-muted">
                          {' '}
                          ({d.nights} Night{d.nights > 1 ? 's' : ''})
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full border-2 border-brand-navy text-brand-navy flex items-center justify-center mt-1">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (d.description || d.meals) && (
                  <div className="mt-3 pt-3 border-t border-[#e5e5e5] text-sm text-brand-ink leading-[1.7] space-y-3">
                    {d.description && <p>{d.description}</p>}
                    {d.meals && <p>{d.meals}</p>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function HotelDetail() {
  const slug = useSearchParams().get('slug') || '';
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [itinerary, setItinerary] = useState<HotelItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = slug ? await getHotelBySlug(slug) : null;
      const days = data?.id ? await getHotelItinerary(data.id) : [];
      if (cancelled) return;
      setHotel(data);
      setItinerary(days);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-brand-muted">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-brand-cream py-24 px-4 text-center text-brand-ink">
        <div className="max-w-md mx-auto bg-white border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] p-8 rounded-sm">
          <h2 className="text-[26px] leading-tight mb-3">
            <span className="font-light text-brand-gray">Hotel</span> <span className="font-bold text-brand-orange">Not Found</span>
          </h2>
          <p className="text-sm text-brand-ink mb-6">This hotel may have been removed or renamed.</p>
          <Link
            href="/hotels/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Hotels</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream text-brand-ink text-sm min-h-screen pb-14">
      {/* Hero */}
      <div className="relative min-h-[340px] sm:h-[420px] pt-20 overflow-hidden flex flex-col justify-end">
        <img src={hotel.imageUrl} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />

        <div className="relative z-10 container-bb pb-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-white/85 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/hotels/" className="hover:text-white transition-colors">Hotels</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{hotel.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Stars count={hotel.starRating} />
                {hotel.isFeatured && <span className="bg-brand-blue text-white text-[12px] font-medium px-2 py-0.5">Featured</span>}
              </div>
              <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-medium text-white leading-tight mb-2">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-white/90">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {hotel.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {HOTEL_REGIONS.find((r) => r.value === hotel.region)?.label}
                </span>
              </div>
            </div>

            {/* Book above */}
            <div className="bg-white/95 rounded-sm px-5 py-4 flex items-center gap-5 shrink-0 self-start md:self-auto">
              <div>
                <span className="block text-[12px] text-brand-muted">Starting from</span>
                <span className="text-[24px] font-bold text-brand-orange">₹{hotel.pricePerNight.toLocaleString('en-IN')}</span>
                {hotel.originalPrice ? (
                  <s className="text-[13px] text-brand-muted ml-1.5">₹{hotel.originalPrice.toLocaleString('en-IN')}</s>
                ) : null}
                <span className="block text-[12px] text-brand-muted">per room / night</span>
              </div>
              <button
                type="button"
                onClick={scrollToBooking}
                className="h-11 px-6 rounded-sm bg-[#f39237] hover:bg-brand-orangeDark text-white text-sm font-bold transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-bb pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[30px]">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {hotel.description && (
              <div className={panelCls}>
                <SectionTitle light="About" bold="This Hotel" className="!text-left !mb-4" />
                <p className="text-sm leading-[1.8] whitespace-pre-line">{hotel.description}</p>
              </div>
            )}

            {hotel.amenities.length > 0 && (
              <div className={panelCls}>
                <SectionTitle light="Hotel" bold="Amenities" className="!text-left !mb-5" />
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotel.amenities?.map((a) => (
                    <li key={a} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {itinerary.length > 0 && <ItineraryTimeline days={itinerary} />}
          </div>

          {/* Sticky quick booking */}
          <div id={BOOKING_ID} className="scroll-mt-24">
            <div className="bg-white rounded-sm border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] lg:sticky lg:top-24">
              <div className="bg-brand-blue text-white px-5 py-3 rounded-t-sm">
                <h3 className="text-base font-medium">Quick Booking</h3>
              </div>
              <div className="p-5">
                <HotelBookingForm hotel={hotel} />
                <div className="mt-5 pt-4 border-t border-[#ddd] flex flex-wrap items-center justify-center gap-1.5 text-[13px] text-brand-muted">
                  <Phone className="w-4 h-4 text-brand-orange" strokeWidth={1.5} />
                  <span>Call us:</span>
                  <a href={siteConfig.phoneCallUrl} className="font-medium text-brand-blue hover:underline">
                    {siteConfig.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelDetailPage() {
  // useSearchParams needs a Suspense boundary in a statically exported page
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HotelDetail />
    </Suspense>
  );
}
