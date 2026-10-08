'use client';

import React, { useState } from 'react';
import { ChevronDown, SlidersHorizontal, Star } from 'lucide-react';

/** A checkbox group, e.g. Duration or Star Rating. Options in a group are OR-ed; groups are AND-ed. */
export interface CheckboxGroup {
  id: string;
  title: string;
  options: { value: string; label: React.ReactNode }[];
}

export interface FilterValues {
  /** Highest price to show; null = no price limit ("Show All"). */
  maxPrice: number | null;
  /** Checked option values per group id. */
  checked: Record<string, string[]>;
}

export const emptyFilters = (): FilterValues => ({ maxPrice: null, checked: {} });

/** True when nothing is checked in the group, or `value` is one of the checked options. */
export function passesGroup(filters: FilterValues, groupId: string, value: string | string[]): boolean {
  const checked = filters.checked[groupId];
  if (!checked || checked.length === 0) return true;
  const values = Array.isArray(value) ? value : [value];
  return values.some((v) => checked.includes(v));
}

export function passesPrice(filters: FilterValues, price: number): boolean {
  return filters.maxPrice === null || price <= filters.maxPrice;
}

/** Row of 1–5 filled stars, used as a Star Rating option label. */
export function StarLabel({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} star`}>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-brand-navy text-brand-navy" />
      ))}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-[#e5e5e5]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f5] text-[13px] text-[#666]"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  price,
  groups,
  value,
  onChange,
  resultCount,
}: {
  /** Price range of the listed items; omit to hide the Price section. */
  price?: { min: number; max: number; suffix?: string };
  groups: CheckboxGroup[];
  value: FilterValues;
  onChange: (value: FilterValues) => void;
  resultCount: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = (value.maxPrice !== null ? 1 : 0) + Object.values(value.checked).reduce((n, list) => n + list.length, 0);

  const toggle = (groupId: string, option: string) => {
    const current = value.checked[groupId] || [];
    const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
    onChange({ ...value, checked: { ...value.checked, [groupId]: next } });
  };

  const showPrice = price && price.max > price.min;
  const sliderValue = value.maxPrice ?? price?.max ?? 0;

  return (
    <aside className="w-full lg:w-[265px] lg:shrink-0">
      {/* Mobile: filters collapse behind a button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 h-10 bg-white border border-[#ddd] text-sm text-brand-ink"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters{activeCount > 0 ? ` (${activeCount})` : ''} · {resultCount} result{resultCount === 1 ? '' : 's'}
      </button>

      <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block bg-white border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.08)] lg:sticky lg:top-28 mb-6 lg:mb-0`}>
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-[14px] font-medium text-brand-ink">Filter Results</h3>
          <button
            type="button"
            onClick={() => onChange(emptyFilters())}
            disabled={activeCount === 0}
            className="text-[13px] text-brand-blue hover:underline disabled:text-[#aaa] disabled:no-underline"
          >
            Reset All
          </button>
        </div>

        {showPrice && (
          <Section title="Price">
            <div className="flex justify-between text-[13px] text-brand-ink mb-1.5">
              <span>₹{price.min.toLocaleString('en-IN')}</span>
              <span>
                ₹{sliderValue.toLocaleString('en-IN')}
                {price.suffix}
              </span>
            </div>
            <input
              type="range"
              min={price.min}
              max={price.max}
              step={Math.max(1, Math.round((price.max - price.min) / 100))}
              value={sliderValue}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange({ ...value, maxPrice: v >= price.max ? null : v });
              }}
              aria-label="Maximum price"
              className="w-full accent-brand-blue cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onChange({ ...value, maxPrice: null })}
              className={`mt-1 text-[13px] ${value.maxPrice === null ? 'text-brand-ink' : 'text-brand-blue hover:underline'}`}
            >
              Show All
            </button>
          </Section>
        )}

        {groups
          .filter((g) => g.options.length > 0)
          .map((group) => (
            <Section key={group.id} title={group.title}>
              <ul className="max-h-[220px] overflow-y-auto -mr-2 pr-2 divide-y divide-[#eee]">
                {group.options.map((opt) => {
                  const checked = (value.checked[group.id] || []).includes(opt.value);
                  return (
                    <li key={opt.value}>
                      <label className="flex items-center justify-between gap-3 py-3 cursor-pointer text-[13px] text-[#444]">
                        <span>{opt.label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(group.id, opt.value)}
                          className="w-4 h-4 shrink-0 accent-brand-blue cursor-pointer"
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Section>
          ))}
      </div>
    </aside>
  );
}
