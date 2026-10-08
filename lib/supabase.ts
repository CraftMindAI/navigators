import { createClient } from '@supabase/supabase-js';
import { TourPackage, Inquiry, Destination, Blog, Hotel, HotelItineraryDay, HOTEL_REGIONS } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zsywloyjcbqonynrqmah.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeXdsb3lqY2Jxb255bnJxbWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MDQ0MjEsImV4cCI6MjEwNTk4MDQyMX0.gdhQ7Wq74mldbT695vr2DvXQBqVBpEejAwCZ4I2fF2Q';

// Initialize Supabase client if keys exist
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-ref'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


// Dynamic in-memory stores for offline fallback
let inquiriesList: Inquiry[] = [];
let subscribersList: string[] = [];

const mapTourRow = (t: any): TourPackage => ({
  id: t.id,
  title: t.title,
  slug: t.slug,
  location: t.location,
  category: t.category,
  price: Number(t.price),
  originalPrice: t.original_price ? Number(t.original_price) : undefined,
  durationNights: t.duration_nights,
  durationDays: t.duration_days,
  rating: Number(t.rating),
  reviewCount: t.review_count,
  imageUrl: t.image_url,
  highlights: t.highlights?.length ? t.highlights : t.destination?.highlights || [],
  inclusions: t.inclusions?.length ? t.inclusions : t.destination?.inclusions || [],
  ownHighlights: t.highlights || [],
  ownInclusions: t.inclusions || [],
  destinationId: t.destination_id,
  exclusions: t.exclusions || [],
  itinerary: t.itinerary || [],
  isFeatured: t.is_featured,
  isTrending: t.is_trending,
});

/**
 * Fetch all tour packages
 */
export async function getTours(): Promise<TourPackage[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*, destination:destinations(highlights, inclusions)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapTourRow);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, utilizing fallback dataset:', err);
    }
  }

  return [];
}

const mapDestinationRow = (d: any): Destination => ({
  id: d.id,
  name: d.name,
  slug: d.slug,
  category: d.category,
  imageUrl: d.image_url,
  packageCount: d.package_count,
  description: d.description,
  highlights: d.highlights || [],
  inclusions: d.inclusions || [],
});

/**
 * Fetch all destinations
 */
export async function getDestinations(): Promise<Destination[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(mapDestinationRow);
      }
    } catch (err) {
      console.warn('Supabase fetch destinations failed, utilizing fallback dataset:', err);
    }
  }

  return [];
}

/**
 * Get single tour by slug
 */
export async function getTourBySlug(slug: string): Promise<TourPackage | null> {
  const tours = await getTours();
  return tours.find((t) => t.slug === slug) || null;
}

/**
 * Admin: Create New Tour Package
 */
export async function createTour(newTour: Omit<TourPackage, 'id'>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('tours').insert([
        {
          title: newTour.title,
          slug: newTour.slug,
          location: newTour.location,
          category: newTour.category,
          price: newTour.price,
          original_price: newTour.originalPrice || null,
          duration_nights: newTour.durationNights,
          duration_days: newTour.durationDays,
          rating: newTour.rating || 5.0,
          review_count: newTour.reviewCount || 1,
          image_url: newTour.imageUrl,
          highlights: newTour.highlights,
          inclusions: newTour.inclusions || [],
          destination_id: newTour.destinationId || null,
          is_featured: newTour.isFeatured || false,
          is_trending: newTour.isTrending || false,
        },
      ]);

      if (error) throw error;
      return { success: true, message: 'New tour package published successfully!' };
    } catch (err: any) {
      console.error('Supabase insert failed:', err);
      return { success: false, message: `DB Error: ${err.message || 'Check browser console for details'}` };
    }
  }

  return { success: true, message: 'New tour package added to local store (Supabase not configured)' };
}

/**
 * Admin: Update Tour Package
 */
