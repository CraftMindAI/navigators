'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Sparkles,
  Phone,
  Calendar,
  Users,
  Compass,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { TourPackage, Inquiry } from '@/types';
import { submitInquiry } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

interface InquiryModalProps {
  tour?: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ tour, isOpen, onClose }: InquiryModalProps) {
  const [formData, setFormData] = useState<Inquiry>({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    guestsCount: 2,
    message: '',
  });

  const [nights, setNights] = useState('4 Nights / 5 Days');
  const [destination, setDestination] = useState(tour?.title || 'Sikkim & Gangtok');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (tour?.title) {
      setDestination(tour.title);
    }
  }, [tour]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
      alert('Please check the verification box to proceed.');
      return;
    }
    setLoading(true);

    const payload: Inquiry = {
      ...formData,
      tourId: tour?.id,
      tourTitle: destination || 'Bespoke Travel Consultation',
      message: nights ? `Duration: ${nights}. ${formData.message}` : formData.message,
    };

    try {
      await submitInquiry(payload);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setCaptchaChecked(false);
      }, 3000);
    } catch (err: any) {
      alert('Failed to submit inquiry. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300">
      <div className="bg-midnight/95 backdrop-blur-2xl text-slate-200 w-full max-w-3xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col md:flex-row max-h-[92vh] border border-white/[0.12] animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 flex items-center justify-center transition-all duration-200"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Visual & Trust Pillars */}
        <div className="relative md:w-5/12 bg-midnightLight p-6 sm:p-8 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-white/[0.08]">
          {/* Subtle background image of destination */}
          <img
            src={tour?.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80'}
            alt="Escape Preview"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnightLight via-midnightLight/80 to-midnightLight/60 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaryCyan/20 text-primaryCyan text-[10px] font-bold uppercase tracking-wider mb-4 border border-primaryCyan/30">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Bespoke Holiday Concierge</span>
            </div>

            <h3 className="editorial-heading text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              Craft Your Dream Itinerary
            </h3>

            <p className="text-xs text-slate-300 font-light leading-relaxed mb-6">
              Connect directly with our dedicated travel coordinators for exclusive rates, customized hotel upgrades, and tailored itineraries.
            </p>

            {tour && (
              <div className="p-3.5 rounded-2xl bg-midnight/80 border border-white/[0.1] backdrop-blur-md mb-6">
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest block mb-1">
                  Selected Package
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-1">{tour.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                  <span className="text-primaryCyan font-semibold">₹{tour.price.toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>{tour.durationNights}N / {tour.durationDays}D</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-2 pt-4 border-t border-white/[0.08] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free Custom Quotation</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <span>Guaranteed 15-Minute Response</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:w-7/12 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-center">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-white">Inquiry Received</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto font-light leading-relaxed">
                Thank you! Our destination specialist is preparing your customized quotation and will reach out promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Traveler Details</h4>
                <p className="text-xs text-slate-400 mb-4 font-light">Tell us who is traveling and when.</p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Roy"
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>
              </div>

              {/* Email & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Travelers</label>
                  <select
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 2 })}
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan transition-colors"
                  >
                    <option value={1}>Solo Traveler (1 Person)</option>
                    <option value={2}>Couple / 2 Persons</option>
                    <option value={4}>Small Family (3-4 Persons)</option>
                    <option value={6}>Group / Family (5+ Persons)</option>
                  </select>
                </div>
              </div>

              {/* Destination & Travel Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Sikkim, Kashmir, Bali"
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Expected Date</label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>
              </div>

              {/* Human verification check */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-midnight border border-white/[0.08] hover:border-white/[0.15] transition-colors">
                  <input
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={(e) => setCaptchaChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-primaryCyan border-white/[0.2] bg-midnight focus:ring-primaryCyan cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    I am requesting custom itinerary pricing from The Navigators
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-cyanGlow transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>REQUEST TAILORED QUOTE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <a
                  href={siteConfig.phoneCallUrl}
                  className="text-[11px] text-slate-400 hover:text-primaryCyan transition-colors"
                >
                  Need instant answers? Speak with concierge at <span className="font-bold text-white">{siteConfig.phoneNumber}</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
