'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Plus, X } from 'lucide-react';
import { AIRPORTS, Airport } from '@/data/travelContent';
import {
  CaretValue,
  Cell,
  Counter,
  DateField,
  FieldRow,
  FormError,
  PillRadio,
  SearchButton,
  SearchPicker,
  addDays,
  formatDisplayDate,
  todayISO,
  useClickOutside,
} from './fields';
import type { QuoteRequest } from './QuoteRequestModal';

type TripType = 'oneway' | 'round' | 'multi';

const TRIP_TYPES: { key: TripType; label: string }[] = [
  { key: 'oneway', label: 'oneway' },
  { key: 'round', label: 'RoundTrip' },
  { key: 'multi', label: 'Multicity' },
];

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'Premium Business', 'First'];

interface Segment {
  from: Airport | null;
  to: Airport | null;
  date: string;
}

const emptySegment = (): Segment => ({ from: null, to: null, date: '' });

function AirportPicker({ label, placeholder, value, onSelect }: { label: string; placeholder: string; value: Airport | null; onSelect: (a: Airport) => void }) {
  return (
    <SearchPicker<Airport>
      label={label}
      value={value}
      items={AIRPORTS}
      getKey={(a) => a.code}
      matches={(a, q) => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)}
      renderValue={(a) => ({ value: `${a.city} (${a.code})`, sub: a.name })}
      renderItem={(a) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-sm font-medium text-brand-ink">
              {a.city}, <span className="text-brand-muted">India</span>
            </span>
            <span className="block text-[11px] text-brand-muted truncate">{a.name}</span>
          </div>
          <span className="text-xs font-semibold text-brand-blue">{a.code}</span>
        </div>
      )}
      onSelect={onSelect}
      placeholder={placeholder}
      searchPlaceholder="Type city or airport code"
    />
  );
}

