export interface CuratedFont {
  id: string;
  name: string;
  fontFamily: string;
  category: 'bengali' | 'latin';
  cssUrl?: string;
  previewSample: string;
}

export const CURATED_FONTS: CuratedFont[] = [
  {
    id: 'kalpana-unicode',
    name: 'Kalpana (কল্পনা ইউনিকোড)',
    fontFamily: "'Kalpana', 'Kalpana UNICODE', serif",
    category: 'bengali',
    previewSample: 'কল্পনার রঙিন চিঠি',
  },
  {
    id: 'tiro-bangla',
    name: 'Tiro Bangla (তিরো)',
    fontFamily: "'Tiro Bangla', serif",
    category: 'bengali',
    cssUrl: 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap',
    previewSample: 'আমার সোনার বাংলা',
  },
  {
    id: 'hind-siliguri',
    name: 'Hind Siliguri (শিলিগুড়ি)',
    fontFamily: "'Hind Siliguri', sans-serif",
    category: 'bengali',
    cssUrl: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap',
    previewSample: 'চিঠির পাতায় স্মৃতি',
  },
  {
    id: 'kalpurush',
    name: 'Kalpurush (কালপুরুষ)',
    fontFamily: "'Kalpurush', 'Tiro Bangla', serif",
    category: 'bengali',
    cssUrl: 'https://fonts.maateen.me/kalpurush/font.css',
    previewSample: 'একমুঠো ভালোবাসা',
  },
  {
    id: 'solaiman-lipi',
    name: 'SolaimanLipi (সোলাইমান)',
    fontFamily: "'SolaimanLipi', 'Hind Siliguri', sans-serif",
    category: 'bengali',
    cssUrl: 'https://fonts.maateen.me/solaiman-lipi/font.css',
    previewSample: 'ডাকপিওনের বার্তা',
  },
  {
    id: 'fraunces',
    name: 'Fraunces (Vintage Serif)',
    fontFamily: "'Fraunces', serif",
    category: 'latin',
    cssUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&display=swap',
    previewSample: 'Nostalgic Letters',
  },
  {
    id: 'inter',
    name: 'Inter (Modern Sans)',
    fontFamily: "'Inter', sans-serif",
    category: 'latin',
    cssUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    previewSample: 'Clean & Timeless',
  },
];

const loadedFonts = new Set<string>();

export function loadFontDynamically(font: CuratedFont): void {
  if (!font.cssUrl || loadedFonts.has(font.id)) return;

  // Check if link tag already exists in DOM
  const existingLink = document.querySelector(`link[data-font-id="${font.id}"]`);
  if (existingLink) {
    loadedFonts.add(font.id);
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.cssUrl;
  link.setAttribute('data-font-id', font.id);
  document.head.appendChild(link);
  loadedFonts.add(font.id);
}
