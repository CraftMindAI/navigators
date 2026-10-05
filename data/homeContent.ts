// Home page section content (Bharat Booking layout), built from The Navigators' own copy.

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`;

export interface Offer {
  heading: string;
  tagline: string;
  caption: string;
  description: string;
  image: string;
}

export const OFFERS: Offer[] = [
  {
    heading: 'Spiti Valley Expedition',
    tagline: 'Shimla / Kalpa / Kaza / Manali',
    caption: 'Spiti Valley Expedition 7N / 8D',
    description: 'Kaza, Chandratal & Tabo circuit with experienced mountain drivers',
    image: '/images/destinations/spiti.jpg',
  },
  {
    heading: 'Exotic Kashmir Valley',
    tagline: 'Srinagar / Gulmarg / Pahalgam',
    caption: 'Kashmir Valley Holiday 5N / 6D',
    description: 'Houseboat stay, Gulmarg gondola & Pahalgam meadows',
    image: img('photo-1595815771614-ade9d652a65d'),
  },
  {
    heading: 'Char Dham & Uttarakhand',
    tagline: 'Rishikesh / Mussoorie / Nainital',
    caption: 'Uttarakhand Hill Escape 5N / 6D',
    description: 'Hill stations, the holy Ganga and Char Dham yatra planning',
    image: '/images/destinations/nainital.jpg',
  },
  {
    heading: 'International Getaways',
    tagline: 'Thailand / Bali / Dubai / Maldives',
    caption: 'International Holiday Offers',
    description: 'Flights, visas, resorts & transfers sorted for you',
    image: img('photo-1514282401047-d79a71a590e8'),
  },
  {
    heading: 'Rajasthan & Golden Triangle',
    tagline: 'Jaipur / Udaipur / Jaisalmer / Agra',
    caption: 'Royal Rajasthan Tours',
    description: 'Palaces, forts, desert camps and the Taj Mahal',
    image: img('photo-1477587458883-47145ed94245'),
  },
];

export interface Tile {
  title: string;
  sub?: string;
  image: string;
  slug?: string;
}

export const HOLIDAY_CATEGORIES: Tile[] = [
  { title: 'Himachal Pradesh Tour Packages', sub: 'Shimla • Manali • Dharamshala • Dalhousie', image: img('photo-1626621341517-bbf3d9990a23'), slug: 'shimla-manali-tour-package' },
  { title: 'Spiti Valley Expeditions', sub: 'Kaza • Chandratal • Tabo', image: '/images/destinations/spiti.jpg' },
  { title: 'Jammu & Kashmir Holidays', sub: 'Srinagar • Gulmarg • Pahalgam', image: img('photo-1595815771614-ade9d652a65d'), slug: 'kashmir-tour-package' },
  { title: 'Uttarakhand & Char Dham', sub: 'Nainital • Mussoorie • Rishikesh', image: '/images/destinations/nainital.jpg' },
  { title: 'Rajasthan & Golden Triangle', sub: 'Jaipur • Udaipur • Agra • Delhi', image: img('photo-1477587458883-47145ed94245') },
  { title: 'International Holidays', sub: 'Thailand • Bali • Dubai • Maldives', image: img('photo-1537996194471-e657df975ab4') },
];

export const DOMESTIC_TILES: Tile[] = [
  { title: 'Himachal Pradesh', image: img('photo-1626621341517-bbf3d9990a23'), slug: 'shimla-manali-tour-package' },
  { title: 'Spiti Valley', image: '/images/destinations/spiti.jpg' },
  { title: 'Uttarakhand', image: '/images/destinations/nainital.jpg' },
  { title: 'Jammu & Kashmir', image: img('photo-1595815771614-ade9d652a65d'), slug: 'kashmir-tour-package' },
  { title: 'Rajasthan', image: img('photo-1477587458883-47145ed94245') },
  { title: 'Goa', image: img('photo-1512343879784-a960bf40e7f2') },
  { title: 'Kerala', image: img('photo-1602216056096-3b40cc0c9944'), slug: 'kerala-tour-packages' },
  { title: 'Andaman', image: '/images/destinations/andaman.jpg', slug: 'andaman-tour-package' },
  { title: 'Karnataka', image: '/images/destinations/karnataka.jpg' },
  { title: 'Sikkim', image: '/images/destinations/sikkim.jpg', slug: 'sikkim-tour-package' },
  { title: 'Darjeeling', image: img('photo-1622308644420-b20142dc993c'), slug: 'darjeeling-tour-packages' },
  { title: 'Meghalaya', image: '/images/destinations/meghalaya.jpg' },
];

export const INTERNATIONAL_TILES: Tile[] = [
  { title: 'Thailand', image: img('photo-1552465011-b4e21bf6e79a'), slug: 'thailand-tour-package' },
  { title: 'Bali', image: img('photo-1537996194471-e657df975ab4'), slug: 'bali-tour-packages' },
  { title: 'Dubai', image: img('photo-1512453979798-5ea266f8880c') },
  { title: 'Maldives', image: img('photo-1514282401047-d79a71a590e8'), slug: 'maldives-tour-package' },
  { title: 'Singapore', image: img('photo-1525625293386-3f8f99389edd') },
  { title: 'Malaysia', image: img('photo-1596422846543-75c6fc197f07') },
];

export const WHY_BLOCKS = [
  {
    title: 'Easy Tour Booking',
    text: 'Book flights, hotels and complete holidays with a single call, a WhatsApp message or a few clicks on our website — we reply promptly.',
    color: 'bg-brand-green',
  },
  {
    title: 'Customizable Tour Packages',
    text: 'Every itinerary is tailored to your dates, budget and pace, with honest guidance on the best routes and seasons.',
    color: 'bg-brand-orange',
  },
  {
    title: 'Experienced Travel Consultants',
    text: 'Our team specialises in Himachal, Spiti, Kashmir and Uttarakhand — mountain circuits we know road by road.',
    color: 'bg-brand-blue',
  },
  {
    title: '24/7 Assistance for Guests',
    text: 'Real people on the line throughout your journey with 24/7 on-tour support, so every detail is hassle-free.',
    color: 'bg-brand-navy',
  },
];

export const WHY_IMAGES = [img('photo-1626621341517-bbf3d9990a23'), '/images/destinations/spiti.jpg', img('photo-1595815771614-ade9d652a65d')];

export const FEATURED_TRIPS = [
  {
    tab: 'Himachal Packages',
    title: 'Himachal Complete Delight',
    tags: ['#mountains', '#snow', '#family', '#honeymoon'],
    text: 'Seven days across Shimla, Kullu and Manali — Mall Road evenings, river rafting in Kullu, Solang Valley snow and Atal Tunnel excursions, with comfortable hotels and a private cab throughout.',
    duration: '6 Nights / 7 Days',
    route: 'Shimla – Kullu – Manali',
    images: [img('photo-1626621341517-bbf3d9990a23'), '/images/destinations/shimla.jpg'],
  },
  {
    tab: 'Kashmir Packages',
    title: 'Exotic Kashmir Valley',
    tags: ['#houseboat', '#gondola', '#meadows'],
    text: 'Shikara rides on Dal Lake, a night on a houseboat, the Gulmarg gondola and the Betaab and Aru valleys of Pahalgam — the classic Kashmir circuit, planned end to end.',
    duration: '5 Nights / 6 Days',
    route: 'Srinagar – Gulmarg – Pahalgam',
    images: [img('photo-1595815771614-ade9d652a65d'), '/images/destinations/gulmarg.jpg'],
  },
  {
    tab: 'Spiti Packages',
    title: 'Spiti Valley Expedition',
    tags: ['#adventure', '#roadtrip', '#monasteries'],
    text: 'A high-altitude loop via Kinnaur to Kalpa, Kaza, Key Monastery, Chandratal Lake and over Kunzum Pass into Manali — with acclimatisation-friendly pacing and expert drivers.',
    duration: '7 Nights / 8 Days',
    route: 'Shimla – Kalpa – Kaza – Manali',
    images: ['/images/destinations/spiti.jpg', '/images/destinations/chandratal.jpg'],
  },
  {
    tab: 'Uttarakhand Packages',
    title: 'Uttarakhand Hill Escape',
    tags: ['#hills', '#ganga', '#lakes'],
    text: 'Queen-of-hills Mussoorie, the Ganga aarti and cafés of Rishikesh, and boating on Naini Lake — an easy-paced hill holiday for families and couples.',
    duration: '5 Nights / 6 Days',
    route: 'Mussoorie – Rishikesh – Nainital',
    images: ['/images/destinations/nainital.jpg', '/images/destinations/rishikesh.jpg'],
  },
];

export const SERVICE_PILLARS = [
  { title: '24 x 7 Help Center', text: 'Have a question? Talk to a real travel expert anytime, before and during your trip.' },
  { title: 'Customised Itineraries', text: 'Every package is tailored to your dates, budget and travel style.' },
  { title: 'Verified Hotels', text: 'Handpicked stays personally checked by our team.' },
  { title: 'Mountain Specialists', text: 'Himachal, Spiti, Kashmir & Uttarakhand experts.' },
];
