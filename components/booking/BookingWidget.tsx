'use client';

import React, { useState } from 'react';
import { Bus, Hotel, Plane, Ship, TrainFront, TreePalm, Earth, Wind } from 'lucide-react';
import FlightSearchForm from './FlightSearchForm';
import HotelSearchForm from './HotelSearchForm';
import QuickQuoteForm, { QuickQuoteKind } from './QuickQuoteForm';
import QuoteRequestModal, { QuoteRequest } from './QuoteRequestModal';
import { BusIcon, DomesticIcon, FlightIcon, HeliIcon, HotelIcon, InternationalIcon, LuxuryIcon, TrainIcon } from './TabIcons';

export type BookingTab = 'flight' | 'hotel' | QuickQuoteKind;

type IconC = React.ComponentType<{ className?: string }>;

const TABS: { key: BookingTab; label: string; Icon: IconC; MobileIcon: IconC; color: string }[] = [
  { key: 'flight', label: 'Flight', Icon: FlightIcon, MobileIcon: Plane, color: 'bg-brand-blue' },
  { key: 'hotel', label: 'Hotel', Icon: HotelIcon, MobileIcon: Hotel, color: 'bg-brand-orange' },
  { key: 'bus', label: 'Bus', Icon: BusIcon, MobileIcon: Bus, color: 'bg-brand-green' },
  { key: 'domestic', label: 'Domestic Holidays', Icon: DomesticIcon, MobileIcon: TreePalm, color: 'bg-brand-blue' },
  { key: 'heli', label: 'Heli Ride', Icon: HeliIcon, MobileIcon: Wind, color: 'bg-brand-orange' },
  { key: 'luxury', label: 'Luxury Holidays', Icon: LuxuryIcon, MobileIcon: Ship, color: 'bg-brand-green' },
  { key: 'international', label: 'International Holidays', Icon: InternationalIcon, MobileIcon: Earth, color: 'bg-brand-blue' },
  { key: 'train', label: 'Train', Icon: TrainIcon, MobileIcon: TrainFront, color: 'bg-brand-orange' },
];

export default function BookingWidget({ initialTab = 'flight', tabs }: { initialTab?: BookingTab; tabs?: BookingTab[] }) {
  const [active, setActive] = useState<BookingTab>(initialTab);
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const visibleTabs = tabs ? TABS.filter((t) => tabs.includes(t.key)) : TABS;

  return (
    <div id="booking" className="relative">
      {/* Tab card — floats over the banner on desktop */}
      <div className="relative z-10 md:max-w-[895px] mx-auto bg-white md:rounded-md md:shadow-[0_2px_10px_rgba(0,0,0,0.12)] border-b md:border-0 border-[#e5e5e5]">
        <div className="flex overflow-x-auto no-scrollbar">
          {visibleTabs.map(({ key, label, Icon, MobileIcon, color }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`relative shrink-0 md:shrink md:flex-auto flex flex-col items-center gap-1 px-5 md:px-3 pt-2.5 md:pt-2 pb-2 transition-colors ${
                  isActive ? 'md:text-brand-orange text-brand-blue' : 'text-black hover:text-brand-orange'
                }`}
                aria-pressed={isActive}
              >
                <Icon className="hidden md:block w-[42px] h-[42px]" />
                <span className={`md:hidden w-10 h-10 rounded-full ${color} text-white flex items-center justify-center`}>
                  <MobileIcon className="w-5 h-5" />
                </span>
                <span className="text-[13px] md:text-sm whitespace-nowrap">{label}</span>
                <span
                  className={`absolute bottom-0 left-3 right-3 md:left-1 md:right-1 h-[2px] ${
                    isActive ? 'bg-brand-blue md:bg-brand-orange' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Search box — blue-grey outline, search pill sits on its bottom edge */}
      <div className="bg-[#f5f5f5] md:bg-white md:max-w-[1112px] mx-auto md:-mt-[36px] md:border md:border-[#8a96c4] md:rounded-lg px-4 py-4 md:px-4 md:pt-[78px] md:pb-0">
        {active === 'flight' && <FlightSearchForm onRequest={setRequest} />}
        {active === 'hotel' && <HotelSearchForm onRequest={setRequest} />}
        {active !== 'flight' && active !== 'hotel' && <QuickQuoteForm key={active} kind={active} onRequest={setRequest} />}
      </div>

      <QuoteRequestModal request={request} onClose={() => setRequest(null)} />
    </div>
  );
}