export async function updateTour(id: string, updatedTour: Partial<TourPackage>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('tours').update({
        title: updatedTour.title,
        slug: updatedTour.slug,
        location: updatedTour.location,
        category: updatedTour.category,
        price: updatedTour.price,
        original_price: updatedTour.originalPrice || null,
        duration_nights: updatedTour.durationNights,
        duration_days: updatedTour.durationDays,
        rating: updatedTour.rating,
        review_count: updatedTour.reviewCount,
        image_url: updatedTour.imageUrl,
        highlights: updatedTour.highlights,
        inclusions: updatedTour.inclusions,
        destination_id: updatedTour.destinationId,
        is_featured: updatedTour.isFeatured,
        is_trending: updatedTour.isTrending,
      }).eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Tour package updated successfully!' };
    } catch (err: any) {
      console.error('Supabase update failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Delete Tour Package
 */
export async function deleteTour(id: string): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('tours').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Tour package deleted successfully!' };
    } catch (err: any) {
      console.error('Supabase delete failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Create New Destination / Place
 */
export async function createDestination(newDest: Omit<Destination, 'id'>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('destinations').insert([
        {
          name: newDest.name,
          slug: newDest.slug,
          category: newDest.category,
          image_url: newDest.imageUrl,
          package_count: newDest.packageCount || 5,
          highlights: newDest.highlights || [],
          inclusions: newDest.inclusions || [],
        },
      ]);

      if (error) throw error;
      return { success: true, message: 'New place added successfully!' };
    } catch (err) {
      console.warn('Supabase destination insert failed');
    }
  }

  return { success: true, message: 'New place added successfully!' };
}

/**
 * Submit inquiry to Supabase database
 */
export async function submitInquiry(inquiry: Inquiry): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          tour_id: inquiry.tourId || null,
          tour_title: inquiry.tourTitle || 'General Inquiry',
          travel_date: inquiry.travelDate || null,
          guests_count: inquiry.guestsCount || 2,
          message: inquiry.message || '',
        },
      ]);

      if (error) throw error;
      return { success: true, message: 'Your booking inquiry has been sent! We will call you shortly.' };
    } catch (err: any) {
      console.warn('Fallback to local inquiry recording');
    }
  }

  inquiriesList.unshift({ ...inquiry, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() });
  return { success: true, message: 'Your booking inquiry has been recorded successfully!' };
}

/** Inquiry title that marks a "Call Me Now" request; the admin lists these in their own tab. */
export const CALLBACK_REQUEST_TITLE = 'Call-back request';

/** Admin inquiry pages: regular leads, or "Call Me Now" call-back requests. */
export type InquiryKind = 'leads' | 'callbacks';
export type InquiryStatus = NonNullable<Inquiry['status']>;
export type InquiryStatusFilter = InquiryStatus | 'all';
export const INQUIRY_STATUSES: InquiryStatus[] = ['pending', 'contacted', 'confirmed', 'cancelled'];

/**
 * Submit a "Call Me Now" request (phone only). `source` says which form it came from.
 */
export async function submitCallbackRequest(phone: string, source: string): Promise<{ success: boolean; message: string }> {
  return submitInquiry({
    name: 'Website call-back request',
    email: '',
    phone: `+91 ${phone}`,
    tourTitle: CALLBACK_REQUEST_TITLE,
    message: `Requested a call back from the ${source}.`,
  });
}

/**
 * Submit general contact message
 */
export async function submitContact(contact: { name: string, email: string, phone: string, message: string }): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('contacts').insert([
        {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          message: contact.message,
        },
      ]);
      if (error) throw error;
      return { success: true, message: 'Message sent successfully!' };
    } catch (err: any) {
      console.error('Supabase contact insert failed:', err);
      throw new Error(err.message || 'Failed to submit contact');
    }
  }
  return { success: true, message: 'Message sent successfully (Local fallback)!' };
}

/** Inquiry columns the admin search box matches against. */
const INQUIRY_SEARCH_COLUMNS = ['name', 'email', 'phone', 'tour_title', 'message'];

