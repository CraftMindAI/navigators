// Generates public/samples/hotel-itinerary-sample.xlsx — the template admins
// download from the Add Hotel form and fill in. Run: npm run sample:itinerary
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import writeXlsxFile from "write-excel-file/node";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "samples");
const outFile = path.join(outDir, "hotel-itinerary-sample.xlsx");

// Column headers must match what app/admin/page.tsx parses.
const HEADERS = ["Day", "Location", "Title", "Nights", "Description", "Meals"];

const DAYS = [
  [1, "Indore", "Arrival Indore – Local Sightseeing", 1,
    "Arrive at Indore Airport/Railway Station and transfer to the hotel. After check-in, proceed for sightseeing covering Rajwada Palace, Lal Baag Palace, Krishnapura Chhatris and the famous Sarafa Bazaar.",
    "Accommodation & Breakfast"],
  [2, "Ujjain", "Indore – Ujjain", 1,
    "After breakfast, drive to Ujjain. Visit Mahakaleshwar Jyotirlinga, Harsiddhi Temple, Kal Bhairav Temple and Ram Ghat. Evening aarti at the Shipra river.",
    "Accommodation & Breakfast"],
  [3, "Omkareshwar", "Ujjain – Omkareshwar", 1,
    "Drive to Omkareshwar. Visit Omkareshwar and Mamleshwar Jyotirlinga temples and enjoy a boat ride on the Narmada.",
    "Accommodation & Breakfast"],
  [4, "Maheshwar", "Omkareshwar – Maheshwar", 1,
    "Drive to Maheshwar. Visit Ahilya Fort, Maheshwar Ghats and the handloom weaving centres famous for Maheshwari sarees.",
    "Accommodation & Breakfast"],
  [5, "Mandu", "Maheshwar – Mandu", 1,
    "Drive to Mandu. Explore Jahaz Mahal, Hindola Mahal, Rani Roopmati Pavilion and Baz Bahadur's Palace.",
    "Accommodation & Breakfast"],
  [6, "Bhopal", "Mandu – Bhopal", 1,
    "Drive to Bhopal. Visit Upper Lake, Taj-ul-Masajid and the Tribal Museum. Evening at leisure.",
    "Accommodation & Breakfast"],
];

const header = HEADERS.map((value) => ({ value, fontWeight: "bold", backgroundColor: "#DCE6F8" }));
const rows = DAYS.map(([day, location, title, nights, description, meals]) => [
  { type: Number, value: day },
  { type: String, value: location },
  { type: String, value: title },
  { type: Number, value: nights },
  { type: String, value: description, wrap: true },
  { type: String, value: meals },
]);

mkdirSync(outDir, { recursive: true });
await writeXlsxFile([header, ...rows], {
  sheet: "Itinerary",
  columns: [{ width: 6 }, { width: 16 }, { width: 38 }, { width: 8 }, { width: 80 }, { width: 28 }],
  stickyRowsCount: 1,
}).toFile(outFile);

console.log(`Wrote ${path.relative(root, outFile)}`);