export default function FlightSearchForm({ onRequest }: { onRequest: (r: QuoteRequest) => void }) {
  const today = todayISO();
  const [tripType, setTripType] = useState<TripType>('oneway');
  const [segments, setSegments] = useState<Segment[]>([emptySegment(), emptySegment()]);
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState(CABIN_CLASSES[0]);
  const [paxOpen, setPaxOpen] = useState(false);
  const [error, setError] = useState('');
  const paxRef = useRef<HTMLDivElement>(null);
  useClickOutside(paxRef, () => setPaxOpen(false), paxOpen);

  // Clear a stale validation message as soon as the user edits the form.
  useEffect(() => setError(''), [segments, returnDate, tripType]);

  const travellers = adults + children + infants;
  const visibleSegments = tripType === 'multi' ? segments : segments.slice(0, 1);

  const updateSegment = (i: number, patch: Partial<Segment>) =>
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    for (const [i, s] of visibleSegments.entries()) {
      const n = tripType === 'multi' ? ` (flight ${i + 1})` : '';
      if (!s.from) return setError(`Please select Leaving From${n}.`);
      if (!s.to) return setError(`Please select Going To${n}.`);
      if (s.from.code === s.to.code) return setError(`From and To cannot be the same${n}.`);
      if (!s.date) return setError(`Please select Depart Date${n}.`);
      if (i > 0 && s.date < visibleSegments[i - 1].date) return setError(`Flight ${i + 1} cannot depart before flight ${i}.`);
    }
    if (tripType === 'round' && !returnDate) return setError('Please select Return Date.');

    const tripLabel = { oneway: 'One Way', round: 'Round Trip', multi: 'Multi City' }[tripType];
    const route = visibleSegments.map((s) => `${s.from!.code} → ${s.to!.code}`).join(', ');
    const summary: QuoteRequest['summary'] = visibleSegments.map((s, i) => ({
      label: tripType === 'multi' ? `Flight ${i + 1}` : 'Departure',
      value: `${s.from!.city} (${s.from!.code}) → ${s.to!.city} (${s.to!.code}) · ${formatDisplayDate(s.date)}`,
    }));
    if (tripType === 'round') summary.push({ label: 'Return', value: formatDisplayDate(returnDate) });
    summary.push(
      { label: 'Travellers', value: `${adults} Adult${adults > 1 ? 's' : ''}${children ? `, ${children} Child` : ''}${infants ? `, ${infants} Infant` : ''}` },
      { label: 'Class', value: cabin }
    );

    onRequest({ title: `Flight: ${route} (${tripLabel})`, summary, travelDate: visibleSegments[0].date, guests: travellers });
  };

  const travellersCell = (
    <div ref={paxRef} className="relative">
      <Cell label="Travellers & Class" onClick={() => setPaxOpen(true)}>
        <CaretValue>
          <span className="whitespace-nowrap">
            <b className="font-medium md:text-xl">{travellers}</b> Traveler(s) <span className="text-xs md:text-[13px] ml-1">{cabin}</span>
          </span>
        </CaretValue>
      </Cell>
      {paxOpen && (
        <div className="absolute right-0 top-full mt-2 z-40 w-[min(310px,calc(100vw-2rem))] rounded bg-white border border-[#ccc] shadow-widget p-4 pt-8">
          <button
            type="button"
            onClick={() => setPaxOpen(false)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full border border-brand-blue text-brand-blue flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-3">
            <Counter label="Adult" hint="12+ Y" value={adults} min={1} max={9 - children} onChange={(v) => { setAdults(v); if (infants > v) setInfants(v); }} />
            <Counter label="Children" hint="2+ 12 Y" value={children} min={0} max={9 - adults} onChange={setChildren} />
            <Counter label="Infant" hint="Below 2 Y" value={infants} min={0} max={adults} onChange={setInfants} />
          </div>
          <div className="mt-4 space-y-2">
            {CABIN_CLASSES.map((c) => (
              <label key={c} className="flex items-center gap-2.5 text-sm text-brand-ink cursor-pointer">
                <input type="radio" name="cabin" checked={cabin === c} onChange={() => setCabin(c)} className="w-4 h-4 accent-brand-blue" />
                {c}
              </label>
            ))}
          </div>
          <button type="button" onClick={() => setPaxOpen(false)} className="w-full mt-4 h-9 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-sm">
            Done
          </button>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="md:relative md:pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-2.5 md:px-4">
        <div className="flex flex-wrap gap-2">
          {TRIP_TYPES.map((t) => (
            <PillRadio key={t.key} checked={tripType === t.key} onChange={() => setTripType(t.key)}>
              {t.label}
            </PillRadio>
          ))}
        </div>
        <span className="hidden md:block text-[15px] font-medium text-brand-ink pr-24">Search Domestic and International flights</span>
      </div>

      <div className="space-y-3">
        {visibleSegments.map((seg, i) => (
          <FieldRow
            key={i}
            className={
              tripType === 'multi'
                ? 'md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]'
                : 'md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
            }
          >
            <AirportPicker label="From" placeholder="Leaving From" value={seg.from} onSelect={(a) => updateSegment(i, { from: a })} />
            <div className="relative">
              <button
                type="button"
                onClick={() => updateSegment(i, { from: seg.to, to: seg.from })}
                className="absolute z-10 right-3 -top-5 md:right-auto md:top-1/2 md:-left-[13px] md:-translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white border border-[#ccc] text-[#999] hover:text-brand-blue flex items-center justify-center"
                aria-label="Swap cities"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
              <AirportPicker label="To" placeholder="Going To" value={seg.to} onSelect={(a) => updateSegment(i, { to: a })} />
            </div>
            <DateField
              label="Depart"
              placeholder="Depart Date"
              value={seg.date}
              min={i > 0 ? visibleSegments[i - 1].date || today : today}
              onChange={(v) => {
                updateSegment(i, { date: v });
                if (returnDate && returnDate < v) setReturnDate('');
              }}
            />
            {tripType !== 'multi' && (
              <DateField
                label="Return"
                placeholder="Return Date"
                value={tripType === 'round' ? returnDate : ''}
                min={seg.date || today}
                disabled={tripType !== 'round'}
                onChange={(v) => {
                  setTripType('round');
                  setReturnDate(v);
                }}
              />
            )}
            {i === 0 ? (
              travellersCell
            ) : (
              <div className="flex items-center justify-center md:min-h-[92px]">
                <button
                  type="button"
                  onClick={() => setSegments((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={segments.length <= 2}
                  className="inline-flex items-center gap-1 text-sm text-brand-red disabled:opacity-0"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
            )}
          </FieldRow>
        ))}

        {tripType === 'multi' && segments.length < 5 && (
          <button
            type="button"
            onClick={() =>
              setSegments((prev) => {
                const last = prev[prev.length - 1];
                return [...prev, { from: last.to, to: null, date: last.date ? addDays(last.date, 2) : '' }];
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-brand-blue text-brand-blue text-sm hover:bg-brand-blueLight"
          >
            <Plus className="w-4 h-4" /> Add City
          </button>
        )}
      </div>

      <FormError message={error} />
      <SearchButton />
    </form>
  );
}