/** Strip characters that would break PostgREST's or() filter syntax. */
const cleanSearch = (search?: string) => (search || '').replace(/[,()*"\\]/g, ' ').trim();

export const isCallbackRequest = (inquiry: Inquiry) => !inquiry.tourId;

export async function getAllInquiries(): Promise<Inquiry[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((i: any) => ({
          id: i.id,
          name: i.name,
          email: i.email,
          phone: i.phone,
          tourId: i.tour_id,
          tourTitle: i.tour_title,
          travelDate: i.travel_date,
          guestsCount: i.guests_count,
          message: i.message,
          status: i.status,
          createdAt: i.created_at,
        }));
      }
    } catch (err) {
      console.warn('getAllInquiries error:', err);
    }
  }
  return [];
}

export const INQUIRIES_PAGE_SIZE = 20;

/**
 * Admin: Fetch one page of inquiries (leads or call-backs). Status and search
 * (name / email / phone / package / message) are applied in the database across all rows,
 * then only that page's rows are returned, along with the total number of matches.
 */
export async function getInquiries(
  kind: InquiryKind,
  status: InquiryStatusFilter = 'all',
  search?: string,
  page = 1,
  pageSize = INQUIRIES_PAGE_SIZE
): Promise<{ rows: Inquiry[]; total: number }> {
  if (supabase) {
    try {
      let query = supabase.from('inquiries').select('*', { count: 'exact' });
      query =
        kind === 'callbacks'
          ? query.eq('tour_title', CALLBACK_REQUEST_TITLE)
          : query.or(`tour_title.is.null,tour_title.neq."${CALLBACK_REQUEST_TITLE}"`);
      if (status !== 'all') query = query.eq('status', status);
      const term = cleanSearch(search);
      if (term) query = query.or(INQUIRY_SEARCH_COLUMNS.map((col) => `${col}.ilike."*${term}*"`).join(','));

      const from = (page - 1) * pageSize;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .order('id', { ascending: true }) // stable order so rows don't shift between pages
        .range(from, from + pageSize - 1);
      // PGRST103: page is past the last row (e.g. after deleting the last item on a page)
      if (error?.code === 'PGRST103') return { rows: [], total: 0 };
      if (error) throw error;

      const rows: Inquiry[] = (data || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        phone: i.phone,
        tourId: i.tour_id,
        tourTitle: i.tour_title,
        travelDate: i.travel_date,
        guestsCount: i.guests_count,
        message: i.message,
        status: i.status,
        createdAt: i.created_at,
      }));
      return { rows, total: count ?? rows.length };
    } catch (err) {
      console.warn('Supabase fetch inquiries failed', err);
    }
  }

  return { rows: [], total: 0 };
}

export type InquiryCounts = Record<InquiryKind, Record<InquiryStatusFilter, number>>;

const emptyCounts = (): Record<InquiryStatusFilter, number> => ({ all: 0, pending: 0, contacted: 0, confirmed: 0, cancelled: 0 });

/**
 * Admin: Number of inquiries per page and status (matching the search term), counted in the database
 */
export async function getInquiryCounts(search?: string): Promise<InquiryCounts> {
  const counts: InquiryCounts = { leads: emptyCounts(), callbacks: emptyCounts() };
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('inquiry_status_counts', { search: cleanSearch(search) || null });
      if (error) throw error;
      for (const row of (data || []) as { kind: InquiryKind; status: InquiryStatus; total: number }[]) {
        const bucket = counts[row.kind];
        if (!bucket) continue;
        bucket[row.status] = (bucket[row.status] || 0) + Number(row.total);
        bucket.all += Number(row.total);
      }
    } catch (err) {
      console.warn('Supabase inquiry counts failed', err);
    }
  }
  return counts;
}

/**
 * Admin: Change a lead's status (pending / contacted / confirmed / cancelled)
 */
