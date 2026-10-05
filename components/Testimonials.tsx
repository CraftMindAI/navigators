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

const PILLARS = [
  { Icon: ShieldCheck, title: '100% Verified Stays', text: 'Curated 4★ & 5★ boutique hotels, private villas & heritage houseboats.' },
  { Icon: Award, title: 'Direct Value Guarantee', text: 'Direct operator pricing with zero hidden surcharges or surprise fees.' },
  { Icon: HeartHandshake, title: 'Bespoke Customization', text: 'Every itinerary is handcrafted around your schedule, budget & vibe.' },
  { Icon: Headphones, title: '24/7 Dedicated Concierge', text: 'Personal tour manager assisting your trip in real-time from start to finish.' },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-white text-brand-ink text-sm">
      <div className="container-bb">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <h2 className="text-[30px] md:text-[46px] font-bold text-brand-ink leading-tight">Memories Made with The Navigators</h2>
          <p className="text-base text-brand-ink mt-2">
            Real feedback from discerning travelers who explored domestic sanctuaries and world wonders in unparalleled comfort.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px]">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-sm relative flex flex-col justify-between border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
            >
              <Quote className="w-8 h-8 text-[#e5e5e5] absolute top-4 right-4 pointer-events-none" />

              <div>
                {/* Star Row */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-brand-ink leading-[1.7] mb-5">"{item.comment}"</p>
              </div>

              <div className="pt-3 border-t border-[#ddd] flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-medium text-sm text-brand-ink flex items-center gap-1.5">
                    {item.author}
                    <UserCheck className="w-3.5 h-3.5 text-brand-green flex-shrink-0" aria-label="Verified guest" />
                  </h4>
                  <span className="text-[13px] text-brand-muted">{item.location}</span>
                </div>

                <div className="text-right">
                  <span className="text-[13px] font-medium text-brand-blue block">{item.tourName}</span>
                  <span className="text-[13px] text-brand-muted">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose The Navigators */}
      <div className="bg-brand-cream mt-12 md:mt-16 py-10">
        <div className="container-bb">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-[#ddd] gap-y-8">
            {PILLARS.map(({ Icon, title, text }) => (
              <div key={title} className="text-center px-3 md:px-6">
                <Icon className="w-11 h-11 mx-auto text-brand-orange" strokeWidth={1.3} />
                <h4 className="text-sm font-medium text-brand-ink mt-3">{title}</h4>
                <p className="text-[13px] text-[#999] mt-1 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
