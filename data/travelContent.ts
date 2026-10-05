// Static marketing content for the home, flight and hotel pages.
// Copy supplied by The Navigators team.

export const WELCOME = {
  title: 'Welcome to The Navigators',
  subtitle: 'Your Ultimate Travel & Adventure Partner',
  body:
    'At The Navigators, we specialize in crafting seamless, personalized, and unforgettable travel experiences. Whether you are looking for serene hill stations, adventurous mountain circuits, or relaxing international getaways, we navigate every detail to make your journey completely hassle-free with 24/7 on-tour support.',
};

export interface DestinationRegion {
  name: string;
  places: string[];
  image: string;
  slug?: string;
}

export interface DestinationGroup {
  title: string;
  subtitle: string;
  regions: DestinationRegion[];
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

export const DESTINATION_GROUPS: DestinationGroup[] = [
  {
    title: 'Specializations',
    subtitle: 'North India & Mountains',
    regions: [
      { name: 'Himachal Pradesh', places: ['Shimla', 'Manali', 'Dharamshala', 'Dalhousie'], image: img('photo-1626621341517-bbf3d9990a23'), slug: 'shimla-manali-tour-package' },
      { name: 'Spiti Valley', places: ['Kaza', 'Chandratal', 'Tabo Circuit'], image: '/images/destinations/spiti.jpg' },
      { name: 'Uttarakhand', places: ['Nainital', 'Mussoorie', 'Rishikesh', 'Char Dham'], image: '/images/destinations/nainital.jpg' },
      { name: 'Jammu & Kashmir', places: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg'], image: img('photo-1595815771614-ade9d652a65d'), slug: 'kashmir-tour-package' },
      { name: 'Rajasthan & Golden Triangle', places: ['Jaipur', 'Udaipur', 'Jaisalmer', 'Agra', 'Delhi'], image: img('photo-1477587458883-47145ed94245') },
    ],
  },
  {
    title: 'Other Domestic Circuits',
    subtitle: 'South, East & North-East India',
    regions: [
      { name: 'South India & Coastal', places: ['Goa', 'Kerala', 'Andaman', 'Karnataka'], image: img('photo-1602216056096-3b40cc0c9944'), slug: 'kerala-tour-packages' },
      { name: 'East & North-East', places: ['Sikkim', 'Darjeeling', 'Meghalaya'], image: '/images/destinations/sikkim.jpg', slug: 'sikkim-tour-package' },
    ],
  },
  {
    title: 'International Destinations',
    subtitle: 'Handpicked overseas getaways',
    regions: [
      { name: 'Thailand', places: ['Bangkok', 'Phuket', 'Krabi'], image: img('photo-1552465011-b4e21bf6e79a'), slug: 'thailand-tour-package' },
      { name: 'Bali', places: ['Ubud', 'Seminyak', 'Nusa Penida'], image: img('photo-1537996194471-e657df975ab4'), slug: 'bali-tour-packages' },
      { name: 'Dubai', places: ['Burj Khalifa', 'Desert Safari', 'Marina'], image: img('photo-1512453979798-5ea266f8880c') },
      { name: 'Maldives', places: ['Male', 'Water Villas', 'Atolls'], image: img('photo-1514282401047-d79a71a590e8'), slug: 'maldives-tour-package' },
      { name: 'Singapore', places: ['Sentosa', 'Marina Bay', 'Gardens'], image: img('photo-1525625293386-3f8f99389edd') },
      { name: 'Malaysia', places: ['Kuala Lumpur', 'Langkawi', 'Genting'], image: img('photo-1596422846543-75c6fc197f07') },
    ],
  },
];

export interface TrendingPackage {
  title: string;
  nights: number;
  days: number;
  route: string[];
  image: string;
}

export const TRENDING_PACKAGES: TrendingPackage[] = [
  { title: 'Himachal Complete Delight', nights: 6, days: 7, route: ['Shimla', 'Kullu', 'Manali'], image: img('photo-1626621341517-bbf3d9990a23') },
  { title: 'Exotic Kashmir Valley', nights: 5, days: 6, route: ['Srinagar', 'Gulmarg', 'Pahalgam'], image: img('photo-1595815771614-ade9d652a65d') },
  { title: 'Spiti Valley Expedition', nights: 7, days: 8, route: ['Shimla', 'Kalpa', 'Kaza', 'Manali'], image: '/images/destinations/spiti.jpg' },
  { title: 'Uttarakhand Hill Escape', nights: 5, days: 6, route: ['Mussoorie', 'Rishikesh', 'Nainital'], image: '/images/destinations/nainital.jpg' },
];

export const WHY_CHOOSE_US = [
  { title: 'Easy Tour Booking', text: 'Book flights, hotels and holidays with one call or a few clicks.' },
  { title: 'Customizable Packages', text: 'Every itinerary is tailored to your dates, budget and pace.' },
  { title: 'Experienced Consultants', text: 'Mountain specialists who know every road in Himachal & Spiti.' },
  { title: '24/7 On-Tour Support', text: 'A real person on the line, any hour, throughout your trip.' },
];

export interface Airport {
  code: string;
  city: string;
  name: string;
}

export const AIRPORTS: Airport[] = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim Airport' },
  { code: 'GOX', city: 'Goa (Mopa)', name: 'Manohar International Airport' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport' },
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh International Airport' },
  { code: 'SLV', city: 'Shimla', name: 'Shimla Airport' },
  { code: 'KUU', city: 'Kullu-Manali', name: 'Bhuntar Airport' },
  { code: 'DHM', city: 'Dharamshala', name: 'Gaggal Airport' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport' },
  { code: 'IXJ', city: 'Jammu', name: 'Jammu Airport' },
  { code: 'IXL', city: 'Leh', name: 'Kushok Bakula Rimpochee Airport' },
  { code: 'DED', city: 'Dehradun', name: 'Jolly Grant Airport' },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra Airport' },
  { code: 'PYG', city: 'Gangtok', name: 'Pakyong Airport' },
  { code: 'SHL', city: 'Shillong', name: 'Shillong Airport' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport' },
  { code: 'IXZ', city: 'Port Blair', name: 'Veer Savarkar International Airport' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport' },
  { code: 'IXE', city: 'Mangaluru', name: 'Mangaluru International Airport' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International Airport' },
  { code: 'AGR', city: 'Agra', name: 'Agra Airport' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport' },
  { code: 'HKT', city: 'Phuket', name: 'Phuket International Airport' },
  { code: 'DPS', city: 'Bali (Denpasar)', name: 'Ngurah Rai International Airport' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' },
  { code: 'MLE', city: 'Male', name: 'Velana International Airport' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport' },
];

export const HOTEL_CITIES = [
  'Shimla', 'Manali', 'Dharamshala', 'McLeod Ganj', 'Dalhousie', 'Kasol', 'Kaza', 'Kalpa',
  'Nainital', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg',
  'Leh', 'Jaipur', 'Udaipur', 'Jaisalmer', 'Agra', 'New Delhi', 'Goa', 'Munnar', 'Alleppey',
  'Port Blair', 'Havelock Island', 'Coorg', 'Gangtok', 'Darjeeling', 'Shillong',
  'Bangkok', 'Phuket', 'Bali', 'Dubai', 'Maldives', 'Singapore', 'Kuala Lumpur',
];

export const NATIONALITIES = [
  'India', 'Australia', 'Bangladesh', 'Bhutan', 'Canada', 'China', 'France', 'Germany', 'Indonesia',
  'Italy', 'Japan', 'Malaysia', 'Maldives', 'Nepal', 'Russia', 'Singapore', 'Sri Lanka', 'Thailand',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Other',
];

export const POPULAR_FLIGHT_ROUTES = [
  { from: 'DEL', to: 'SXR' },
  { from: 'DEL', to: 'IXL' },
  { from: 'DEL', to: 'KUU' },
  { from: 'BOM', to: 'IXC' },
  { from: 'BLR', to: 'DEL' },
  { from: 'DEL', to: 'IXB' },
  { from: 'MAA', to: 'IXZ' },
  { from: 'DEL', to: 'DXB' },
  { from: 'BOM', to: 'BKK' },
];

export const POPULAR_HOTEL_CITIES = [
  { city: 'Shimla', tag: 'Queen of Hills', image: '/images/destinations/shimla.jpg' },
  { city: 'Manali', tag: 'Snow & Rivers', image: img('photo-1626621341517-bbf3d9990a23') },
  { city: 'Srinagar', tag: 'Houseboats', image: img('photo-1595815771614-ade9d652a65d') },
  { city: 'Rishikesh', tag: 'Riverside Camps', image: '/images/destinations/rishikesh.jpg' },
  { city: 'Jaipur', tag: 'Heritage Havelis', image: img('photo-1477587458883-47145ed94245') },
  { city: 'Goa', tag: 'Beach Resorts', image: img('photo-1512343879784-a960bf40e7f2') },
  { city: 'Gangtok', tag: 'Himalayan Views', image: '/images/destinations/sikkim.jpg' },
  { city: 'Dubai', tag: 'City Luxury', image: img('photo-1512453979798-5ea266f8880c') },
];