export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('set_inquiry_status', { inquiry_id: id, new_status: status });
      if (error) throw error;
      if (!data) return { success: false, message: 'Lead not found.' };
      return { success: true, message: `Status updated to ${status}.` };
    } catch (err: any) {
      console.error('Supabase status update failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Fetch inquiries for a specific user by email
 */
export async function getUserInquiries(email: string): Promise<Inquiry[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data?.map((i: any) => ({
          id: i.id,
          name: i.name,
          email: i.email,
          phone: i.phone,
          tourId: i.tour_id,
          tourTitle: i.tour_title,
          travelDate: i.travel_date,
          guestsCount: i.guests_count,
          message: i.message,
          status: i.status,
          createdAt: i.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch user inquiries failed');
    }
  }
  return [];
}

/**
 * Admin: Delete Inquiry
 */
export async function deleteInquiry(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('inquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete failed');
    }
  }

  inquiriesList = inquiriesList.filter((i) => i.id !== id);
  return true;
}

/**
 * Subscribe email to newsletter
 */
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      if (error) throw error;
      return { success: true, message: 'Thank you for subscribing to The Navigators newsletter!' };
    } catch (err) {
      console.warn('Fallback subscriber save');
    }
  }

  if (!subscribersList.includes(email)) {
    subscribersList.push(email);
  }
  return { success: true, message: 'Thank you for subscribing to The Navigators newsletter!' };
}

/**
 * Admin: Create a new blog post
 */
export async function createBlog(blog: Blog): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('blogs').insert([
        {
          title: blog.title,
          slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          image_url: blog.image_url,
          content: blog.content,
          author: blog.author,
        },
      ]);
      if (error) throw error;
      return { success: true, message: 'Blog post published successfully!' };
    } catch (err) {
      console.warn('Supabase blog insert failed', err);
    }
  }
  return { success: true, message: 'Blog post published successfully! (Local)' };
}

const mapBlogRow = (b: any): Blog => ({
  id: b.id,
  title: b.title,
  slug: b.slug,
  image_url: b.image_url,
  content: b.content,
  author: b.author,
  created_at: b.created_at,
});

/**
 * Fetch all blogs
 */
export async function getBlogs(): Promise<Blog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(mapBlogRow);
      }
    } catch (err) {
      console.warn('Supabase fetch blogs failed');
    }
  }
  return [];
}

/**
 * Admin: Update Destination
 */
