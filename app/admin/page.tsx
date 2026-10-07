'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { supabase, getInquiries, getInquiryCounts, INQUIRY_STATUSES, INQUIRIES_PAGE_SIZE, getAdminList, getAdminListCounts, getAdminTotals, ADMIN_PAGE_SIZE, createTour, updateTour, deleteTour, createDestination, getDestinations, updateDestination, deleteDestination, deleteInquiry, updateInquiryStatus, createBlog, updateBlog, deleteBlog, createHotel, updateHotel, deleteHotel, getHotelItinerary, saveHotelItinerary } from '@/lib/supabase';
import type { AdminListTable, InquiryCounts, InquiryStatus, InquiryStatusFilter } from '@/lib/supabase';
import { Inquiry, TourPackage, Destination, Blog, Hotel, HotelItineraryDay, HotelRegion, HOTEL_REGIONS } from '@/types';
import { ShieldAlert, RefreshCw, Phone, Mail, Calendar, User, CheckCircle2, Clock, ArrowLeft, PlusCircle, Trash2, LogOut, MapPin, DollarSign, Sparkles, Image as ImageIcon, Hotel as HotelIcon, Star, FileSpreadsheet, Download, AlertTriangle, PhoneCall, Menu, X, BookOpen, Search, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

/** Excel header (lower-cased, spaces stripped) -> itinerary field. */
const ITINERARY_COLUMNS: Record<string, keyof HotelItineraryDay> = {
  day: 'dayNumber',
  daynumber: 'dayNumber',
  location: 'location',
  title: 'title',
  nights: 'nights',
  description: 'description',
  meals: 'meals',
};

/** Parse the first sheet of an itinerary .xlsx (see public/samples/hotel-itinerary-sample.xlsx). */
async function parseItineraryFile(file: File): Promise<HotelItineraryDay[]> {
  const { readSheet } = await import('read-excel-file/browser');
  const rows = await readSheet(file);
  if (rows.length < 2) throw new Error('The sheet is empty. Add a header row and at least one day.');

  const fields = rows[0]?.map((h) => ITINERARY_COLUMNS[String(h ?? '').toLowerCase().replace(/\s+/g, '')]);
  if (!fields.includes('dayNumber') || !fields.includes('title')) {
    throw new Error('Header row must include "Day" and "Title" columns. Download the sample file for the format.');
  }

  const days: HotelItineraryDay[] = [];
  rows.slice(1).forEach((row, i) => {
    if (row.every((cell) => cell === null || String(cell).trim() === '')) return;
    const day: Record<string, string | number | undefined> = {};
    row.forEach((cell, c) => {
      const field = fields[c];
      if (field && cell !== null) day[field] = typeof cell === 'string' ? cell.trim() : String(cell);
    });

    const excelRow = i + 2;
    const dayNumber = Number(day.dayNumber);
    if (!Number.isInteger(dayNumber) || dayNumber < 1) throw new Error(`Row ${excelRow}: "Day" must be a whole number like 1, 2, 3.`);
    if (!day.title) throw new Error(`Row ${excelRow}: "Title" is required.`);
    const nights = day.nights !== undefined && day.nights !== '' ? Number(day.nights) : undefined;
    if (nights !== undefined && (!Number.isInteger(nights) || nights < 0)) throw new Error(`Row ${excelRow}: "Nights" must be a whole number.`);

    days.push({
      dayNumber,
      title: String(day.title),
      location: day.location ? String(day.location) : '',
      nights,
      description: day.description ? String(day.description) : '',
      meals: day.meals ? String(day.meals) : '',
    });
  });

  if (days.length === 0) throw new Error('No itinerary rows found below the header.');
  const seen = new Set<number>();
  for (const d of days) {
    if (seen.has(d.dayNumber)) throw new Error(`Day ${d.dayNumber} appears more than once.`);
    seen.add(d.dayNumber);
  }
  return days.sort((a, b) => a.dayNumber - b.dayNumber);
}

/** Lead status -> badge colours (readable on a white background). */
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-300',
  contacted: 'bg-blue-50 text-blue-700 border-blue-300',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  cancelled: 'bg-red-50 text-red-700 border-red-300',
};


/** Status dropdown coloured like the status badge it replaces. */
function StatusSelect({ status, onChange }: { status?: Inquiry['status']; onChange: (status: InquiryStatus) => void }) {
  const current = status || 'pending';
  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value as InquiryStatus)}
      aria-label="Lead status"
      className={`border rounded-full pl-2.5 pr-7 py-1 text-[11px] font-bold capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${STATUS_BADGE[current] || STATUS_BADGE.pending}`}
    >
      {INQUIRY_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-white text-brand-ink capitalize">
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

type FilterOption = { value: string; label: string };

const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  ...INQUIRY_STATUSES.map((st) => ({ value: st, label: st.charAt(0).toUpperCase() + st.slice(1) })),
];

const CATEGORY_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'domestic', label: 'Domestic' },
  { value: 'international', label: 'International' },
];

/** Admin content pages -> table, filter tabs and search hint. */
const CONTENT_PAGES: Record<string, { table: AdminListTable; filters: FilterOption[]; searchHint: string; noun: string }> = {
  'manage-tours': { table: 'tours', filters: CATEGORY_FILTER_OPTIONS, searchHint: 'Search title or location...', noun: 'tours' },
  'manage-places': { table: 'destinations', filters: CATEGORY_FILTER_OPTIONS, searchHint: 'Search place name...', noun: 'places' },
  'manage-hotels': {
    table: 'hotels',
    filters: [{ value: 'all', label: 'All' }, ...HOTEL_REGIONS.map((r) => ({ value: r.value, label: r.label }))],
    searchHint: 'Search hotel name or city...',
    noun: 'hotels',
  },
  'manage-blogs': { table: 'blogs', filters: [], searchHint: 'Search title or author...', noun: 'blogs' },
};

/** Filter tabs (e.g. All / Pending / ... or All / Domestic / International) with database counts. */
function FilterTabs({
  options,
  value,
  counts,
  onChange,
}: {
  options: FilterOption[];
  value: string;
  counts: Record<string, number>;
  onChange: (value: string) => void;
}) {
  if (options.length === 0) return <div />;
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
              active ? 'bg-brand-blue border-brand-blue text-white shadow-glow' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            {opt.label}
            <span className={`min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] text-center ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
              {counts[opt.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Search box for the admin list pages. */
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-brand-ink placeholder-gray-400 focus:outline-none focus:border-brand-blue"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-ink" aria-label="Clear search">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/** Page numbers to show: first, last, and a window around the current page, with gaps as null. */
function pageWindow(current: number, totalPages: number): (number | null)[] {
  const pages = new Set([1, totalPages, current - 1, current, current + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

/** "Showing 21–40 of 57" plus Prev / page numbers / Next. */
function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const btn = 'min-w-[32px] h-8 px-2 rounded-lg border text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <p className="text-xs text-brand-muted">
        Showing <span className="font-bold text-brand-ink">{first}–{last}</span> of <span className="font-bold text-brand-ink">{total}</span>
      </p>
      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={`${btn} bg-white border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue`} aria-label="Previous page">
            <ChevronLeft className="w-4 h-4 mx-auto" />
          </button>
          {pageWindow(page, totalPages).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`${btn} ${p === page ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue'}`}
              >
                {p}
              </button>
            )
          )}
          <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={`${btn} bg-white border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue`} aria-label="Next page">
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
        </nav>
      )}
    </div>
  );
}

