-- Destination-level "Tour Highlights" and "What's Included".
-- Packages show their own highlights/inclusions when set, otherwise fall back to their destination's.

ALTER TABLE public.destinations
    ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS inclusions TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.tours
    ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tours_destination_id_idx ON public.tours(destination_id);

-- Seed highlights / inclusions for the existing destinations
UPDATE public.destinations d SET highlights = v.highlights, inclusions = v.inclusions
FROM (VALUES
  ('andaman-tour-package',
    ARRAY['Radhanagar Beach, Havelock Island','Scuba Diving & Snorkeling at Elephant Beach','Cellular Jail Light & Sound Show','Ross Island & North Bay Excursion','Glass-bottom Boat Ride','Neil Island Natural Bridge'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast at the hotel','Airport pick-up & drop at Port Blair','Private cruise / ferry tickets between islands','All sightseeing by private AC vehicle','Entry tickets & permits as per itinerary']),
  ('bali-tour-packages',
    ARRAY['Ubud Sacred Monkey Forest & Rice Terraces','Tanah Lot Sea Temple at Sunset','Nusa Penida Island Day Tour','Mount Batur Sunrise Trek','Kintamani Volcano View','Uluwatu Temple & Kecak Fire Dance'],
    ARRAY['Hotel / villa accommodation on twin sharing basis','Daily breakfast','Return airport transfers','Sightseeing by private AC vehicle with driver','Entry tickets as per itinerary','English-speaking guide on tour days']),
  ('bhutan-tour-packages',
    ARRAY['Tiger''s Nest (Paro Taktsang) Monastery Hike','Buddha Dordenma Statue, Thimphu','Punakha Dzong & Suspension Bridge','Dochula Pass 108 Chortens','Traditional Bhutanese Cultural Show','Chele La Pass Views'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast & dinner','Bhutan entry permits & processing','Pick-up & drop from Phuentsholing / Paro','All sightseeing by private vehicle','Licensed local Bhutanese guide']),
  ('darjeeling-tour-packages',
    ARRAY['Tiger Hill Sunrise over Kanchenjunga','UNESCO Heritage Toy Train Joy Ride','Batasia Loop & War Memorial','Happy Valley Tea Estate Visit','Ghoom Monastery','Peace Pagoda & Rock Garden'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast & dinner','Pick-up & drop from NJP / Bagdogra','All sightseeing by private vehicle','Driver allowance, tolls & parking','All applicable taxes']),
  ('kashmir-tour-package',
    ARRAY['Shikara Ride on Dal Lake','Gulmarg Gondola Cable Car','Pahalgam, Betaab & Aru Valley','Sonmarg & Thajiwas Glacier','Mughal Gardens of Srinagar','Overnight Houseboat Stay'],
    ARRAY['Hotel & houseboat accommodation on twin sharing basis','Daily breakfast & dinner','Srinagar airport pick-up & drop','1-hour Shikara ride on Dal Lake','All sightseeing by private vehicle','Driver allowance, tolls & parking']),
  ('kerala-tour-packages',
    ARRAY['Munnar Tea Plantations & Eravikulam Park','Alleppey Houseboat Backwater Cruise','Thekkady Periyar Wildlife Sanctuary','Kathakali & Kalaripayattu Shows','Kovalam Beach Sunset','Fort Kochi Chinese Fishing Nets'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast','Houseboat stay with all meals (where included)','Kochi airport / railway pick-up & drop','All sightseeing by private AC vehicle','Driver allowance, tolls & parking']),
  ('maldives-tour-package',
    ARRAY['Overwater Villa Experience','Snorkeling over Coral Reefs','Sunset Dolphin Cruise','Sandbank Picnic','Male City Tour','Underwater Restaurant Visit (optional)'],
    ARRAY['Resort accommodation on twin sharing basis','Meal plan as per package (breakfast / half / full board)','Return speedboat or seaplane transfers','Welcome drink on arrival','Green tax & government taxes','Complimentary non-motorized water sports']),
  ('shimla-manali-tour-package',
    ARRAY['Solang Valley Snow & Adventure Sports','Rohtang Pass / Atal Tunnel Excursion','Mall Road & Ridge, Shimla','Kufri Hill Station','Hadimba Devi Temple, Manali','Kullu River Rafting'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast & dinner','Pick-up & drop from Chandigarh / Delhi','All sightseeing by private vehicle','Driver allowance, tolls & parking','All applicable taxes']),
  ('sikkim-tour-package',
    ARRAY['Tsomgo Lake & Baba Mandir','Nathula Pass Indo-China Border','Gangtok Ropeway & MG Marg','Rumtek Monastery','Pelling Skywalk & Kanchenjunga Views','North Sikkim – Lachung & Yumthang Valley'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast & dinner','Pick-up & drop from NJP / Bagdogra','All sightseeing by private vehicle','Protected area permits as per itinerary','Driver allowance, tolls & parking']),
  ('thailand-tour-package',
    ARRAY['Phi Phi Islands Speedboat Tour','Coral Island Tour, Pattaya','Bangkok Temples – Wat Arun & Grand Palace','Alcazar Cabaret Show','Safari World & Marine Park','Floating Market Experience'],
    ARRAY['Hotel accommodation on twin sharing basis','Daily breakfast','Return airport transfers','Sightseeing tours on SIC / private basis','Entry tickets as per itinerary','English-speaking guide on tour days'])
) AS v(slug, highlights, inclusions)
WHERE d.slug = v.slug;

-- Link existing packages to their destination
UPDATE public.tours t SET destination_id = d.id
FROM public.destinations d
WHERE t.destination_id IS NULL
  AND d.slug = CASE
    WHEN t.location ILIKE '%andaman%' OR t.location ILIKE '%port blair%' OR t.location ILIKE '%havelock%' THEN 'andaman-tour-package'
    WHEN t.location ILIKE '%bali%' THEN 'bali-tour-packages'
    WHEN t.location ILIKE '%bhutan%' OR t.location ILIKE '%paro%' OR t.location ILIKE '%thimphu%' THEN 'bhutan-tour-packages'
    WHEN t.location ILIKE '%darjeeling%' THEN 'darjeeling-tour-packages'
    WHEN t.location ILIKE '%kashmir%' OR t.location ILIKE '%srinagar%' THEN 'kashmir-tour-package'
    WHEN t.location ILIKE '%kerala%' OR t.location ILIKE '%munnar%' THEN 'kerala-tour-packages'
    WHEN t.location ILIKE '%maldives%' THEN 'maldives-tour-package'
    WHEN t.location ILIKE '%shimla%' OR t.location ILIKE '%manali%' OR t.location ILIKE '%himachal%' THEN 'shimla-manali-tour-package'
    WHEN t.location ILIKE '%gangtok%' OR t.location ILIKE '%sikkim%' THEN 'sikkim-tour-package'
    WHEN t.location ILIKE '%thailand%' OR t.location ILIKE '%bangkok%' OR t.location ILIKE '%phuket%' THEN 'thailand-tour-package'
  END;

NOTIFY pgrst, 'reload schema';
