'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { HOTEL_CITIES, NATIONALITIES } from '@/data/travelContent';
import {
  CaretValue,
  Cell,
  Counter,
  DateField,
  FieldRow,
  FormError,
  SearchButton,
  SearchPicker,
  addDays,
  daysBetween,
  formatDisplayDate,
  todayISO,
  useClickOutside,
} from './fields';
import type { QuoteRequest } from './QuoteRequestModal';

interface Room {
  adults: number;
  children: number;
}

const MAX_ROOMS = 6;

export default function HotelSearchForm({ onRequest }: { onRequest: (r: QuoteRequest) => void }) {
  const today = todayISO();
  const [city, setCity] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState<Room[]>([{ adults: 1, children: 0 }]);
  const [nationality, setNationality] = useState('India');
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [error, setError] = useState('');
  const roomsRef = useRef<HTMLDivElement>(null);
  useClickOutside(roomsRef, () => setRoomsOpen(false), roomsOpen);

  // Clear a stale validation message as soon as the user edits the form.
  useEffect(() => setError(''), [city, checkIn, checkOut]);

  const guests = rooms.reduce((n, r) => n + r.adults + r.children, 0);
  const nights = checkIn && checkOut ? daysBetween(checkIn, checkOut) : 0;

  const updateRoom = (i: number, patch: Partial<Room>) =>
    setRooms((prev) => prev?.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!city) return setError('Please select a city.');
    if (!checkIn) return setError('Please select Check in date.');
    if (!checkOut) return setError('Please select Check out date.');
    if (nights < 1) return setError('Check out must be after Check in.');

    onRequest({
      title: `Hotel: ${city} · ${nights} Night${nights > 1 ? 's' : ''}`,
      summary: [
        { label: 'City', value: city },
        { label: 'Check in', value: formatDisplayDate(checkIn) },
        { label: 'Check out', value: `${formatDisplayDate(checkOut)} (${nights} night${nights > 1 ? 's' : ''})` },
        { label: 'Rooms', value: rooms?.map((r, i) => `Room ${i + 1}: ${r.adults} Adult${r.adults > 1 ? 's' : ''}${r.children ? ` + ${r.children} Child` : ''}`).join(' · ') },
        { label: 'Guests', value: String(guests) },
        { label: 'Nationality', value: nationality },
      ],
      travelDate: checkIn,
      guests,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="md:relative md:pb-12">
      <p className="hidden md:block text-center text-[15px] font-medium text-brand-ink mb-2.5">
        Search Domestic and International hotels and homestays
      </p>

      <FieldRow className="md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <SearchPicker<string>
          label="City"
          value={city}
          items={HOTEL_CITIES}
          getKey={(c) => c}
          matches={(c, q) => c.toLowerCase().includes(q)}
          renderValue={(c) => ({ value: c, sub: 'Hotels, resorts & homestays' })}
          renderItem={(c) => (
            <span className="flex items-center gap-2 text-sm text-brand-ink">
              <MapPin className="w-4 h-4 text-brand-blue" /> {c}
            </span>
          )}
          onSelect={setCity}
          placeholder="Select City (Worldwide)"
          searchPlaceholder="Search city"
        />

        <DateField
          label="Check in"
          placeholder="Hotel Check-in"
          value={checkIn}
          min={today}
          onChange={(v) => {
            setCheckIn(v);
            if (!checkOut || checkOut <= v) setCheckOut(addDays(v, 1));
          }}
        />

        <DateField
          label={nights > 0 ? `Check out · ${nights}N` : 'Check out'}
          placeholder="Hotel Check-out"
          value={checkOut}
          min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
          onChange={setCheckOut}
        />

        <div ref={roomsRef} className="relative">
          <Cell label="Room & Guests" onClick={() => setRoomsOpen(true)}>
            <CaretValue>
              <span className="whitespace-nowrap">
                <b className="font-medium md:text-xl">{guests}</b> Person <b className="font-medium md:text-xl ml-1">{rooms.length}</b> Room
              </span>
            </CaretValue>
          </Cell>
          {roomsOpen && (
            <div className="absolute right-0 top-full mt-2 z-40 w-[min(310px,calc(100vw-2rem))] rounded bg-white border border-[#ccc] shadow-widget p-4 pt-8 max-h-[60vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setRoomsOpen(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full border border-brand-blue text-brand-blue flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {rooms?.map((room, i) => (
                <div key={i} className="border-b border-[#eee] last:border-0 pb-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-brand-blue">Room {i + 1}</span>
                    {rooms.length > 1 && (
                      <button type="button" onClick={() => setRooms((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs text-brand-red">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Counter label="Adult" hint="12+ Y" value={room.adults} min={1} max={4} onChange={(v) => updateRoom(i, { adults: v })} />
                    <Counter label="Children" hint="0 - 12 Y" value={room.children} min={0} max={3} onChange={(v) => updateRoom(i, { children: v })} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={rooms.length >= MAX_ROOMS}
                  onClick={() => setRooms((prev) => [...prev, { adults: 1, children: 0 }])}
                  className="inline-flex items-center gap-1 text-sm text-brand-blue disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" /> Add Room
                </button>
                <button type="button" onClick={() => setRoomsOpen(false)} className="px-6 h-8 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-sm">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <Cell label="Nationality">
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full bg-transparent text-sm md:text-2xl text-[#6c757d] focus:outline-none cursor-pointer md:mt-1"
          >
            {NATIONALITIES?.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Cell>
      </FieldRow>

      <FormError message={error} />
      <SearchButton />
    </form>
  );
}
