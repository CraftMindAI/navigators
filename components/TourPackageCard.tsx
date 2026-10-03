'use client';

import React from 'react';
import Link from 'next/link';
import {
  Star,
  Clock,
  MapPin,
  Hotel,
  Utensils,
  Car,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { TourPackage } from '@/types';

interface TourPackageCardProps {
  tour: TourPackage;
  onEnquire?: (tour: TourPackage) => void;
}

export default function TourPackageCard({ tour, onEnquire }: TourPackageCardProps) {
  const discountPercent = tour.originalPrice
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-white/[0.08] hover:border-primaryCyan/40 transition-all duration-500 shadow-card hover:shadow-cardHover h-full">
      {/* Top Image Showcase */}
      <div className="relative h-60 sm:h-64 overflow-hidden">
        <Link href={`/tour/${tour.slug}`} className="block w-full h-full">
          <img
            src={tour.imageUrl}
            alt={tour.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent" />
        </Link>

        {/* Floating Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Duration Pill */}
          <div className="bg-midnight/70 backdrop-blur-md border border-white/[0.1] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-glass">
            <Clock className="w-3.5 h-3.5 text-gold" />
            <span>{tour.durationNights}N / {tour.durationDays}D</span>
          </div>

          {/* Discount or Category Badge */}
          {discountPercent > 0 ? (
            <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {discountPercent}% OFF
            </div>
          ) : (
            <div className="bg-primaryCyan/20 backdrop-blur-md border border-primaryCyan/40 text-primaryCyan text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {tour.category || 'Featured'}
            </div>
          )}
        </div>

        {/* Location & Rating Over Image */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-midnight/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.1]">
            <MapPin className="w-3 h-3 text-primaryCyan" />
            <span className="capitalize">{tour.location.replace(/tourpackage|-tour-packages|tour-packages/gi, '').replace(/-/g, ' ')}</span>
          </div>

          <div className="bg-midnight/80 backdrop-blur-md text-amber-300 border border-amber-400/20 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-glass">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{tour.rating || 5.0}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-white text-base sm:text-lg leading-snug mb-3 group-hover:text-primaryCyan transition-colors line-clamp-2">
            <Link href={`/tour/${tour.slug}`}>
              {tour.title}
            </Link>
          </h3>

          {/* Curated Highlights */}
          {tour.highlights && tour.highlights.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {tour.highlights.slice(0, 2).map((h, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2 line-clamp-1 font-light">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Inclusions Chips */}
          <div className="grid grid-cols-4 gap-1.5 py-3 border-y border-white/[0.08] mb-4">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] text-slate-300" title="Hotel Accommodation">
              <Hotel className="w-4 h-4 text-primaryCyan mb-0.5" />
              <span className="text-[9px] font-semibold text-slate-400">Hotel</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] text-slate-300" title="Daily Breakfast & Dinner">
              <Utensils className="w-4 h-4 text-primaryCyan mb-0.5" />
              <span className="text-[9px] font-semibold text-slate-400">Meals</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] text-slate-300" title="Private Transfers">
              <Car className="w-4 h-4 text-primaryCyan mb-0.5" />
              <span className="text-[9px] font-semibold text-slate-400">Cab</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] text-slate-300" title="Sightseeing Excursions">
              <Compass className="w-4 h-4 text-primaryCyan mb-0.5" />
              <span className="text-[9px] font-semibold text-slate-400">Tours</span>
            </div>
          </div>
        </div>

        {/* Bottom Price & CTA Area */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Starting From
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white leading-none">
                ₹{tour.price.toLocaleString('en-IN')}
              </span>
              {tour.originalPrice && (
                <span className="text-xs text-slate-500 line-through font-medium">
                  ₹{tour.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onEnquire) onEnquire(tour);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white text-xs font-bold tracking-wide shadow-glow hover:shadow-cyanGlow transition-all duration-300 flex items-center gap-1.5 active:scale-95 touch-manipulation"
          >
            <span>Enquire</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
