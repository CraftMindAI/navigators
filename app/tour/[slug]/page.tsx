'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTourBySlug, submitInquiry } from '@/lib/supabase';
import { TourPackage } from '@/types';
import InquiryModal from '@/components/InquiryModal';
import SectionTitle from '@/components/SectionTitle';
import {
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  Hotel,
  Utensils,
  Car,
  Compass,
  ChevronDown,
  ChevronRight,
  Phone,
  Send,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

const panelCls = 'bg-white p-5 sm:p-6 rounded-sm border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)]';
const inputCls =
  'w-full bg-white border border-[#ccc] rounded-sm px-3 py-2 text-sm text-brand-ink placeholder-[#6c757d] focus:outline-none focus:border-brand-blue transition-colors';
const labelCls = 'block text-sm font-medium text-brand-blue mb-1';

const INCLUDED = [
  { Icon: Hotel, title: '4★ / 5★ Stays', sub: 'Verified Luxury' },
  { Icon: Utensils, title: 'Daily Meals', sub: 'Breakfast & Dinner' },
  { Icon: Car, title: 'Private Chauffeur', sub: 'Dedicated Vehicle' },
  { Icon: Compass, title: 'Guided Tours', sub: 'All Major Spots' },
];

export default function TourDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(1);

  // Quick Inline Lead Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    async function loadTour() {
      if (slug) {
        const data = await getTourBySlug(slug);
        setTour(data);
      }
      setLoading(false);
    }
    loadTour();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-brand-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-brand-muted">Loading Itinerary & Package Details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-brand-cream py-24 px-4 text-center text-brand-ink">
        <div className="max-w-md mx-auto bg-white border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] p-8 rounded-sm">
          <h2 className="text-[26px] leading-tight mb-3">
            <span className="font-light text-brand-gray">Tour Package</span> <span className="font-bold text-brand-orange">Not Found</span>
          </h2>
          <p className="text-sm text-brand-ink mb-6">
            The requested journey may have been relocated or updated in our catalog.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Packages</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleInlineInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitInquiry({
      name,
      email: '',
      phone,
      tourId: tour.id,
      tourTitle: tour.title,
      travelDate,
      guestsCount: 2,
    });
    setFormMsg(res.message);
    setSubmitting(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="bg-brand-cream text-brand-ink text-sm min-h-screen pb-14">
      {/* Hero Banner */}
      <div className="relative min-h-[300px] sm:h-[380px] pt-20 overflow-hidden flex flex-col justify-end">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Legibility Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 container-bb pb-8">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-white/85 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/#packages" className="hover:text-white transition-colors">
              Holiday Packages
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{tour.category || 'Featured'}</span>
          </nav>

          <h1 className="text-[24px] sm:text-[30px] md:text-[34px] font-medium text-white leading-tight mb-3 max-w-4xl">
            {tour.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-white/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="capitalize">{tour.location.replace(/tourpackage|-tour-packages|tour-packages/gi, '').replace(/-/g, ' ')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{tour.durationNights} Nights / {tour.durationDays} Days</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{tour.rating || 5.0} Rating</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Tailor-Made</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-bb pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[30px]">
          {/* Left Column: Details, Highlights, Itinerary */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className={panelCls}>
                <SectionTitle light="Curated" bold="Highlights" className="!text-left !mb-5" />
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-brand-ink">
                      <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inclusions */}
            <div className={panelCls}>
              <SectionTitle light="What's" bold="Included" className="!text-left !mb-5" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 mb-5 pb-5 border-b border-[#ddd] sm:divide-x divide-[#ddd]">
                {INCLUDED?.map(({ Icon, title, sub }) => (
                  <div key={title} className="text-center px-2">
                    <Icon className="w-9 h-9 text-brand-orange mx-auto mb-2" strokeWidth={1.3} />
                    <span className="block text-sm font-medium text-brand-ink">{title}</span>
                    <span className="text-[13px] text-[#999]">{sub}</span>
                  </div>
                ))}
              </div>

              {tour.inclusions && tour.inclusions.length > 0 && (
                <ul className="space-y-2">
                  {tour.inclusions?.map((inc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-brand-ink">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-[3px]" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Day Wise Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className={panelCls}>
                <SectionTitle light="Day-by-Day" bold="Itinerary" className="!text-left !mb-5" />

                <div className="space-y-2.5">
                  {tour.itinerary?.map((item) => (
                    <div key={item.day} className="border border-[#ddd] rounded-sm overflow-hidden bg-white">
                      <button
                        onClick={() => setActiveDay(activeDay === item.day ? null : item.day)}
                        className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${
                          activeDay === item.day ? 'bg-brand-blueLight' : 'hover:bg-brand-cream'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0 bg-brand-blue text-white text-[13px] font-medium px-2.5 py-1 rounded-sm">
                            Day {item.day}
                          </span>
                          <span className="font-medium text-sm text-brand-ink">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 flex-shrink-0 text-brand-muted transition-transform duration-200 ${
                            activeDay === item.day ? 'rotate-180 text-brand-blue' : ''
                          }`}
                        />
                      </button>

                      {activeDay === item.day && (
                        <div className="px-4 py-3 text-sm text-brand-ink leading-[1.7] border-t border-[#ddd]">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Price + Sticky Quick Inquiry Box */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className={`${panelCls} !p-0`}>
              <div className="p-5">
                <span className="block text-[13px] text-brand-muted">Starting Package Price</span>
                <div className="flex items-baseline gap-2.5 my-1">
                  <span className="text-[28px] font-bold text-brand-orange">₹{tour.price.toLocaleString('en-IN')}</span>
                  {tour.originalPrice && (
                    <span className="text-sm text-brand-muted line-through">₹{tour.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <span className="text-[13px] text-brand-muted">per person • inclusive of taxes</span>
              </div>
              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                className="w-full h-12 bg-[#f39237] hover:bg-brand-orangeDark text-white text-sm font-bold transition-colors"
              >
                Book This Itinerary
              </button>
            </div>

            <div className="bg-white rounded-sm border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] lg:sticky lg:top-24">
              <div className="bg-brand-blue text-white px-5 py-3 rounded-t-sm">
                <h3 className="text-base font-medium">Get an Instant Free Quote</h3>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-brand-muted mb-4">
                  Discuss dates, hotel upgrades, and customized stops with our senior travel coordinator.
                </p>

                {formMsg ? (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm mb-4">{formMsg}</div>
                ) : (
                  <form onSubmit={handleInlineInquiry} className="space-y-3.5">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vikram Singhania"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Expected Travel Date</label>
                      <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className={inputCls} />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-[42px] rounded-sm bg-brand-blue hover:bg-brand-blueDark disabled:opacity-70 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Callback</span>
                    </button>
                  </form>
                )}

                <div className="mt-5 pt-4 border-t border-[#ddd] flex flex-wrap items-center justify-center gap-1.5 text-[13px] text-brand-muted">
                  <Phone className="w-4 h-4 text-brand-orange" strokeWidth={1.5} />
                  <span>Direct Line:</span>
                  <a href={siteConfig.phoneCallUrl} className="font-medium text-brand-blue hover:underline">
                    {siteConfig.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        tour={tour}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </div>
  );
}
