'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTourBySlug, submitInquiry } from '@/lib/supabase';
import { TourPackage } from '@/types';
import InquiryModal from '@/components/InquiryModal';
import {
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Hotel,
  Utensils,
  Car,
  Compass,
  Calendar,
  ChevronDown,
  Phone,
  Send,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Award,
  Users
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

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
      <div className="min-h-screen bg-midnight text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primaryCyan border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading Itinerary & Package Details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-midnight py-24 px-4 text-center text-white">
        <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-3">Tour Package Not Found</h2>
          <p className="text-slate-400 text-xs mb-6 font-light">
            The requested journey may have been relocated or updated in our catalog.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primaryCyan text-white font-bold text-xs shadow-glow"
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
    <div className="bg-midnight text-white min-h-screen pb-20">
      {/* Luxury Hero Banner */}
      <div className="relative h-[480px] sm:h-[540px] lg:h-[600px] overflow-hidden flex flex-col justify-end">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Deep Multi-layer Darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-midnight/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/80 via-transparent to-midnight/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12 w-full">
          {/* Breadcrumb Back Link */}
          <Link
            href="/#packages"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-primaryCyan mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Curated Packages</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-primaryCyan/20 text-primaryCyan text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-primaryCyan/30">
                  {tour.category || 'Featured'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.1]">
                  <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
                  <span className="capitalize">{tour.location.replace(/tourpackage|-tour-packages|tour-packages/gi, '').replace(/-/g, ' ')}</span>
                </span>
              </div>

              <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {tour.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 bg-midnight/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.1]">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>{tour.durationNights} Nights / {tour.durationDays} Days</span>
                </span>
                <span className="flex items-center gap-1.5 bg-midnight/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.1]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{tour.rating || 5.0} Rating</span>
                </span>
                <span className="flex items-center gap-1.5 bg-midnight/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.1]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Tailor-Made</span>
                </span>
              </div>
            </div>

            {/* Quick Price Banner Card */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/[0.12] flex flex-col items-end min-w-[280px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Starting Package Price
              </span>
              <div className="flex items-baseline gap-2.5 my-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  ₹{tour.price.toLocaleString('en-IN')}
                </span>
                {tour.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{tour.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mb-3">per person • inclusive of taxes</span>

              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-cyanGlow transition-all duration-300"
              >
                Book This Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Left Column: Details, Highlights, Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
                <h3 className="editorial-heading text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <span>Curated Highlights</span>
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-light">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inclusions */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
              <h3 className="editorial-heading text-xl sm:text-2xl font-bold text-white mb-4">
                What's Included in Your Voyage
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 pb-6 border-b border-white/[0.08]">
                <div className="p-3 rounded-2xl bg-white/[0.03] text-center border border-white/[0.06]">
                  <Hotel className="w-5 h-5 text-primaryCyan mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-white">4★ / 5★ Stays</span>
                  <span className="text-[10px] text-slate-400">Verified Luxury</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] text-center border border-white/[0.06]">
                  <Utensils className="w-5 h-5 text-primaryCyan mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-white">Daily Meals</span>
                  <span className="text-[10px] text-slate-400">Breakfast & Dinner</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] text-center border border-white/[0.06]">
                  <Car className="w-5 h-5 text-primaryCyan mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-white">Private Chauffeur</span>
                  <span className="text-[10px] text-slate-400">Dedicated Vehicle</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] text-center border border-white/[0.06]">
                  <Compass className="w-5 h-5 text-primaryCyan mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-white">Guided Tours</span>
                  <span className="text-[10px] text-slate-400">All Major Spots</span>
                </div>
              </div>

              {tour.inclusions && tour.inclusions.length > 0 && (
                <ul className="space-y-2">
                  {tour.inclusions.map((inc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Day Wise Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
                <h3 className="editorial-heading text-xl sm:text-2xl font-bold text-white mb-6">
                  Day-by-Day Journey Plan
                </h3>

                <div className="space-y-3.5">
                  {tour.itinerary.map((item) => (
                    <div
                      key={item.day}
                      className="border border-white/[0.08] rounded-2xl overflow-hidden bg-midnight/60 transition-colors"
                    >
                      <button
                        onClick={() => setActiveDay(activeDay === item.day ? null : item.day)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-primaryCyan/20 text-primaryCyan font-bold text-xs flex items-center justify-center border border-primaryCyan/30">
                            {item.day}
                          </span>
                          <span className="font-bold text-sm text-white">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            activeDay === item.day ? 'rotate-180 text-primaryCyan' : ''
                          }`}
                        />
                      </button>

                      {activeDay === item.day && (
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-light border-t border-white/[0.06]">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Quick Inquiry Box */}
          <div>
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.12] shadow-2xl sticky top-24">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaryCyan/10 text-primaryCyan text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Express Quotation</span>
              </div>
              <h3 className="editorial-heading text-xl font-bold text-white mb-1">
                Get an Instant Free Quote
              </h3>
              <p className="text-xs text-slate-400 mb-5 font-light">
                Discuss dates, hotel upgrades, and customized stops with our senior travel coordinator.
              </p>

              {formMsg ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl mb-4">
                  {formMsg}
                </div>
              ) : (
                <form onSubmit={handleInlineInquiry} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Expected Travel Date</label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-cyanGlow transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Callback</span>
                  </button>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-center gap-2 text-xs text-slate-300">
                <Phone className="w-4 h-4 text-primaryCyan" />
                <span>Direct Line: </span>
                <a href={siteConfig.phoneCallUrl} className="font-bold text-white hover:text-primaryCyan transition-colors">
                  {siteConfig.phoneNumber}
                </a>
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
