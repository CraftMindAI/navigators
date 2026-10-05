import React from 'react';

// Thin line-art icons in the style of the Bharat Booking search tabs.
type P = { className?: string };

const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function FlightIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M6 30l3-1 6 3 8-4-10-9 3-1 13 6 8-4c2-1 5-1 6 0 0 1-1 3-3 4L13 37l-4-1-3-6z" />
      <path d="M21 34l3 6 3-1-1-7" />
      <path d="M5 42h16" />
    </svg>
  );
}

export function HotelIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="15" y="4" width="18" height="5" />
      <text x="24" y="8.2" textAnchor="middle" fontSize="3.6" fill="currentColor" stroke="none" fontFamily="Arial" fontWeight="700">HOTEL</text>
      <rect x="9" y="11" width="30" height="31" />
      <path d="M6 42h36M9 11l-2 0M39 11h2" />
      <rect x="13" y="15" width="5" height="5" /><rect x="21.5" y="15" width="5" height="5" /><rect x="30" y="15" width="5" height="5" />
      <rect x="13" y="24" width="5" height="5" /><rect x="21.5" y="24" width="5" height="5" /><rect x="30" y="24" width="5" height="5" />
      <rect x="13" y="33" width="5" height="5" /><rect x="30" y="33" width="5" height="5" />
      <path d="M21 42v-8h6v8" />
    </svg>
  );
}

export function BusIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="14" width="40" height="18" rx="5" />
      <path d="M4 26h40" />
      <path d="M9 14v12M16 14v12M23 14v12M30 14v12M37 14v12" />
      <circle cx="13" cy="33" r="3" /><circle cx="35" cy="33" r="3" />
      <path d="M7 18h0M41 30h2" />
    </svg>
  );
}

function Beach({ className, extra }: P & { extra?: React.ReactNode }) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="9" r="3" />
      <path d="M10 3v1.5M10 13.5V15M4 9h1.5M14.5 9H16M5.8 4.8l1 1M13.2 12.2l1 1M5.8 13.2l1-1M13.2 5.8l1-1" />
      <path d="M17 22c3-8 15-11 23-5L17 22z" />
      <path d="M24 20l-4-6M31 18l-2-6" />
      <path d="M28.5 19.5L33 38" />
      <path d="M4 40c4-3 8-3 12 0s8 3 12 0 8-3 12 0 4 2 4 2" />
      <path d="M10 44c3-2 6-2 9 0s6 2 9 0 6-2 9 0" />
      <path d="M14 38c2-3 6-4 10-3" />
      {extra}
    </svg>
  );
}

export function DomesticIcon({ className }: P) {
  return <Beach className={className} />;
}

export function InternationalIcon({ className }: P) {
  return <Beach className={className} />;
}

export function HeliIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M10 13h30" />
      <path d="M25 13v4" />
      <path d="M16 17h14c5 0 9 3 9 8 0 2-2 4-4 4H18c-3 0-5-2-5-5v-1" />
      <path d="M13 22H4l-1-4" />
      <path d="M29 17v6h9" />
      <circle cx="20" cy="23" r="0.8" />
      <path d="M20 29v4M32 29v4M15 33h21" />
    </svg>
  );
}

export function LuxuryIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M38 4v2M38 12v2M33 9h2M41 9h2M35 6l1 1M40 11l1 1M35 12l1-1M40 7l1-1" />
      <circle cx="38" cy="9" r="1.6" />
      <path d="M5 30h36l-5 8H10z" />
      <path d="M10 30v-6h20l5 6" />
      <path d="M14 24v-5h12l3 5" />
      <path d="M13 27h2M18 27h2M23 27h2M28 27h2" />
      <path d="M3 42c3-2 6-2 9 0s6 2 9 0 6-2 9 0 6 2 9 0 5-1 5-1" />
    </svg>
  );
}

export function TrainIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="12" y="4" width="24" height="30" rx="5" />
      <rect x="15" y="9" width="18" height="10" rx="1" />
      <path d="M24 9v10M18 6h12" />
      <circle cx="18" cy="27" r="1.6" /><circle cx="30" cy="27" r="1.6" />
      <path d="M16 34l-5 10M32 34l5 10M14 40h20M12 44h24" />
    </svg>
  );
}
