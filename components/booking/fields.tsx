'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function todayISO() {
  return toISODate(new Date());
}

export function formatDisplayDate(iso: string) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysBetween(a: string, b: string) {
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000);
}

/** Closes a popover when the user clicks/taps outside of `ref`. */
export function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, onOutside, active]);
}

/**
 * Row of joined search cells. On desktop the cells share borders like one table
 * row; on mobile they stack, each with a blue label above a bordered box.
 */
export function FieldRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid gap-3 md:gap-0 md:border md:border-[#ccc] md:rounded-sm md:divide-x md:divide-[#ccc] bg-white ${className}`}>
      {children}
    </div>
  );
}

/** One cell: small label top-left, large value / placeholder below. */
export function Cell({
  label,
  children,
  onClick,
  disabled,
  calendar,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  calendar?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <span className="md:hidden block text-sm font-medium text-brand-blue mb-1">{label}</span>
      <div
        onClick={onClick}
        className={`relative h-full md:min-h-[92px] px-3 py-2.5 md:pt-2.5 border md:border-0 border-[#ccc] rounded md:rounded-none transition-colors ${
          disabled ? 'bg-brand-field' : 'bg-white hover:bg-[#fafbff]'
        } ${onClick ? 'cursor-pointer' : ''}`}
      >
        <span className="hidden md:flex items-center gap-3 text-sm text-brand-label mb-0.5">
          {label}
          {calendar && <CalendarDays className="w-3.5 h-3.5 text-[#8a96c4]" />}
        </span>
        {children}
      </div>
    </div>
  );
}

/** Big text used inside a Cell for a chosen value or a placeholder. */
export function CellValue({ value, placeholder, sub }: { value?: React.ReactNode; placeholder: string; sub?: React.ReactNode }) {
  return (
    <>
      <span
        className={`block truncate text-sm md:text-[25px] md:leading-tight ${
          value ? 'text-brand-ink md:font-medium' : 'text-[#6c757d] md:font-medium'
        }`}
      >
        {value || placeholder}
      </span>
      {value && sub && <span className="hidden md:block text-xs text-brand-muted truncate mt-0.5">{sub}</span>}
    </>
  );
}

export function DateField({
  label,
  value,
  min,
  onChange,
  className = '',
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const d = value ? new Date(`${value}T00:00:00`) : null;
  return (
    <Cell
      label={label}
      calendar
      disabled={disabled}
      className={className}
      onClick={() => {
        const el = inputRef.current;
        if (!el) return;
        try {
          (el as HTMLInputElement & { showPicker: () => void }).showPicker();
        } catch {
          el.focus();
        }
      }}
    >
      <CellValue
        placeholder={placeholder}
        value={d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ (\d\d)$/, "'$1") : undefined}
        sub={d ? d.toLocaleDateString('en-IN', { weekday: 'long' }) : undefined}
      />
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabIndex={-1}
        aria-label={label}
      />
    </Cell>
  );
}

/** Stepper in the boxed style of the travellers popup: [ − 1 + ]. */
export function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1 min-w-[84px]">
      <span className="block text-sm text-brand-ink mb-1.5 pl-1">{label}</span>
      <div className="flex items-stretch h-8 rounded-sm bg-[#d5daeb] text-brand-blue">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 font-bold disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="flex-1 flex items-center justify-center bg-white text-sm text-brand-ink border-y border-[#d5daeb]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 font-bold disabled:opacity-40"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
      {hint && <span className="block text-[10px] text-brand-ink mt-1.5 pl-1">({hint})</span>}
    </div>
  );
}

/** Generic searchable picker cell (airports, cities). */
export function SearchPicker<T>({
  label,
  value,
  items,
  getKey,
  matches,
  renderValue,
  renderItem,
  onSelect,
  placeholder,
  searchPlaceholder,
  className = '',
}: {
  label: string;
  value: T | null;
  items: T[];
  getKey: (item: T) => string;
  matches: (item: T, query: string) => boolean;
  renderValue: (item: T) => { value: React.ReactNode; sub?: React.ReactNode };
  renderItem: (item: T) => React.ReactNode;
  onSelect: (item: T) => void;
  placeholder: string;
  searchPlaceholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter((i) => matches(i, q)) : items;
  const shown = value ? renderValue(value) : null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Cell label={label} onClick={() => setOpen(true)}>
        <CellValue value={shown?.value} sub={shown?.sub} placeholder={placeholder} />
      </Cell>

      {open && (
        <div className="absolute left-0 top-full mt-0.5 z-40 w-[min(360px,calc(100vw-2rem))] rounded bg-white border border-[#ccc] shadow-widget">
          <div className="p-2 border-b border-[#eee]">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-sm border border-[#ccc] px-3 py-2 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-4 py-3 text-sm text-brand-muted">No matches found</li>}
            {filtered.map((item) => (
              <li key={getKey(item)}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-brand-blueLight transition-colors"
                >
                  {renderItem(item)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Dropdown-style value with the small blue caret, used by travellers / rooms cells. */
export function CaretValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-sm md:text-lg text-brand-ink md:mt-3">
      {children}
      <ChevronDown className="w-4 h-4 text-[#8a96c4]" />
    </span>
  );
}

/**
 * Blue "Search" pill. On desktop it sits centred on the bottom border of the
 * search box (the parent must be `relative`); on mobile it is a full-width bar.
 */
export function SearchButton({ children = 'Search' }: { children?: React.ReactNode }) {
  return (
    <div className="mt-5 md:mt-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:-bottom-[23px] z-10">
      <button
        type="submit"
        className="w-full md:w-[180px] h-11 md:h-[45px] rounded md:rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-base transition-colors touch-manipulation"
      >
        {children}
      </button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="text-sm text-brand-red text-center mt-3">{message}</p>;
}

/** Pill radio used for One Way / Round Trip / Multi City. */
export function PillRadio({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-base transition-colors ${
        checked ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-[#ccc] text-brand-muted hover:border-brand-blue'
      }`}
      aria-pressed={checked}
    >
      <span className={`w-3.5 h-3.5 rounded-full border-2 ${checked ? 'border-white bg-brand-blue ring-2 ring-inset ring-brand-blue' : 'border-[#999]'}`} />
      {children}
    </button>
  );
}
