'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { submitInquiry } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

export interface QuoteRequest {
  /** Short heading stored as the inquiry title, e.g. "Flight: DEL → SXR (Round Trip)". */
  title: string;
  /** Human-readable rows shown to the user and saved in the inquiry message. */
  summary: { label: string; value: string }[];
  travelDate?: string;
  guests?: number;
}

export default function QuoteRequestModal({ request, onClose }: { request: QuoteRequest | null; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!request) return null;

  const summaryText = request.summary.map((s) => `${s.label}: ${s.value}`).join('\n');

  const close = () => {
    setDone(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitInquiry({
      name,
      phone,
      email,
      tourTitle: request.title.slice(0, 250),
      travelDate: request.travelDate,
      guestsCount: request.guests,
      message: summaryText,
    });
    setLoading(false);
    setDone(true);
  };

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hi The Navigators, I'd like a quote.\n${request.title}\n${summaryText}`
  )}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-3 sm:p-5" onClick={close}>
      <div
        className="bg-white w-full max-w-lg rounded-lg shadow-widget overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-brand-blue text-white">
          <h3 className="font-bold text-base sm:text-lg">{done ? 'Request received' : 'Get the best fare'}</h3>
          <button onClick={close} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="rounded bg-brand-blueLight border border-brand-blue/20 p-3.5 mb-5">
            <p className="font-medium text-brand-heading text-sm mb-1.5">{request.title}</p>
            <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
              {request.summary.map((s) => (
                <React.Fragment key={s.label}>
                  <dt className="text-slate-500">{s.label}</dt>
                  <dd className="text-brand-ink font-semibold">{s.value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>

          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-bold text-brand-navy mb-1">Thank you, {name.split(' ')[0] || 'traveller'}!</p>
              <p className="text-sm text-slate-600 mb-5">
                Our travel desk will call you shortly with live fares and availability.
              </p>
              <button onClick={close} className="px-8 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orangeDark text-white font-bold text-sm">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-slate-600">
                Share your contact details and our travel desk will confirm live fares & availability within minutes.
              </p>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-md border border-brand-line px-3.5 py-2.5 text-sm text-brand-ink placeholder-slate-400 focus:outline-none focus:border-brand-blue"
              />
              <input
                required
                type="tel"
                pattern="[0-9+\s-]{8,15}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
                className="w-full rounded-md border border-brand-line px-3.5 py-2.5 text-sm text-brand-ink placeholder-slate-400 focus:outline-none focus:border-brand-blue"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-md border border-brand-line px-3.5 py-2.5 text-sm text-brand-ink placeholder-slate-400 focus:outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-base disabled:opacity-70"
              >
                {loading ? 'Sending…' : 'Request Callback'}
              </button>
              <div className="flex gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={siteConfig.phoneCallUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-brand-orange text-brand-orange text-sm font-semibold hover:bg-brand-orangeLight"
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
