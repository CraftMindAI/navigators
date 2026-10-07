import SectionTitle from '@/components/SectionTitle';

export const metadata = { title: 'Photo Credits | The Navigators' };

// Wikimedia Commons photos used on the site (CC licences require attribution).
const CREDITS = [
  { file: 'spiti.jpg', subject: 'Key Monastery, Spiti Valley', author: 'Kulbhushan Singh Suryawanshi', license: 'CC BY-SA 4.0' },
  { file: 'spiti-road.jpg', subject: 'Spiti gorge, Kaza–Losar', author: 'Timothy A. Gonsalves', license: 'CC BY-SA 4.0' },
  { file: 'chandratal.jpg', subject: 'Chandratal Lake, Spiti', author: 'Pawanranta', license: 'CC BY-SA 4.0' },
  { file: 'shimla.jpg', subject: 'The Ridge, Shimla', author: 'Slyronit', license: 'CC BY-SA 4.0' },
  { file: 'gulmarg.jpg', subject: 'Snow at Gulmarg, Kashmir', author: 'Ask6626', license: 'CC BY-SA 4.0' },
  { file: 'nainital.jpg', subject: 'Naini Lake, Nainital', author: 'Praveen Singh Bisht', license: 'CC BY 2.0' },
  { file: 'rishikesh.jpg', subject: 'Lakshman Jhula, Rishikesh', author: 'McKay Savage', license: 'CC BY 2.0' },
  { file: 'meghalaya.jpg', subject: 'Living Root Bridge, Meghalaya', author: 'Chaduvari', license: 'CC BY-SA 4.0' },
  { file: 'karnataka.jpg', subject: 'Matanga Hill, Hampi', author: 'Vyacheslav Argenberg', license: 'CC BY 4.0' },
  { file: 'andaman.jpg', subject: 'Radhanagar Beach, Havelock Island', author: 'Vyacheslav Argenberg', license: 'CC BY 4.0' },
  { file: 'sikkim.jpg', subject: 'Tsomgo Lake, Sikkim', author: 'Anupam Manur', license: 'Public domain' },
];

export default function CreditsPage() {
  return (
    <div className="container-bb py-12">
      <SectionTitle light="Photo" bold="Credits" subtitle="Destination photos from Wikimedia Commons, used under their respective licences. Other photos via Unsplash." />
      <ul className="max-w-3xl mx-auto divide-y divide-[#eee] border border-[#ddd] bg-white">
        {CREDITS?.map((c) => (
          <li key={c.file} className="flex items-center gap-4 p-3">
            <img src={`/images/destinations/${c.file}`} alt={c.subject} className="w-24 h-16 object-cover shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-brand-ink">{c.subject}</p>
              <p className="text-brand-muted">
                Photo: {c.author} · {c.license} · via Wikimedia Commons
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