/**
 * Popup that hosts the add / edit forms. Closes on the X button or Escape.
 * Rendered into <body> via a portal: the root layout wraps pages in `<main class="relative z-10">`,
 * which would otherwise keep any overlay underneath the sticky site header.
 */
function FormModal({ onClose, wide = false, children }: { onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/50 p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className={`relative w-full mx-auto ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-ink"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'leads' | 'callbacks' | 'manage-tours' | 'manage-places' | 'manage-hotels' | 'manage-blogs'>('leads');
  // Add / edit forms open in a popup over the Manage pages
  const [formModal, setFormModal] = useState<'tour' | 'place' | 'hotel' | 'blog' | null>(null);
  const [notice, setNotice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin Tours State
  const [editingTourId, setEditingTourId] = useState<string | null>(null);

  // Admin Places State
  // Full list of places for the Destination dropdowns in the tour / hotel forms
  const [adminDestinations, setAdminDestinations] = useState<Destination[]>([]);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

  // Admin Blogs State
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Admin Hotels State
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  // Leads State
  // Inquiries for the open page (Lead Inquiries or Call Me Now), already filtered by status in the database
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  // Filter / search / page of the list on the open admin page (reset when switching pages)
  const [listFilter, setListFilter] = useState<string>('all');
  const [listSearch, setListSearch] = useState('');
  const [debouncedListSearch, setDebouncedListSearch] = useState('');
  const [listPage, setListPage] = useState(1);
  const [leadTotal, setLeadTotal] = useState(0);

  // Tours / Places / Hotels / Blogs: one page of the open table, fetched from the database
  const [content, setContent] = useState<{ table: AdminListTable; rows: any[]; total: number } | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
  const [contentTotals, setContentTotals] = useState<Record<AdminListTable, number> | null>(null);
  const contentRequestId = useRef(0);
  const [inquiryCounts, setInquiryCounts] = useState<InquiryCounts | null>(null);
  const leadsRequestId = useRef(0);

  // New Tour Form State
  const [tourTitle, setTourTitle] = useState('');
  const [tourLocation, setTourLocation] = useState('');
  const [tourCategory, setTourCategory] = useState<'domestic' | 'international'>('domestic');
  const [tourPrice, setTourPrice] = useState('');
  const [tourOriginalPrice, setTourOriginalPrice] = useState('');
  const [tourNights, setTourNights] = useState('5');
  const [tourDays, setTourDays] = useState('6');
  const [tourImageUrl, setTourImageUrl] = useState('');
  const [tourHighlight1, setTourHighlight1] = useState('');
  const [tourHighlight2, setTourHighlight2] = useState('');
  const [tourInclusions, setTourInclusions] = useState('');
  const [tourDestinationId, setTourDestinationId] = useState('');
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourMsg, setTourMsg] = useState('');

  // New Place Form State
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState<'domestic' | 'international'>('domestic');
  const [placeImageUrl, setPlaceImageUrl] = useState('');
  const [placeHighlights, setPlaceHighlights] = useState('');
  const [placeInclusions, setPlaceInclusions] = useState('');
  const [placeSubmitting, setPlaceSubmitting] = useState(false);
  const [placeMsg, setPlaceMsg] = useState('');
  const [placeSubmitted, setPlaceSubmitted] = useState(false);

  // New Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogMsg, setBlogMsg] = useState('');

  // New Hotel Form State
  const [hotelName, setHotelName] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelRegion, setHotelRegion] = useState<HotelRegion>('north');
  const [hotelStars, setHotelStars] = useState('3');
  const [hotelPrice, setHotelPrice] = useState('');
  const [hotelOriginalPrice, setHotelOriginalPrice] = useState('');
  const [hotelImageUrl, setHotelImageUrl] = useState('');
  const [hotelDescription, setHotelDescription] = useState('');
  const [hotelAmenities, setHotelAmenities] = useState('');
  const [hotelDestinationId, setHotelDestinationId] = useState('');
  const [hotelFeatured, setHotelFeatured] = useState(false);
  const [hotelSubmitting, setHotelSubmitting] = useState(false);
  const [hotelMsg, setHotelMsg] = useState('');
  const [hotelItinerary, setHotelItinerary] = useState<HotelItineraryDay[]>([]);
  const [itineraryChanged, setItineraryChanged] = useState(false);
  const [itineraryError, setItineraryError] = useState('');
  const [itineraryFileName, setItineraryFileName] = useState('');
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  const handleItineraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after fixing it
    if (!file) return;

    setItineraryError('');
    try {
      const days = await parseItineraryFile(file);
      setHotelItinerary(days);
      setItineraryChanged(true);
      setItineraryFileName(file.name);
    } catch (err: any) {
      setItineraryError(err.message || 'Could not read this file. Please upload a .xlsx file.');
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleHotelImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setHotelMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(`hotel-${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(`hotel-${fileName}`);
      setHotelImageUrl(data.publicUrl);
      setHotelMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setHotelMsg(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setBlogMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(`blog-${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(`blog-${fileName}`);
      setBlogImageUrl(data.publicUrl);
      setBlogMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setBlogMsg(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePlaceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setPlaceMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(`place-${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(`place-${fileName}`);
      setPlaceImageUrl(data.publicUrl);
      setPlaceMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setPlaceMsg(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setTourMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName);
      setTourImageUrl(data.publicUrl);
      setTourMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setTourMsg(`Error uploading image: ${error.message || 'Unknown error'}. Did you create the "tour-images" bucket?`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('thenavigators_admin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
      fetchAdminDestinations();
    }
  }, []);

  const contentPage = CONTENT_PAGES[activeTab];

  /** Load the current page of the open Tours / Places / Hotels / Blogs list, plus tab and sidebar counts. */
  const fetchContent = async () => {
    if (!contentPage) return;
    const { table, filters } = contentPage;
    // Ignore responses from an older request if the page / filter changed meanwhile
    const requestId = ++contentRequestId.current;
    setLoadingContent(true);
    const [{ rows, total }, counts, totals] = await Promise.all([
      getAdminList(table, { filter: listFilter, search: debouncedListSearch, page: listPage, pageSize: ADMIN_PAGE_SIZE }),
      getAdminListCounts(
        table,
        filters.filter((f) => f.value !== 'all').map((f) => f.value),
        debouncedListSearch
      ),
      getAdminTotals(),
    ]);
    if (requestId !== contentRequestId.current) return;
    setContentCounts(counts);
    setContentTotals(totals);
    // Page emptied (e.g. last row deleted): step back a page
    if (rows.length === 0 && listPage > 1) {
      setListPage((p) => p - 1);
      return;
    }
    setContent({ table, rows, total });
    setLoadingContent(false);
  };

  // After add / edit / delete: reload the open list
  const fetchAdminTours = () => fetchContent();
  const fetchAdminBlogs = () => fetchContent();
  const fetchAdminHotels = () => fetchContent();
  const fetchAdminDestinations = async () => {
    fetchContent();
    setAdminDestinations(await getDestinations());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError('Please enter valid email and password.');
      return;
    }

    if (
      adminEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
      adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('thenavigators_admin_session', 'true');
      fetchAdminDestinations();
      return;
    }

    if (supabase) {
      const { data: isValid, error } = await supabase.rpc('verify_admin_login', {
        admin_email: adminEmail,
        admin_password: adminPassword,
      });
      if (error || !isValid) {
        setLoginError(error?.message || 'Invalid email or password.');
      } else {
        setIsAuthenticated(true);
        localStorage.setItem('thenavigators_admin_session', 'true');
        fetchAdminDestinations();
      }
    } else {
      setLoginError('Database connection not established.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('thenavigators_admin_session');
  };

  const leadKind = activeTab === 'callbacks' ? 'callbacks' : 'leads';

  const fetchLeads = async () => {
    // Ignore responses from an older request if the tab / filter changed meanwhile
    const requestId = ++leadsRequestId.current;
    setLoadingLeads(true);
    const [{ rows, total }, counts] = await Promise.all([
      getInquiries(leadKind, listFilter as InquiryStatusFilter, debouncedListSearch, listPage, INQUIRIES_PAGE_SIZE),
      getInquiryCounts(debouncedListSearch),
    ]);
    if (requestId !== leadsRequestId.current) return;
    setInquiryCounts(counts);
    // Page emptied (e.g. last row deleted / moved to another status): step back a page
    if (rows.length === 0 && listPage > 1) {
      setListPage((p) => p - 1);
      return;
    }
    setInquiries(rows);
    setLeadTotal(total);
    setLoadingLeads(false);
  };

  // Query the database only after typing pauses
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedListSearch(listSearch.trim());
      setListPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [listSearch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Inquiry counts feed the sidebar badges, so load them once even when starting on another page
    if (activeTab === 'leads' || activeTab === 'callbacks' || !inquiryCounts) fetchLeads();
    if (contentPage) fetchContent();
    else if (!contentTotals) getAdminTotals().then(setContentTotals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab, listFilter, debouncedListSearch, listPage]);

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    const previous = inquiries;
    // Optimistic: show the new status right away, roll back if the save fails
    setInquiries((list) => list.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
    const res = await updateInquiryStatus(id, status);
    if (!res.success) {
      setInquiries(previous);
      alert(`Could not update status. ${res.message}`);
      return;
    }
    fetchLeads();
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteInquiry(id);
      fetchLeads();
    }
  };

  const closeFormModal = () => setFormModal(null);

  const finishForm = (message: string) => {
    setFormModal(null);
    setNotice(message);
  };

  /** Textarea value (one item per line) -> trimmed, non-empty list. */
  const toLines = (text: string) => text.split('\n')?.map((l) => l.trim()).filter(Boolean);

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourSubmitting(true);
    setTourMsg('');

    const highlights = [tourHighlight1, tourHighlight2].filter(Boolean);
    const inclusions = toLines(tourInclusions);
    const destinationId = tourDestinationId || null;
    
    let res;
    if (editingTourId) {
      // Update existing tour
      res = await updateTour(editingTourId, {
        title: tourTitle,
        location: tourLocation,
        category: tourCategory,
        price: parseFloat(tourPrice) || 9999,
        originalPrice: tourOriginalPrice ? parseFloat(tourOriginalPrice) : undefined,
        durationNights: parseInt(tourNights) || 5,
        durationDays: parseInt(tourDays) || 6,
        imageUrl: tourImageUrl || undefined,
        // Empty lists fall back to the destination's highlights / inclusions
        highlights,
        inclusions,
        destinationId,
      });
      if (res.success) {
        setEditingTourId(null);
        fetchAdminTours();
      }
    } else {
      // Create new tour
      const baseSlug = tourTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const slug = `${baseSlug}-${randomSuffix}`;
      
      res = await createTour({
        title: tourTitle,
        slug,
        location: tourLocation,
        category: tourCategory,
        price: parseFloat(tourPrice) || 9999,
        originalPrice: tourOriginalPrice ? parseFloat(tourOriginalPrice) : undefined,
        durationNights: parseInt(tourNights) || 5,
        durationDays: parseInt(tourDays) || 6,
        rating: 5.0,
        reviewCount: 10,
        imageUrl: tourImageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
        highlights,
        inclusions,
        destinationId,
        isFeatured: true,
        isTrending: true,
      });

      if (res.success) {
        try {
          fetch('/api/notify-subscribers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tourTitle, slug }),
          });
        } catch (err) {
          console.error('Failed to send emails', err);
        }
      }
    }

    setTourMsg(res.message);
    setTourSubmitting(false);
    if (res.success) {
      fetchAdminTours();
      finishForm(res.message);
    }
    
    if (res.success && !editingTourId) {
      setTourTitle('');
      setTourLocation('');
      setTourPrice('');
      setTourOriginalPrice('');
      setTourImageUrl('');
      setTourHighlight1('');
      setTourHighlight2('');
      setTourInclusions('');
      setTourDestinationId('');
    }
  };

  const handleEditTour = (tour: TourPackage) => {
    setEditingTourId(tour.id!);
    setTourTitle(tour.title);
    setTourLocation(tour.location);
    setTourCategory(tour.category);
    setTourPrice(tour.price.toString());
    setTourOriginalPrice(tour.originalPrice ? tour.originalPrice.toString() : '');
    setTourNights(tour.durationNights.toString());
    setTourDays(tour.durationDays.toString());
    setTourImageUrl(tour.imageUrl);
    setTourHighlight1(tour.ownHighlights?.[0] || '');
    setTourHighlight2(tour.ownHighlights?.[1] || '');
    setTourInclusions((tour.ownInclusions || []).join('\n'));
    setTourDestinationId(tour.destinationId || '');
    setTourMsg('');
    setFormModal('tour');
  };

  const handleDeleteTour = async (id: string) => {
    if (confirm('Are you sure you want to delete this tour package?')) {
      await deleteTour(id);
      fetchAdminTours();
    }
  };

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaceSubmitting(true);
    setPlaceMsg('');

    let res;
    if (editingDestinationId) {
      res = await updateDestination(editingDestinationId, {
        name: placeName,
        category: placeCategory,
        imageUrl: placeImageUrl || undefined,
        highlights: toLines(placeHighlights),
        inclusions: toLines(placeInclusions),
      });
      if (res.success) {
        setEditingDestinationId(null);
        fetchAdminDestinations();
      }
    } else {
      const slug = placeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      res = await createDestination({
        name: placeName,
        slug,
        category: placeCategory,
        imageUrl: placeImageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
        packageCount: 12,
        highlights: toLines(placeHighlights),
        inclusions: toLines(placeInclusions),
      });
    }

    setPlaceMsg(res.message);
    setPlaceSubmitting(false);
    if (res.success) {
      fetchAdminDestinations();
      finishForm(res.message);
    }

    if (res.message.includes('successfully') && !editingDestinationId) {
      setPlaceSubmitted(true);
      setPlaceName('');
      setPlaceImageUrl('');
      setPlaceHighlights('');
      setPlaceInclusions('');
    }
  };

  const handleEditPlace = (place: Destination) => {
    setEditingDestinationId(place.id!);
    setPlaceName(place.name);
    setPlaceCategory(place.category);
    setPlaceImageUrl(place.imageUrl);
    setPlaceHighlights((place.highlights || []).join('\n'));
    setPlaceInclusions((place.inclusions || []).join('\n'));
    setPlaceMsg('');
    setPlaceSubmitted(false);
    setFormModal('place');
  };

  const handleDeletePlace = async (id: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      await deleteDestination(id);
      fetchAdminDestinations();
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogSubmitting(true);
    setBlogMsg('');

    let res;
    if (editingBlogId) {
      res = await updateBlog(editingBlogId, {
        title: blogTitle,
        author: blogAuthor,
        content: blogContent,
        image_url: blogImageUrl || undefined,
      });
      if (res.success) {
        setEditingBlogId(null);
        fetchAdminBlogs();
      }
    } else {
      res = await createBlog({
        title: blogTitle,
        author: blogAuthor,
        content: blogContent,
        image_url: blogImageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
      });
    }

    setBlogMsg(res.message);
    setBlogSubmitting(false);
    if (res.success) {
      fetchAdminBlogs();
      finishForm(res.message);
    }
    
    if (res.success && !editingBlogId) {
      setBlogTitle('');
      setBlogContent('');
      setBlogAuthor('');
      setBlogImageUrl('');
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id!);
    setBlogTitle(blog.title);
    setBlogAuthor(blog.author);
    setBlogContent(blog.content);
    setBlogImageUrl(blog.image_url);
    setBlogMsg('');
    setFormModal('blog');
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlog(id);
      fetchAdminBlogs();
    }
  };

  const resetHotelForm = () => {
    setEditingHotelId(null);
    setHotelName('');
    setHotelLocation('');
    setHotelRegion('north');
    setHotelStars('3');
    setHotelPrice('');
    setHotelOriginalPrice('');
    setHotelImageUrl('');
    setHotelDescription('');
    setHotelAmenities('');
    setHotelDestinationId('');
    setHotelFeatured(false);
    setHotelItinerary([]);
    setItineraryChanged(false);
    setItineraryError('');
    setItineraryFileName('');
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setHotelSubmitting(true);
    setHotelMsg('');

    const hotelData = {
      name: hotelName,
      location: hotelLocation,
      category: hotelRegion === 'international' ? ('international' as const) : ('domestic' as const),
      region: hotelRegion,
      starRating: parseInt(hotelStars) || 3,
      pricePerNight: parseFloat(hotelPrice) || 0,
      originalPrice: hotelOriginalPrice ? parseFloat(hotelOriginalPrice) : undefined,
      description: hotelDescription,
      amenities: toLines(hotelAmenities),
      destinationId: hotelDestinationId || null,
      isFeatured: hotelFeatured,
    };

    let res;
    let hotelId = editingHotelId;
    if (editingHotelId) {
      res = await updateHotel(editingHotelId, {
        ...hotelData,
        imageUrl: hotelImageUrl || undefined,
      });
    } else {
      const baseSlug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      res = await createHotel({
        ...hotelData,
        slug: `${baseSlug}-${randomSuffix}`,
        imageUrl: hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      });
      hotelId = res.id || null;
    }

    let message = res.message;
    let itinerarySaved = true;
    // Only touch the itinerary when a file was uploaded or it was cleared
    if (res.success && hotelId && itineraryChanged) {
      const itRes = await saveHotelItinerary(hotelId, hotelItinerary);
      itinerarySaved = itRes.success;
      message = `${message} ${itRes.message}`;
      if (itRes.success) setItineraryChanged(false);
    }

    setHotelMsg(message);
    setHotelSubmitting(false);

    if (res.success) {
      fetchAdminHotels();
      if (itinerarySaved) finishForm(message);
      if (!editingHotelId && itinerarySaved) {
        resetHotelForm();
      } else if (!editingHotelId && hotelId) {
        // Hotel exists but the itinerary failed: switch to editing so a retry updates it instead of duplicating
        setEditingHotelId(hotelId);
      }
    }
  };

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotelId(hotel.id!);
    setHotelName(hotel.name);
    setHotelLocation(hotel.location);
    setHotelRegion(hotel.region);
    setHotelStars(hotel.starRating.toString());
    setHotelPrice(hotel.pricePerNight.toString());
    setHotelOriginalPrice(hotel.originalPrice ? hotel.originalPrice.toString() : '');
    setHotelImageUrl(hotel.imageUrl);
    setHotelDescription(hotel.description || '');
    setHotelAmenities(hotel.amenities.join('\n'));
    setHotelDestinationId(hotel.destinationId || '');
    setHotelFeatured(!!hotel.isFeatured);
    setHotelMsg('');
    setHotelItinerary([]);
    setItineraryChanged(false);
    setItineraryError('');
    setItineraryFileName('');
    setFormModal('hotel');

    setLoadingItinerary(true);
    getHotelItinerary(hotel.id!).then((days) => {
      setHotelItinerary(days);
      setLoadingItinerary(false);
    });
  };

  const handleDeleteHotel = async (id: string) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      await deleteHotel(id);
      fetchAdminHotels();
    }
  };

  // If NOT authenticated, show Admin Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white text-brand-ink w-full max-w-md p-8 rounded-2xl border border-gray-300 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center mx-auto mb-3 border border-gray-300 shadow-glow">
              <ShieldAlert className="w-8 h-8 text-white font-extrabold" />
            </div>
            <h2 className="text-2xl font-black text-brand-ink">The Navigators Admin Portal</h2>
            <p className="text-xs text-brand-muted mt-1">Sign in with your admin credentials to access leads & packages.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-600 text-xs rounded-xl mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Admin Email *</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@thenavigators.com"
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Password *</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-blue text-white hover:brightness-110 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-glow transition-all"
            >
              ACCESS ADMIN DASHBOARD
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-brand-muted hover:text-brand-blue">
              ← Return to The Navigators Main Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  type AdminTab = typeof activeTab;
  type NavItem = {
    tab: AdminTab;
    label: string;
    Icon: LucideIcon;
    count?: number;
    /** Button shown at the top of this page that opens the add form popup. */
    add?: { label: string; onClick: () => void };
  };

  const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
    {
      title: 'Enquiries',
      items: [
        { tab: 'leads', label: 'Lead Inquiries', Icon: Clock, count: inquiryCounts?.leads.all ?? 0 },
        { tab: 'callbacks', label: 'Call Me Now', Icon: PhoneCall, count: inquiryCounts?.callbacks.all ?? 0 },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          tab: 'manage-tours',
          label: 'Tours',
          Icon: Sparkles,
          count: contentTotals?.tours ?? 0,
          add: {
            label: 'Add Tour',
            onClick: () => {
              setEditingTourId(null);
              setTourTitle('');
              setTourLocation('');
              setTourPrice('');
              setTourOriginalPrice('');
              setTourImageUrl('');
              setTourHighlight1('');
              setTourHighlight2('');
              setTourInclusions('');
              setTourDestinationId('');
              setTourMsg('');
              setFormModal('tour');
            },
          },
        },
        {
          tab: 'manage-places',
          label: 'Places',
          Icon: MapPin,
          count: contentTotals?.destinations ?? 0,
          add: {
            label: 'Add Place',
            onClick: () => {
              setEditingDestinationId(null);
              setPlaceName('');
              setPlaceImageUrl('');
              setPlaceHighlights('');
              setPlaceInclusions('');
              setPlaceSubmitted(false);
              setPlaceMsg('');
              setFormModal('place');
            },
          },
        },
        {
          tab: 'manage-hotels',
          label: 'Hotels',
          Icon: HotelIcon,
          count: contentTotals?.hotels ?? 0,
          add: {
            label: 'Add Hotel',
            onClick: () => {
              resetHotelForm();
              setHotelMsg('');
              setFormModal('hotel');
            },
          },
        },
        {
          tab: 'manage-blogs',
          label: 'Blogs',
          Icon: BookOpen,
          count: contentTotals?.blogs ?? 0,
          add: {
            label: 'Add Blog',
            onClick: () => {
              setEditingBlogId(null);
              setBlogTitle('');
              setBlogContent('');
              setBlogAuthor('');
              setBlogImageUrl('');
              setBlogMsg('');
              setFormModal('blog');
            },
          },
        },
      ],
    },
  ];

  const rowsOf = <T,>(table: AdminListTable): T[] => (content?.table === table ? (content.rows as T[]) : []);
  const tourRows = rowsOf<TourPackage>('tours');
  const placeRows = rowsOf<Destination>('destinations');
  const hotelRows = rowsOf<Hotel>('hotels');
  const blogRows = rowsOf<Blog>('blogs');
  const listFiltered = listFilter !== 'all' || debouncedListSearch !== '';

  const activeItem = NAV_SECTIONS.flatMap((sec) => sec.items).find((item) => item.tab === activeTab);

  const sidebar = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="px-5 py-5 border-b border-gray-200 flex items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-brand-orange shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-black text-brand-ink leading-tight">The Navigators</p>
          <p className="text-[11px] text-brand-muted">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS?.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items?.map(({ tab, label, Icon, count }) => {
                const active = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      onClick={() => {
                        if (tab !== activeTab) setContent(null);
                        setActiveTab(tab);
                        setListFilter('all');
                        setListPage(1);
                        setListSearch('');
                        setDebouncedListSearch('');
                        setNotice('');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        active ? 'bg-brand-blue text-white shadow-glow' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-ink'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{label}</span>
                      {count !== undefined && (
                        <span className={`min-w-[22px] px-1.5 py-0.5 rounded-full text-[10px] text-center ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" /> Back to Main Site
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  // Admin Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 text-brand-ink lg:flex">
      {/* Desktop sidebar (sits below the 102px site header) */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-[102px] h-[calc(100vh-102px)]">{sidebar}</aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-[110] flex">
            <div className="w-64 max-w-[80%] h-full shadow-2xl">{sidebar}</div>
            <button className="flex-1 bg-black/40" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
          </div>,
          document.body
        )}

      <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-brand-ink" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-brand-ink">{activeItem?.label}</h1>
          {activeItem?.add && (
            <button
              onClick={activeItem.add.onClick}
              className="ml-auto inline-flex items-center gap-2 bg-brand-blue text-white hover:brightness-110 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-glow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              {activeItem.add.label}
            </button>
          )}
        </div>

        {notice && (
          <div className="p-3 mb-6 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice('')} className="p-0.5 hover:text-emerald-900" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {(activeTab === 'leads' || activeTab === 'callbacks' || contentPage) && (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <FilterTabs
              options={contentPage ? contentPage.filters : STATUS_FILTER_OPTIONS}
              value={listFilter}
              counts={contentPage ? contentCounts : inquiryCounts?.[leadKind] ?? {}}
              onChange={(value) => {
                setListFilter(value);
                setListPage(1);
              }}
            />
            <SearchBox
              value={listSearch}
              onChange={setListSearch}
              placeholder={contentPage ? contentPage.searchHint : 'Search name, email, phone, package...'}
            />
          </div>
        )}

        {/* TAB 1: LEADS MANAGER */}
        {activeTab === 'leads' && (
          <div>
            {loadingLeads ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-brand-muted">Fetching inquiries from database...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-ink mb-1">{debouncedListSearch ? `No inquiries match "${debouncedListSearch}"` : listFilter === 'all' ? 'No Inquiries Received Yet' : `No ${listFilter} inquiries`}</h3>
                <p className="text-xs text-brand-muted mb-4">When customers submit quotes or booking forms on the website, their details will appear here in real-time.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-brand-muted uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Customer Name</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Requested Package</th>
                        <th className="px-6 py-4">Travel Date & Guests</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inquiries?.map((inq, idx) => (
                        <tr key={inq.id || idx} className="hover:bg-gray-100/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-brand-ink">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-brand-blue" />
                              <span>{inq.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <a href={`tel:${inq.phone}`} className="flex items-center gap-1.5 text-gray-800 hover:text-brand-blue font-semibold">
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{inq.phone}</span>
                            </a>
                            {inq.email && (
                              <div className="flex items-center gap-1.5 text-brand-muted">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{inq.email}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-blue">
                            {inq.tourTitle || 'General Quote Inquiry'}
                            {inq.message && (
                              <div className="mt-1 text-[11px] font-normal text-brand-muted whitespace-pre-line max-w-xs">{inq.message}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div>Date: {inq.travelDate || 'Flexible'}</div>
                            <div className="text-[11px] text-brand-muted">Guests: {inq.guestsCount || 2} Persons</div>
                          </td>
                          <td className="px-6 py-4">
                            {inq.id ? (
                              <StatusSelect status={inq.status} onChange={(status) => handleStatusChange(inq.id!, status)} />
                            ) : (
                              <span className="capitalize text-[11px] font-bold">{inq.status || 'pending'}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => inq.id && handleDeleteInquiry(inq.id)}
                              className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.2: CALL ME NOW REQUESTS */}
        {activeTab === 'callbacks' && (
          <div>
            {loadingLeads ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-brand-muted">Fetching call-back requests...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <PhoneCall className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-ink mb-1">{debouncedListSearch ? `No call-back requests match "${debouncedListSearch}"` : listFilter === 'all' ? 'No Call-back Requests Yet' : `No ${listFilter} call-back requests`}</h3>
                <p className="text-xs text-brand-muted">Numbers entered in the &quot;Call Me Now&quot; boxes on the website will appear here.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-brand-muted uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Phone Number</th>
                        <th className="px-6 py-4">Requested From</th>
                        <th className="px-6 py-4">Requested At</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inquiries?.map((req, idx) => (
                        <tr key={req.id || idx} className="hover:bg-gray-100/50 transition-colors">
                          <td className="px-6 py-4">
                            <a href={`tel:${req.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 font-bold text-sm text-brand-ink hover:text-brand-blue">
                              <Phone className="w-4 h-4 text-emerald-500" />
                              {req.phone}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-gray-600 capitalize">
                            {req.message?.replace(/^Requested (an instant )?a? ?call back from the /, '').replace(/\.$/, '') || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {req.createdAt ? new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            {req.id && <StatusSelect status={req.status} onChange={(status) => handleStatusChange(req.id!, status)} />}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <a
                                href={`tel:${req.phone.replace(/\s+/g, '')}`}
                                className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-colors font-bold"
                              >
                                Call
                              </a>
                              <button
                                onClick={() => req.id && handleDeleteInquiry(req.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors"
                                title="Delete Request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'leads' || activeTab === 'callbacks') && !loadingLeads && (
          <Pagination
            page={listPage}
            pageSize={INQUIRIES_PAGE_SIZE}
            total={leadTotal}
            onChange={(page) => {
              setListPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 1.5: MANAGE TOURS */}
        {activeTab === 'manage-tours' && (
          <div>
            {loadingContent || content?.table !== 'tours' ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-brand-muted">Fetching tours from database...</p>
              </div>
            ) : tourRows.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-ink mb-1">{listFiltered ? 'No matching tours' : 'No Tours Found'}</h3>
                <p className="text-xs text-brand-muted mb-4">You haven't created any tour packages yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-brand-muted uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Title & Location</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tourRows?.map((tour) => (
                        <tr key={tour.id} className="hover:bg-gray-100/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={tour.imageUrl} alt={tour.title} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-brand-ink text-sm mb-1">{tour.title}</div>
                            <div className="text-brand-muted flex items-center gap-1"><MapPin className="w-3 h-3"/> {tour.location}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-blue">
                            ₹{tour.price.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {tour.durationDays}D / {tour.durationNights}N
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditTour(tour)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-brand-blue text-brand-blue hover:text-white border border-blue-200 hover:border-brand-blue rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => tour.id && handleDeleteTour(tour.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors"
                                title="Delete Tour"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.6: MANAGE PLACES */}
        {activeTab === 'manage-places' && (
          <div>
            {loadingContent || content?.table !== 'destinations' ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-brand-muted">Fetching destinations from database...</p>
              </div>
            ) : placeRows.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-ink mb-1">{listFiltered ? 'No matching places' : 'No Places Found'}</h3>
                <p className="text-xs text-brand-muted mb-4">You haven't created any destinations yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-brand-muted uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Destination Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {placeRows?.map((place) => (
                        <tr key={place.id} className="hover:bg-gray-100/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={place.imageUrl} alt={place.name} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4 font-bold text-brand-ink text-sm">
                            {place.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 capitalize">
                            {place.category}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditPlace(place)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-brand-blue text-brand-blue hover:text-white border border-blue-200 hover:border-brand-blue rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => place.id && handleDeletePlace(place.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors"
                                title="Delete Place"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.7: MANAGE BLOGS */}
        {activeTab === 'manage-blogs' && (
          <div>
            {loadingContent || content?.table !== 'blogs' ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-brand-muted">Fetching blogs from database...</p>
              </div>
            ) : blogRows.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-ink mb-1">{listFiltered ? 'No matching blogs' : 'No Blogs Found'}</h3>
                <p className="text-xs text-brand-muted mb-4">You haven't created any blogs yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-brand-muted uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {blogRows?.map((blog) => (
                        <tr key={blog.id} className="hover:bg-gray-100/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={blog.image_url} alt={blog.title} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4 font-bold text-brand-ink text-sm">
                            {blog.title}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {blog.author}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditBlog(blog)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-brand-blue text-brand-blue hover:text-white border border-blue-200 hover:border-brand-blue rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => blog.id && handleDeleteBlog(blog.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors"
                                title="Delete Blog"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.8: MANAGE HOTELS */}
        {activeTab === 'manage-hotels' && (
          <div>
            {loadingContent || content?.table !== 'hotels' ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-brand-muted">Fetching hotels from database...</p>
              </div>
            ) : hotelRows.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <HotelIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-ink mb-1">{listFiltered ? 'No matching hotels' : 'No Hotels Found'}</h3>
                <p className="text-xs text-brand-muted mb-4">You haven't added any hotels yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-brand-muted uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Hotel & Location</th>
                        <th className="px-6 py-4">Region</th>
                        <th className="px-6 py-4">Stars</th>
                        <th className="px-6 py-4">Price / Night</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {hotelRows?.map((hotel) => (
                        <tr key={hotel.id} className="hover:bg-gray-100/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={hotel.imageUrl} alt={hotel.name} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-brand-ink text-sm mb-1">
                              {hotel.name}
                              {hotel.isFeatured && (
                                <span className="ml-2 align-middle bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded-full text-[10px] font-bold">Featured</span>
                              )}
                            </div>
                            <div className="text-brand-muted flex items-center gap-1"><MapPin className="w-3 h-3"/> {hotel.location}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {HOTEL_REGIONS.find((r) => r.value === hotel.region)?.label}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: hotel.starRating })?.map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-blue">
                            ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditHotel(hotel)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-brand-blue text-brand-blue hover:text-white border border-blue-200 hover:border-brand-blue rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => hotel.id && handleDeleteHotel(hotel.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors"
                                title="Delete Hotel"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {contentPage && !loadingContent && content?.table === contentPage.table && (
          <Pagination
            page={listPage}
            pageSize={ADMIN_PAGE_SIZE}
            total={content.total}
            onChange={(page) => {
              setListPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 2: CREATE / EDIT NEW TOUR PACKAGE */}
        {formModal === 'tour' && (
          <FormModal onClose={closeFormModal} wide>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-1 pr-10">
              <h3 className="text-xl font-bold text-brand-ink flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-blue" /> {editingTourId ? 'Edit Tour Package' : 'Add New Tour Package'}
              </h3>
            </div>
            <p className="text-xs text-brand-muted mb-6">{editingTourId ? 'Update the details for this tour package.' : 'Fill in the tour details below to publish a new package to your website.'}</p>

            {tourMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{tourMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTour} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tour Package Title *</label>
                <input
                  type="text"
                  required
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  placeholder="e.g. Exotic Sikkim & Gangtok Wonderland Package"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Location / Destination *</label>
                  <input
                    type="text"
                    required
                    value={tourLocation}
                    onChange={(e) => setTourLocation(e.target.value)}
                    placeholder="e.g. Gangtok, Sikkim"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Category *</label>
                  <select
                    value={tourCategory}
                    onChange={(e) => setTourCategory(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  >
                    <option value="domestic">Domestic (India)</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Special Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={tourPrice}
                    onChange={(e) => setTourPrice(e.target.value)}
                    placeholder="14999"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Original Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    value={tourOriginalPrice}
                    onChange={(e) => setTourOriginalPrice(e.target.value)}
                    placeholder="19999"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Number of Nights</label>
                  <input
                    type="number"
                    value={tourNights}
                    onChange={(e) => setTourNights(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Number of Days</label>
                  <input
                    type="number"
                    value={tourDays}
                    onChange={(e) => setTourDays(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cover Image (Upload or Paste URL) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={tourImageUrl}
                    onChange={(e) => setTourImageUrl(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      title="Upload Image"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      className="bg-gray-100 hover:bg-slate-700 border border-gray-300 text-brand-ink px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {isUploadingImage ? (
                        <svg className="animate-spin h-4 w-4 text-brand-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Destination (default highlights &amp; inclusions)</label>
                <select
                  value={tourDestinationId}
                  onChange={(e) => setTourDestinationId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                >
                  <option value="">— None —</option>
                  {adminDestinations?.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Key Highlight 1</label>
                <input
                  type="text"
                  value={tourHighlight1}
                  onChange={(e) => setTourHighlight1(e.target.value)}
                  placeholder="e.g. Glacial Tsomgo Lake & Nathula Pass Visit"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Key Highlight 2</label>
                <input
                  type="text"
                  value={tourHighlight2}
                  onChange={(e) => setTourHighlight2(e.target.value)}
                  placeholder="e.g. Kanchenjunga View from Pelling Skywalk"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">What&apos;s Included (one per line)</label>
                <textarea
                  rows={4}
                  value={tourInclusions}
                  onChange={(e) => setTourInclusions(e.target.value)}
                  placeholder="Leave empty to use the destination's inclusions"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <button
                type="submit"
                disabled={tourSubmitting || isUploadingImage}
                className="w-full bg-brand-blue text-white hover:brightness-110 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
              >
                {tourSubmitting ? 'Saving Tour...' : (editingTourId ? 'UPDATE TOUR PACKAGE' : 'PUBLISH TOUR PACKAGE')}
              </button>
            </form>
          </div>
          </FormModal>
        )}

        {/* TAB 3: CREATE NEW PLACE / DESTINATION */}
        {formModal === 'place' && (
          <FormModal onClose={closeFormModal}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-1 pr-10">
              <h3 className="text-xl font-bold text-brand-ink flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-blue" /> {editingDestinationId ? 'Edit Tourist Place' : 'Add New Tourist Place / Destination'}
              </h3>
            </div>
            <p className="text-xs text-brand-muted mb-6">{editingDestinationId ? 'Update the details for this destination.' : 'Add a new destination card to the Popular Destinations grid on the home page.'}</p>

            {placeSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-700">Place Added Successfully!</h4>
                <p className="text-xs text-emerald-700">{placeMsg || 'The new destination has been published.'}</p>
                <button
                  onClick={() => {
                    setPlaceSubmitted(false);
                    setPlaceMsg('');
                  }}
                  className="mt-6 bg-brand-blue text-white hover:brightness-110 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-glow transition-all text-xs uppercase tracking-wider"
                >
                  Add Another Place
                </button>
              </div>
            ) : (
              <>
                {placeMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs rounded-xl mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{placeMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreatePlace} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Destination Name *</label>
                    <input
                      type="text"
                      required
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      placeholder="e.g. Manali & Solang Valley"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Category *</label>
                    <select
                      value={placeCategory}
                      onChange={(e) => setPlaceCategory(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                    >
                      <option value="domestic">Domestic (India)</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cover Image (Upload or Paste URL) *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={placeImageUrl}
                        onChange={(e) => setPlaceImageUrl(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePlaceImageUpload}
                          disabled={isUploadingImage}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          title="Upload Image"
                        />
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          className="bg-gray-100 hover:bg-slate-700 border border-gray-300 text-brand-ink px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {isUploadingImage ? (
                            <svg className="animate-spin h-4 w-4 text-brand-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            'Upload'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Tour Highlights (one per line)</label>
                    <textarea
                      rows={5}
                      value={placeHighlights}
                      onChange={(e) => setPlaceHighlights(e.target.value)}
                      placeholder={'Tsomgo Lake & Baba Mandir\nNathula Pass Border Visit'}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">What&apos;s Included (one per line)</label>
                    <textarea
                      rows={5}
                      value={placeInclusions}
                      onChange={(e) => setPlaceInclusions(e.target.value)}
                      placeholder={'Hotel accommodation on twin sharing basis\nDaily breakfast & dinner'}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Shown on every package of this destination that has no highlights / inclusions of its own.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={placeSubmitting || isUploadingImage}
                    className="w-full bg-brand-blue text-white hover:brightness-110 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
                  >
                    {placeSubmitting ? 'Saving Place...' : (editingDestinationId ? 'UPDATE DESTINATION PLACE' : 'ADD DESTINATION PLACE')}
                  </button>
                </form>
              </>
            )}
          </div>
          </FormModal>
        )}

        {/* TAB 4: CREATE NEW BLOG */}
        {formModal === 'blog' && (
          <FormModal onClose={closeFormModal}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-1 pr-10">
              <h3 className="text-xl font-bold text-brand-ink flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-blue" /> {editingBlogId ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
            </div>
            <p className="text-xs text-brand-muted mb-6">{editingBlogId ? 'Update the details for this blog post.' : 'Write and publish a new blog post directly to your website.'}</p>

            {blogMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{blogMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Blog Title *</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Top 10 Places to Visit in Kerala"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={blogAuthor}
                  onChange={(e) => setBlogAuthor(e.target.value)}
                  placeholder="e.g. Admin Team"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cover Image (Upload or Paste URL) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={blogImageUrl}
                    onChange={(e) => setBlogImageUrl(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBlogImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      title="Upload Image"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      className="bg-gray-100 hover:bg-slate-700 border border-gray-300 text-brand-ink px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {isUploadingImage ? (
                        <svg className="animate-spin h-4 w-4 text-brand-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Blog Content *</label>
                <textarea
                  required
                  rows={8}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={blogSubmitting || isUploadingImage}
                className="w-full bg-brand-blue text-white hover:brightness-110 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
              >
                {blogSubmitting ? 'Saving Blog...' : (editingBlogId ? 'UPDATE BLOG POST' : 'PUBLISH BLOG')}
              </button>
            </form>
          </div>
          </FormModal>
        )}

        {/* TAB 5: CREATE / EDIT HOTEL */}
        {formModal === 'hotel' && (
          <FormModal onClose={closeFormModal} wide>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-1 pr-10">
              <h3 className="text-xl font-bold text-brand-ink flex items-center gap-2">
                <HotelIcon className="w-5 h-5 text-brand-blue" /> {editingHotelId ? 'Edit Hotel' : 'Add New Hotel'}
              </h3>
            </div>
            <p className="text-xs text-brand-muted mb-6">{editingHotelId ? 'Update the details for this hotel.' : 'Fill in the hotel details below to add it to your website.'}</p>

            {hotelMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{hotelMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateHotel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  required
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="e.g. The Himalayan Retreat Resort"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Location / City *</label>
                  <input
                    type="text"
                    required
                    value={hotelLocation}
                    onChange={(e) => setHotelLocation(e.target.value)}
                    placeholder="e.g. Manali, Himachal Pradesh"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Region *</label>
                  <select
                    value={hotelRegion}
                    onChange={(e) => setHotelRegion(e.target.value as HotelRegion)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  >
                    {HOTEL_REGIONS?.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Star Rating *</label>
                  <select
                    value={hotelStars}
                    onChange={(e) => setHotelStars(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  >
                    {[1, 2, 3, 4, 5]?.map((n) => (
                      <option key={n} value={n}>{n} Star</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Price per Night (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={hotelPrice}
                    onChange={(e) => setHotelPrice(e.target.value)}
                    placeholder="4999"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={hotelOriginalPrice}
                    onChange={(e) => setHotelOriginalPrice(e.target.value)}
                    placeholder="6999"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cover Image (Upload or Paste URL) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={hotelImageUrl}
                    onChange={(e) => setHotelImageUrl(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHotelImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      title="Upload Image"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      className="bg-gray-100 hover:bg-slate-700 border border-gray-300 text-brand-ink px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {isUploadingImage ? (
                        <svg className="animate-spin h-4 w-4 text-brand-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Destination (optional)</label>
                <select
                  value={hotelDestinationId}
                  onChange={(e) => setHotelDestinationId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                >
                  <option value="">— None —</option>
                  {adminDestinations?.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={hotelDescription}
                  onChange={(e) => setHotelDescription(e.target.value)}
                  placeholder="Short description of the property, rooms and surroundings..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Amenities (one per line)</label>
                <textarea
                  rows={4}
                  value={hotelAmenities}
                  onChange={(e) => setHotelAmenities(e.target.value)}
                  placeholder={'Free Wi-Fi\nComplimentary breakfast\nSwimming pool'}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-600">Itinerary (Day Wise) — Excel Upload</label>
                    <p className="text-[11px] text-gray-400 mt-0.5">Columns: Day, Location, Title, Nights, Description, Meals. Uploading replaces the current itinerary.</p>
                  </div>
                  <a
                    href="/samples/hotel-itinerary-sample.xlsx"
                    download
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download sample Excel
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleItineraryUpload}
                      disabled={loadingItinerary}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      title="Upload itinerary Excel"
                    />
                    <button
                      type="button"
                      disabled={loadingItinerary}
                      className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-brand-ink px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      {hotelItinerary.length > 0 ? 'Replace Excel File' : 'Upload Excel File'}
                    </button>
                  </div>
                  {itineraryFileName && <span className="text-[11px] text-brand-muted">{itineraryFileName}</span>}
                  {hotelItinerary.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setHotelItinerary([]);
                        setItineraryChanged(true);
                        setItineraryFileName('');
                      }}
                      className="text-xs text-red-500 hover:underline ml-auto"
                    >
                      Remove itinerary
                    </button>
                  )}
                </div>

                {itineraryError && (
                  <div className="p-2.5 bg-red-50 border border-red-300 text-red-600 text-xs rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{itineraryError}</span>
                  </div>
                )}

                {loadingItinerary ? (
                  <p className="text-xs text-brand-muted">Loading saved itinerary...</p>
                ) : hotelItinerary.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1.5">
                      {hotelItinerary.length} day{hotelItinerary.length === 1 ? '' : 's'}
                      {itineraryChanged ? ' — will be saved when you submit' : ' — saved'}
                    </p>
                    <ol className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                      {hotelItinerary?.map((d) => (
                        <li key={d.dayNumber} className="px-3 py-2 text-xs">
                          <div className="text-[11px] text-brand-muted">
                            Day {d.dayNumber}{d.location ? ` / (${d.location})` : ''}
                          </div>
                          <div className="font-semibold text-brand-ink">
                            {d.title}
                            {d.nights ? <span className="font-normal text-brand-muted"> ({d.nights} Night{d.nights === 1 ? '' : 's'})</span> : null}
                          </div>
                          {d.description && <p className="text-gray-600 mt-0.5 line-clamp-2">{d.description}</p>}
                          {d.meals && <p className="text-[11px] text-emerald-700 mt-0.5">{d.meals}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">{itineraryChanged ? 'Itinerary will be removed when you submit.' : 'No itinerary added.'}</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hotelFeatured}
                  onChange={(e) => setHotelFeatured(e.target.checked)}
                  className="w-4 h-4 accent-brand-blue"
                />
                Mark as featured hotel
              </label>

              <button
                type="submit"
                disabled={hotelSubmitting || isUploadingImage}
                className="w-full bg-brand-blue text-white hover:brightness-110 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
              >
                {hotelSubmitting ? 'Saving Hotel...' : (editingHotelId ? 'UPDATE HOTEL' : 'ADD HOTEL')}
              </button>
            </form>
          </div>
          </FormModal>
        )}
      </main>
    </div>
  );
}
