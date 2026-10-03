'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Facebook,
  Instagram,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { subscribeNewsletter } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const res = await subscribeNewsletter(email);
    setSubStatus(res);
    setSubmitting(false);
    setEmail('');
  };

  return (
    <footer className="bg-[#03070d] text-slate-300 pt-16 sm:pt-20 pb-8 sm:pb-12 border-t border-white/[0.08] relative z-20 overflow-hidden">
      {/* Subtle backdrop ambient light */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/Navigator.png"
                alt="The Navigators"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-light">
              The Navigators is a premier travel agency dedicated to orchestrating bespoke holiday expeditions across India and exotic international frontiers. From the peaks of Sikkim to the shores of Andaman & Bali, we redefine journeying.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-primaryCyan hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-primaryCyan hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Need Assistance / Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.08] pb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-primaryCyan" />
              <span>Travel Concierge</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">24/7 Customer Care:</span>
                  <a href={siteConfig.phoneCallUrl} className="hover:text-primaryCyan transition-colors font-medium text-slate-300">
                    {siteConfig.phoneNumber}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Email Inquiries:</span>
                  <a href={`mailto:${siteConfig.emailAddress}`} className="hover:text-primaryCyan transition-colors font-medium text-slate-300">
                    {siteConfig.emailAddress}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Headquarters:</span>
                  <span className="font-light text-slate-300">{siteConfig.headOfficeAddress}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Escapes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.08] pb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Popular Escapes</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/location/sikkim-tour-package" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Sikkim & Gangtok Holidays
                </Link>
              </li>
              <li>
                <Link href="/location/kashmir-tour-package" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Kashmir Paradise Honeymoons
                </Link>
              </li>
              <li>
                <Link href="/location/darjeeling-tour-packages" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Darjeeling Tea Hills Tours
                </Link>
              </li>
              <li>
                <Link href="/location/kerala-tour-packages" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Kerala Houseboat Escapes
                </Link>
              </li>
              <li>
                <Link href="/location/andaman-tour-package" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Andaman Islands Diving Packages
                </Link>
              </li>
              <li>
                <Link href="/location/bhutan-tour-packages" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Bhutan Kingdom Expeditions
                </Link>
              </li>
              <li>
                <Link href="/location/bali-tour-packages" className="hover:text-primaryCyan transition-colors text-slate-400 hover:underline">
                  Bali Island Luxury Retreats
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.08] pb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-primaryCyan" />
              <span>Wanderlust Journal</span>
            </h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Subscribe to receive curated itineraries, private travel discounts, and insider seasonal recommendations.
            </p>

            {subStatus?.success ? (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs flex items-center gap-2 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{subStatus.message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center bg-midnight border border-white/[0.1] rounded-xl overflow-hidden p-1 focus-within:border-primaryCyan transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full bg-transparent text-xs text-white px-3 py-2 placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primaryCyan hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1 shadow-glow"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Join</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>No spam. 100% Privacy guaranteed.</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} The Navigators — Travel Beyond Borders. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400">
            <Link href="/" className="hover:text-primaryCyan transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primaryCyan transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-primaryCyan transition-colors">Cancellation & Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
