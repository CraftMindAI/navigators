'use client';

import React from 'react';
import {
  Star,
  Quote,
  Award,
  ShieldCheck,
  HeartHandshake,
  Headphones,
  CheckCircle2,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Review } from '@/types';

const TESTIMONIALS: Review[] = [
  {
    id: 'r1',
    author: 'Rajesh Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    comment: 'Our family tour to Sikkim organized by The Navigators was utterly seamless. From the private chauffeur who navigated foggy mountain roads to the breathtaking Kanchenjunga view hotel in Pelling, their 24/7 attention to detail was exceptional.',
    tourName: 'Sikkim & Gangtok Odyssey',
    date: 'February 2026'
  },
  {
    id: 'r2',
    author: 'Priya & Ankit Roy',
    location: 'Kolkata, West Bengal',
    rating: 5,
    comment: 'Booked our honeymoon to Kashmir through The Navigators. The luxury heritage houseboat on Dal Lake, VIP Gulmarg Gondola coordination, and candle-lit Shikara ride made it the most romantic trip of our lives.',
    tourName: 'Kashmir Paradise Honeymoon',
    date: 'January 2026'
  },
  {
    id: 'r3',
    author: 'Sunil Nair',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    comment: 'The Navigators delivered complete peace of mind during our Bhutan journey. Zero hidden costs, fast SDF permits clearance, top-tier guides, and authentic cultural immersion. Simply the best travel agency we have encountered.',
    tourName: 'Bhutan Himalayan Sanctuary',
    date: 'December 2025'
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-24 bg-midnight text-white relative overflow-hidden border-t border-white/[0.06]">
      {/* Ambient decorative lighting */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Why Choose The Navigators - Luxury Concierge Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 hover:border-primaryCyan/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primaryCyan/10 border border-primaryCyan/30 text-primaryCyan flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">100% Verified Stays</h4>
              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                Curated 4★ & 5★ boutique hotels, private villas & heritage houseboats.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 hover:border-gold/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Direct Value Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                Direct operator pricing with zero hidden surcharges or surprise fees.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 hover:border-emerald-400/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Bespoke Customization</h4>
              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                Every itinerary is handcrafted around your schedule, budget & vibe.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 hover:border-blue-400/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">24/7 Dedicated Concierge</h4>
              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                Personal tour manager assisting your trip in real-time from start to finish.
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
              Guest Experiences & Reviews
            </span>
          </div>

          <h2 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Memories Made with The Navigators
          </h2>

          <p className="text-slate-300 text-sm sm:text-base mt-3 font-light">
            Real feedback from discerning travelers who explored domestic sanctuaries and world wonders in unparalleled comfort.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="glass-card p-6 sm:p-7 rounded-3xl relative flex flex-col justify-between border border-white/[0.08] hover:border-primaryCyan/40 transition-all duration-300"
            >
              <Quote className="w-9 h-9 text-primaryCyan/15 absolute top-5 right-5 pointer-events-none" />

              <div>
                {/* 5-Star Row & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <UserCheck className="w-3 h-3" />
                    <span>Verified Guest</span>
                  </span>
                </div>

                <p className="text-slate-200 text-sm leading-relaxed mb-6 font-light italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{item.author}</h4>
                  <span className="text-xs text-primaryCyan font-medium">{item.location}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    {item.tourName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
