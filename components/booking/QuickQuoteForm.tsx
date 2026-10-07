'use client';

import React, { useEffect, useState } from 'react';
import { DESTINATION_GROUPS } from '@/data/travelContent';
import { CaretValue, Cell, DateField, FieldRow, FormError, SearchButton, formatDisplayDate, todayISO } from './fields';
import type { QuoteRequest } from './QuoteRequestModal';

export type QuickQuoteKind = 'bus' | 'train' | 'heli' | 'domestic' | 'luxury' | 'international';

const BIG_INPUT =
  'w-full bg-transparent text-sm md:text-[25px] md:leading-tight md:font-medium text-brand-ink placeholder-[#6c757d] focus:outline-none';
const BIG_SELECT = `${BIG_INPUT} cursor-pointer`;

const HELI_ROUTES = ['Char Dham Yatra (Dehradun)', 'Kedarnath (Phata / Guptkashi)', 'Vaishno Devi (Katra)', 'Amarnath (Baltal / Pahalgam)', 'Shimla – Manali Joyride', 'Custom Charter'];

const CAPTIONS: Record<QuickQuoteKind, string> = {
  bus: 'Search Volvo & Sleeper buses across India',
  train: 'Search Indian Railways trains',
  heli: 'Book helicopter services & joyrides',
  domestic: 'Search Domestic Holiday Packages',
  luxury: 'Search Luxury Holiday Packages',
  international: 'Search International Holiday Packages',
};

const LABELS: Record<QuickQuoteKind, string> = {
  bus: 'Bus',
  train: 'Train',
  heli: 'Heli Ride',
  domestic: 'Domestic Holiday',
  luxury: 'Luxury Holiday',
  international: 'International Holiday',
};

function holidayDestinations(kind: 'domestic' | 'luxury' | 'international') {
  const groups = kind === 'international' ? DESTINATION_GROUPS.slice(2) : kind === 'domestic' ? DESTINATION_GROUPS.slice(0, 2) : DESTINATION_GROUPS;
  return groups.flatMap((g) => g.regions?.map((r) => r.name));
}

export default function QuickQuoteForm({ kind, onRequest }: { kind: QuickQuoteKind; onRequest: (r: QuoteRequest) => void }) {
  const today = todayISO();
  const isHoliday = kind === 'domestic' || kind === 'luxury' || kind === 'international';
  const destinations = isHoliday ? holidayDestinations(kind) : [];

  const [from, setFrom] = useState('');
  const [to, setTo] = useState(kind === 'heli' ? HELI_ROUTES[0] : '');
  const [date, setDate] = useState('');
  const [people, setPeople] = useState(2);
  const [error, setError] = useState('');

  // Clear a stale validation message as soon as the user edits the form.
  useEffect(() => setError(''), [from, to, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isHoliday && !to) return setError('Please select a destination.');
    if (!isHoliday && kind !== 'heli' && (!from.trim() || !to.trim())) return setError('Please enter both From and To.');
    if (!date) return setError('Please select a date.');

    const summary: QuoteRequest['summary'] = [];
    if (isHoliday) summary.push({ label: 'Destination', value: to });
    else if (kind === 'heli') summary.push({ label: 'Service', value: to });
    else summary.push({ label: 'Route', value: `${from} → ${to}` });
    if (kind === 'heli' && from.trim()) summary.push({ label: 'Pickup', value: from });
    summary.push({ label: isHoliday ? 'Travel date' : 'Journey date', value: formatDisplayDate(date) });
    summary.push({ label: isHoliday ? 'Travellers' : 'Passengers', value: String(people) });

    onRequest({
      title: `${LABELS[kind]}: ${isHoliday || kind === 'heli' ? to : `${from} → ${to}`}`,
      summary,
      travelDate: date,
      guests: people,
    });
  };

  const peopleCell = (
    <Cell label={isHoliday ? 'Travellers' : 'Passengers'}>
      <CaretValue>
        <select value={people} onChange={(e) => setPeople(Number(e.target.value))} className="bg-transparent focus:outline-none cursor-pointer appearance-none">
          {Array.from({ length: 20 }, (_, i) => i + 1)?.map((n) => (
            <option key={n} value={n}>
              {n} {isHoliday ? 'Traveller' : 'Passenger'}
              {n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </CaretValue>
    </Cell>
  );

  return (
    <form onSubmit={handleSubmit} className="md:relative md:pb-12">
      <p className="hidden md:block text-center text-[15px] font-medium text-brand-ink mb-2.5">{CAPTIONS[kind]}</p>

      <FieldRow
        className={
          isHoliday
            ? 'md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)]'
            : 'md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]'
        }
      >
        {isHoliday ? (
          <Cell label="Destination">
            <select value={to} onChange={(e) => setTo(e.target.value)} className={`${BIG_SELECT} ${to ? '' : 'text-[#6c757d]'}`}>
              <option value="">Select Destination</option>
              {destinations?.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Cell>
        ) : kind === 'heli' ? (
          <>
            <Cell label="Heli Service">
              <select value={to} onChange={(e) => setTo(e.target.value)} className={BIG_SELECT}>
                {HELI_ROUTES?.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Cell>
            <Cell label="Pickup City">
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Optional" className={BIG_INPUT} />
            </Cell>
          </>
        ) : (
          <>
            <Cell label="From">
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={kind === 'train' ? 'From Station' : 'Leaving From'} className={BIG_INPUT} />
            </Cell>
            <Cell label="To">
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder={kind === 'train' ? 'To Station' : 'Going To'} className={BIG_INPUT} />
            </Cell>
          </>
        )}

        <DateField label={isHoliday ? 'Travel Date' : 'Journey Date'} placeholder="Select Date" value={date} min={today} onChange={setDate} />
        {peopleCell}
      </FieldRow>

      <FormError message={error} />
      <SearchButton />
    </form>
  );
}
