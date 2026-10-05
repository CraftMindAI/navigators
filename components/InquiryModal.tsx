'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Clock } from 'lucide-react';
import { TourPackage, Inquiry } from '@/types';
import { submitInquiry } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

interface InquiryModalProps {
  tour?: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full bg-white border border-[#ccc] rounded-sm px-3 py-2 text-sm text-brand-ink placeholder-[#6c757d] focus:outline-none focus:border-brand-blue transition-colors';
const labelCls = 'block text-sm font-medium text-brand-blue mb-1';

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
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300">
      <div className="bg-white text-brand-ink text-sm w-full max-w-[640px] rounded shadow-[0_4px_20px_rgba(0,0,0,0.25)] overflow-hidden relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
        {/* Header bar */}
        <div className="bg-brand-blue text-white px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-medium leading-tight">Craft Your Dream Itinerary</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 -mr-1.5 flex items-center justify-center text-white/90 hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-medium text-brand-ink">Inquiry Received</h4>
              <p className="text-sm text-brand-muted max-w-xs mx-auto leading-relaxed">
                Thank you! Our destination specialist is preparing your customized quotation and will reach out promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-brand-muted">
                Connect directly with our dedicated travel coordinators for exclusive rates, customized hotel upgrades, and tailored itineraries.
              </p>

              {tour && (
                <div className="flex items-center gap-3 border border-[#ddd] rounded-sm p-2.5 bg-brand-cream">
                  <img src={tour.imageUrl} alt={tour.title} className="w-16 h-12 object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[13px] text-brand-muted">Selected Package</span>
                    <h4 className="text-sm font-medium text-brand-ink line-clamp-1">{tour.title}</h4>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="text-brand-orange">₹{tour.price.toLocaleString('en-IN')}</span>
                      <span className="text-brand-muted">•</span>
                      <span className="text-brand-muted">
                        {tour.durationNights}N / {tour.durationDays}D
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Roy"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Email & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Travelers</label>
                  <select
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 2 })}
                    className={inputCls}
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
                  <label className={labelCls}>Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Sikkim, Kashmir, Bali"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Expected Date</label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Human verification check */}
              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-sm border border-[#ccc] hover:border-brand-blue transition-colors">
                <input
                  type="checkbox"
                  checked={captchaChecked}
                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                  className="w-4 h-4 accent-brand-blue cursor-pointer flex-shrink-0"
                />
                <span className="text-[13px] text-brand-ink">I am requesting custom itinerary pricing from The Navigators</span>
              </label>

              {/* Submit CTA */}
              <div className="text-center pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center w-full sm:w-auto min-w-[180px] h-[45px] px-8 rounded-full bg-brand-blue hover:bg-brand-blueDark disabled:opacity-70 text-white text-[15px] font-medium transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Request Tailored Quote</span>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-orange" strokeWidth={1.5} />
                  100% Free Custom Quotation
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-orange" strokeWidth={1.5} />
                  Guaranteed 15-Minute Response
                </span>
              </div>

              <div className="text-center border-t border-[#ddd] pt-3">
                <a href={siteConfig.phoneCallUrl} className="text-[13px] text-brand-muted hover:text-brand-blue transition-colors">
                  Need instant answers? Speak with concierge at <span className="font-medium text-brand-blue">{siteConfig.phoneNumber}</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
