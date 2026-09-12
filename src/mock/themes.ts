import type { ThemeDefinition } from '../types';

// NOTE: This is seed/mock data standing in for `GET /api/v1/themes`.
// Swap the ThemeService mock implementation for a real fetch and this
// file can be deleted wholesale — nothing else in the app imports it
// directly (see services/themeService.ts).
export const THEMES_SEED: ThemeDefinition[] = [
  {
    id: 'plain_digital',
    name: { en: 'Plain Envelope', bn: 'সাধারণ খাম' },
    description: {
      en: 'A clean, minimal digital envelope. No cost, no fuss.',
      bn: 'একদম সাদামাটা ডিজিটাল খাম। কোনো খরচ নেই, কোনো ঝামেলা নেই।',
    },
    tier: 'FREE',
    price: 0,
    palette: {
      paperBg: '#F2E9D8',
      paperTexture: 'none',
      ink: '#2B2118',
      accent: '#7A8B6F',
      envelope: '#EDE2CB',
      seal: '#8A9A7E',
    },
    previewImage: 'plain',
  },
  {
    id: 'kraft_classic',
    name: { en: 'Kraft Paper', bn: 'ক্র্যাফট পেপার' },
    description: {
      en: 'Light brown recycled-paper texture, for an everyday handwritten feel.',
      bn: 'হালকা বাদামী রিসাইকেলড কাগজের টেক্সচার, নিত্যদিনের হাতে লেখা অনুভূতির জন্য।',
    },
    tier: 'FREE',
    price: 0,
    palette: {
      paperBg: '#E4D3B0',
      paperTexture: 'kraft',
      ink: '#3A2E1F',
      accent: '#A63D40',
      envelope: '#C9A876',
      seal: '#A63D40',
    },
    previewImage: 'kraft',
  },
  {
    id: 'vintage_premium_04',
    name: { en: 'Vintage Postmark', bn: 'ভিন্টেজ পোস্টমার্ক' },
    description: {
      en: 'Aged parchment with a faded postmark stamp and deep ink borders.',
      bn: 'পুরনো পার্চমেন্ট কাগজ, ফিকে পোস্টমার্ক ছাপ আর গাঢ় কালির বর্ডার।',
    },
    tier: 'PREMIUM',
    price: 25,
    palette: {
      paperBg: '#EDE0C0',
      paperTexture: 'parchment',
      ink: '#1B2A4A',
      accent: '#1B2A4A',
      envelope: '#C9A876',
      seal: '#A63D40',
    },
    previewImage: 'vintage',
    occasion: { en: 'Timeless', bn: 'চিরন্তন' },
  },
  {
    id: 'falgun_bloom',
    name: { en: "Falgun's Bloom", bn: 'ফাল্গুনের ফুল' },
    description: {
      en: 'Marigold and palash motifs along the border — for the first day of spring.',
      bn: 'বর্ডার জুড়ে গাঁদা আর পলাশ ফুলের ছাপ — পহেলা ফাল্গুনের জন্য।',
    },
    tier: 'PREMIUM',
    price: 20,
    palette: {
      paperBg: '#FBEFE0',
      paperTexture: 'floral',
      ink: '#5A2E1F',
      accent: '#D9752B',
      envelope: '#F2A65A',
      seal: '#C1440E',
    },
    previewImage: 'falgun',
    occasion: { en: 'Pohela Falgun', bn: 'পহেলা ফাল্গুন' },
  },
  {
    id: 'eid_lantern',
    name: { en: 'Eid Lantern', bn: 'ঈদ লণ্ঠন' },
    description: {
      en: 'Deep emerald tones with gold lantern linework for Eid greetings.',
      bn: 'গাঢ় সবুজ রঙ আর সোনালি লণ্ঠনের নকশা, ঈদের শুভেচ্ছার জন্য।',
    },
    tier: 'PREMIUM',
    price: 25,
    palette: {
      paperBg: '#F5EEDD',
      paperTexture: 'lantern',
      ink: '#1F3A2E',
      accent: '#B8892B',
      envelope: '#1F3A2E',
      seal: '#B8892B',
    },
    previewImage: 'eid',
    occasion: { en: 'Eid', bn: 'ঈদ' },
  },
  {
    id: 'winter_mist',
    name: { en: 'Winter Mist', bn: 'শীতের কুয়াশা' },
    description: {
      en: 'Cool grey-blue tones with a frosted border, for quiet winter mornings.',
      bn: 'শীতল ধূসর-নীল রঙ আর হালকা বরফের বর্ডার, নিরিবিলি শীতের সকালের জন্য।',
    },
    tier: 'PREMIUM',
    price: 20,
    palette: {
      paperBg: '#E8EDF0',
      paperTexture: 'frost',
      ink: '#2C3A4A',
      accent: '#5C7A94',
      envelope: '#B9C7D1',
      seal: '#5C7A94',
    },
    previewImage: 'winter',
    occasion: { en: 'Winter', bn: 'শীতকাল' },
  },
];