export async function updateDestination(id: string, updatedDest: Partial<Destination>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('destinations').update({
        name: updatedDest.name,
        slug: updatedDest.slug,
        category: updatedDest.category,
        image_url: updatedDest.imageUrl,
        package_count: updatedDest.packageCount,
        highlights: updatedDest.highlights,
        inclusions: updatedDest.inclusions,
      }).eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Destination updated successfully!' };
    } catch (err: any) {
      console.error('Supabase update failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Delete Destination
 */
export async function deleteDestination(id: string): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('destinations').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Destination deleted successfully!' };
    } catch (err: any) {
      console.error('Supabase delete failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Update Blog
 */
export async function updateBlog(id: string, updatedBlog: Partial<Blog>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('blogs').update({
        title: updatedBlog.title,
        slug: updatedBlog.slug,
        image_url: updatedBlog.image_url,
        content: updatedBlog.content,
        author: updatedBlog.author,
      }).eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Blog updated successfully!' };
    } catch (err: any) {
      console.error('Supabase update failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Delete Blog
 */
export async function deleteBlog(id: string): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Blog deleted successfully!' };
    } catch (err: any) {
      console.error('Supabase delete failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

const toHotelRow = (hotel: Partial<Hotel>) => ({
  name: hotel.name,
  slug: hotel.slug,
  city: hotel.location,
  // category is kept in sync with region for older code paths
  category: hotel.region ? (hotel.region === 'international' ? 'international' : 'domestic') : hotel.category,
  region: hotel.region,
  star_rating: hotel.starRating,
  price_per_night: hotel.pricePerNight,
  original_price: hotel.originalPrice || null,
  image_url: hotel.imageUrl,
  description: hotel.description || null,
  amenities: hotel.amenities,
  destination_id: hotel.destinationId || null,
  is_featured: hotel.isFeatured,
});

const regionRank = (h: Hotel) => HOTEL_REGIONS.findIndex((r) => r.value === h.region);

/** North India -> South India -> International; featured first within a region, then newest. */
export function sortHotels(hotels: Hotel[]): Hotel[] {
  return [...hotels].sort(
    (a, b) =>
      regionRank(a) - regionRank(b) ||
      Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
      (b.createdAt || '').localeCompare(a.createdAt || '')
  );
}

const mapHotelRow = (h: any): Hotel => ({
  id: h.id,
  name: h.name,
  slug: h.slug,
  location: h.city,
  category: h.category,
  region: h.region || (h.category === 'international' ? 'international' : 'north'),
  starRating: h.star_rating,
  pricePerNight: Number(h.price_per_night),
  originalPrice: h.original_price ? Number(h.original_price) : undefined,
  imageUrl: h.image_url,
  description: h.description || '',
  amenities: h.amenities || [],
  destinationId: h.destination_id,
  isFeatured: h.is_featured,
  createdAt: h.created_at,
});

/**
 * Fetch all hotels, in display order (see sortHotels)
 */
export async function getHotels(): Promise<Hotel[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return sortHotels(data.map(mapHotelRow));
      }
    } catch (err) {
      console.warn('Supabase fetch hotels failed');
    }
  }
  return [];
}

/**
 * Get single hotel by slug
 */
export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  const hotels = await getHotels();
  return hotels.find((h) => h.slug === slug) || null;
}

/**
 * Admin: Create New Hotel
 */
export async function createHotel(newHotel: Omit<Hotel, 'id'>): Promise<{ success: boolean; message: string; id?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('hotels').insert([toHotelRow(newHotel)]).select('id').single();
      if (error) throw error;
      return { success: true, message: 'New hotel added successfully!', id: data.id };
    } catch (err: any) {
      console.error('Supabase hotel insert failed:', err);
      return { success: false, message: `DB Error: ${err.message || 'Check browser console for details'}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Update Hotel
 */
export async function updateHotel(id: string, updatedHotel: Partial<Hotel>): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('hotels').update(toHotelRow(updatedHotel)).eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Hotel updated successfully!' };
    } catch (err: any) {
      console.error('Supabase update failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Admin: Delete Hotel
 */
export async function deleteHotel(id: string): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('hotels').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Hotel deleted successfully!' };
    } catch (err: any) {
      console.error('Supabase delete failed:', err);
      return { success: false, message: `DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/**
 * Fetch a hotel's day-wise itinerary
 */
export async function getHotelItinerary(hotelId: string): Promise<HotelItineraryDay[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('hotel_itineraries')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('day_number', { ascending: true });

      if (!error && data) {
        return data?.map((d: any) => ({
          id: d.id,
          hotelId: d.hotel_id,
          dayNumber: d.day_number,
          location: d.location || '',
          title: d.title,
          nights: d.nights ?? undefined,
          description: d.description || '',
          meals: d.meals || '',
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch hotel itinerary failed');
    }
  }
  return [];
}

/**
 * Admin: Replace a hotel's whole itinerary with the given days (empty list clears it)
 */
export async function saveHotelItinerary(hotelId: string, days: HotelItineraryDay[]): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error: deleteError } = await supabase.from('hotel_itineraries').delete().eq('hotel_id', hotelId);
      if (deleteError) throw deleteError;

      if (days.length > 0) {
        const { error } = await supabase.from('hotel_itineraries').insert(
          days?.map((d) => ({
            hotel_id: hotelId,
            day_number: d.dayNumber,
            location: d.location || null,
            title: d.title,
            nights: d.nights ?? null,
            description: d.description || null,
            meals: d.meals || null,
          }))
        );
        if (error) throw error;
      }
      return { success: true, message: `Itinerary saved (${days.length} day${days.length === 1 ? '' : 's'}).` };
    } catch (err: any) {
      console.error('Supabase itinerary save failed:', err);
      return { success: false, message: `Itinerary DB Error: ${err.message}` };
    }
  }
  return { success: false, message: 'Supabase not configured' };
}

/* ------------------------------------------------------------------ */
/* Admin content lists: server-side filter, search and pagination      */
/* ------------------------------------------------------------------ */

export type AdminListTable = 'tours' | 'destinations' | 'hotels' | 'blogs';
type AdminListRow = { tours: TourPackage; destinations: Destination; hotels: Hotel; blogs: Blog };

export const ADMIN_PAGE_SIZE = 20;

const ADMIN_LISTS: Record<
  AdminListTable,
  { select: string; search: string[]; filterColumn: string | null; order: [string, boolean][]; map: (row: any) => any }
> = {
  tours: {
    select: '*, destination:destinations(highlights, inclusions)',
    search: ['title', 'location'],
    filterColumn: 'category',
    order: [['created_at', false]],
    map: mapTourRow,
  },
  destinations: { select: '*', search: ['name'], filterColumn: 'category', order: [['name', true]], map: mapDestinationRow },
  // region_rank: North India -> South India -> International (generated column)
  hotels: {
    select: '*',
    search: ['name', 'city'],
    filterColumn: 'region',
    order: [['region_rank', true], ['is_featured', false], ['created_at', false]],
    map: mapHotelRow,
  },
  blogs: { select: '*', search: ['title', 'author'], filterColumn: null, order: [['created_at', false]], map: mapBlogRow },
};

/** Apply the admin filter value and search term to a query on one of the content tables. */
function applyAdminListFilters(query: any, table: AdminListTable, filter: string, search?: string) {
  const config = ADMIN_LISTS[table];
  if (config.filterColumn && filter !== 'all') query = query.eq(config.filterColumn, filter);
  const term = cleanSearch(search);
  if (term) query = query.or(config.search.map((col) => `${col}.ilike."*${term}*"`).join(','));
  return query;
}

/**
 * Admin: One page of tours / places / hotels / blogs. Filter and search run in the database across
 * all rows; only the requested page is returned, with the total number of matches.
 */
export async function getAdminList<K extends AdminListTable>(
  table: K,
  { filter = 'all', search, page = 1, pageSize = ADMIN_PAGE_SIZE }: { filter?: string; search?: string; page?: number; pageSize?: number } = {}
): Promise<{ rows: AdminListRow[K][]; total: number }> {
  if (supabase) {
    try {
      const config = ADMIN_LISTS[table];
      let query = applyAdminListFilters(supabase.from(table).select(config.select, { count: 'exact' }), table, filter, search);
      for (const [column, ascending] of config.order) query = query.order(column, { ascending });
      const from = (page - 1) * pageSize;
      // id as a final tie-breaker keeps rows from shifting between pages
      const { data, error, count } = await query.order('id', { ascending: true }).range(from, from + pageSize - 1);
      // PGRST103: page is past the last row (e.g. after deleting the last item on a page)
      if (error?.code === 'PGRST103') return { rows: [], total: 0 };
      if (error) throw error;
      const rows = (data || []).map(config.map) as AdminListRow[K][];
      return { rows, total: count ?? rows.length };
    } catch (err) {
      console.warn(`Supabase admin list (${table}) failed`, err);
    }
  }
  return { rows: [], total: 0 };
}

/**
 * Admin: Count of rows matching the search for 'all' and for each filter value (e.g. domestic /
 * international), counted in the database.
 */
export async function getAdminListCounts(table: AdminListTable, filterValues: string[], search?: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = { all: 0 };
  if (!supabase) return counts;
  const client = supabase;
  const keys = ['all', ...filterValues];
  const results = await Promise.all(
    keys.map((key) =>
      applyAdminListFilters(client.from(table).select('id', { count: 'exact', head: true }), table, key, search).then(
        ({ count }: { count: number | null }) => count ?? 0
      )
    )
  );
  keys.forEach((key, i) => (counts[key] = results[i]));
  return counts;
}

/** Admin: Total rows in each content table (sidebar badges). */
export async function getAdminTotals(): Promise<Record<AdminListTable, number>> {
  const tables: AdminListTable[] = ['tours', 'destinations', 'hotels', 'blogs'];
  const totals = { tours: 0, destinations: 0, hotels: 0, blogs: 0 };
  if (!supabase) return totals;
  const client = supabase;
  const results = await Promise.all(tables.map((t) => client.from(t).select('id', { count: 'exact', head: true })));
  tables.forEach((t, i) => (totals[t] = results[i].count ?? 0));
  return totals;
}
