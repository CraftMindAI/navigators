export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  location: string;
  category: 'domestic' | 'international';
  price: number;
  originalPrice?: number;
  durationNights: number;
  durationDays: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  /** Effective highlights: the tour's own, or its destination's when the tour has none. */
  highlights: string[];
  /** Effective inclusions: the tour's own, or its destination's when the tour has none. */
  inclusions?: string[];
  /** Highlights / inclusions stored on the tour row itself (without destination fallback). */
  ownHighlights?: string[];
  ownInclusions?: string[];
  destinationId?: string | null;
  exclusions?: string[];
  itinerary?: { day: number; title: string; description: string }[];
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface Inquiry {
  userId?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  tourId?: string;
  tourTitle?: string;
  travelDate?: string;
  guestsCount?: number;
  message?: string;
  status?: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  category: 'domestic' | 'international';
  imageUrl: string;
  packageCount: number;
  description?: string;
  highlights?: string[];
  inclusions?: string[];
}

export interface Hotel {
  id?: string;
  name: string;
  slug: string;
  location: string;
  category: 'domestic' | 'international';
  starRating: number;
  pricePerNight: number;
  originalPrice?: number;
  imageUrl: string;
  description?: string;
  amenities: string[];
  destinationId?: string | null;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface Blog {
  id?: string;
  title: string;
  slug?: string;
  image_url: string;
  content: string;
  author: string;
  created_at?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  tourName: string;
  date: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  tour_id: string;
  tour_title: string;
  guests_count: number;
  travel_date?: string;
  created_at?: string;
}

export interface HotelBooking {
  id?: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  destination: string;
  check_in_date?: string;
  check_out_date?: string;
  guests_count?: number;
  rooms_count?: number;
  special_requests?: string;
  status?: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface FlightBooking {
  id?: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  return_date?: string;
  passengers_count?: number;
  flight_class?: string;
  status?: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  created_at?: string;
}
