'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Utensils, Bus, Car, Building2, IndianRupee } from 'lucide-react';
import { TourPackage } from '@/types';

/** Minimal shape needed to render a package card (DB tours and static trending packages). */
export interface PackageCardData {
  title: string;
  imageUrl: string;
  durationNights: number;
  durationDays: number;
  price?: number;
  originalPrice?: number;
  rating?: number;
  href?: string;
}

const AMENITIES = [
  { Icon: Utensils, label: 'Meals' },
  { Icon: Bus, label: 'Transfers' },
  { Icon: Car, label: 'Sightseeing' },
  { Icon: Building2, label: 'Hotel' },
];

/** Package card in the Bharat Booking style: blue duration tag, amenity icons, stars, price. */
export function PackageCard({ pkg, onEnquire }: { pkg: PackageCardData; onEnquire?: () => void }) {
  const rating = Math.round(pkg.rating || 5);
  const image = (
    <div className="relative h-[140px] overflow-hidden">
      <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <span className="absolute top-5 right-0 bg-brand-blue text-white text-[13px] font-medium px-2.5 py-1">
        {pkg.durationNights}N / {pkg.durationDays}D
      </span>
    </div>
  );

  return (
    <div className="group bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] border-b-2 border-brand-blue flex flex-col h-full">
      {pkg.href ? <Link href={pkg.href}>{image}</Link> : image}
      <div className="px-2.5 pt-2.5 pb-2 flex-1 flex flex-col">
        <h3 className="text-[14px] font-medium text-brand-ink leading-snug mb-2 line-clamp-2 min-h-[38px]">
          {pkg.href ? (
            <Link href={pkg.href} className="hover:text-brand-blue">
              {pkg.title}
            </Link>
          ) : (
            pkg.title
          )}
        </h3>
        <div className="flex items-center gap-2.5 text-brand-blue mb-2">
          {AMENITIES?.map(({ Icon, label }) => (
            <span key={label} title={label} className="w-[22px] h-[22px] flex items-center justify-center">
              <Icon className="w-5 h-5" strokeWidth={2.2} />
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex gap-1" aria-label={`${rating} star rating`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < rating ? 'fill-brand-navy text-brand-navy' : 'text-[#ccc]'}`} />
            ))}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEnquire?.();
            }}
            className="flex items-center text-[14px] text-brand-orange hover:text-brand-orangeDark"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            {pkg.price ? (
              <span>
                {pkg.price.toLocaleString('en-IN')}
                {pkg.originalPrice ? <s className="text-[11px] text-brand-muted ml-1">{pkg.originalPrice.toLocaleString('en-IN')}</s> : null}
              </span>
            ) : (
              <span>Price On Request</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TourPackageCardProps {
  tour: TourPackage;
  onEnquire?: (tour: TourPackage) => void;
}

export default function TourPackageCard({ tour, onEnquire }: TourPackageCardProps) {
  return (
    <PackageCard
      pkg={{
        title: tour.title,
        imageUrl: tour.imageUrl,
        durationNights: tour.durationNights,
        durationDays: tour.durationDays,
        price: tour.price,
        originalPrice: tour.originalPrice,
        rating: tour.rating,
        href: `/tour/${tour.slug}`,
      }}
      onEnquire={() => onEnquire?.(tour)}
    />
  );
}
