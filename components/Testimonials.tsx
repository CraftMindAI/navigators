'use client';

import React from 'react';
import {
  Star,
  Quote,
  Award,
  ShieldCheck,
  HeartHandshake,
  Headphones,
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
    <section className="py-16 sm:py-20 bg-brand-cream text-brand-ink relative overflow-hidden border-t border-brand-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Why Choose The Navigators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14 sm:mb-16">
          <div className="bg-white border border-brand-line shadow-soft hover:shadow-widget p-5 rounded-xl flex items-start gap-4 transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-orangeLight text-brand-orange flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-navy">100% Verified Stays</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Curated 4★ & 5★ boutique hotels, private villas & heritage houseboats.
              </p>
            </div>
          </div>

          <div className="bg-white border border-brand-line shadow-soft hover:shadow-widget p-5 rounded-xl flex items-start gap-4 transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-orangeLight text-brand-orange flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-navy">Direct Value Guarantee</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Direct operator pricing with zero hidden surcharges or surprise fees.
              </p>
            </div>
          </div>

          <div className="bg-white border border-brand-line shadow-soft hover:shadow-widget p-5 rounded-xl flex items-start gap-4 transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-orangeLight text-brand-orange flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-navy">Bespoke Customization</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Every itinerary is handcrafted around your schedule, budget & vibe.
              </p>
            </div>
          </div>

          <div className="bg-white border border-brand-line shadow-soft hover:shadow-widget p-5 rounded-xl flex items-start gap-4 transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-orangeLight text-brand-orange flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-navy">24/7 Dedicated Concierge</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Personal tour manager assisting your trip in real-time from start to finish.
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-brand-orange uppercase font-bold tracking-widest text-xs block mb-2">
            Guest Experiences & Reviews
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
            Memories Made with The Navigators
          </h2>
          <span className="block w-14 h-1 bg-brand-orange rounded-full mt-3 mx-auto" />

          <p className="text-slate-600 text-sm sm:text-base mt-4">
            Real feedback from discerning travelers who explored domestic sanctuaries and world wonders in unparalleled comfort.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 sm:p-7 rounded-xl relative flex flex-col justify-between border border-brand-line shadow-soft hover:shadow-widget transition-shadow duration-300"
            >
              <Quote className="w-9 h-9 text-brand-orange/20 absolute top-5 right-5 pointer-events-none" />

              <div>
                {/* 5-Star Row & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <UserCheck className="w-3 h-3" />
                    <span>Verified Guest</span>
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-brand-line flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-brand-navy">{item.author}</h4>
                  <span className="text-xs text-brand-orange font-medium">{item.location}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-600 block">
                    {item.tourName}
                  </span>
                  <span className="text-[10px] text-slate-500">
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
