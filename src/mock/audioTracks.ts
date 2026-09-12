import type { AudioTrack } from '../types';

// Standing in for `GET /api/v1/audio-tracks`. `src` points at royalty-free
// sample tone files bundled under /public/audio so the compose experience
// is audible even before the real CDN-hosted tracks exist.
export const AUDIO_TRACKS_SEED: AudioTrack[] = [
  {
    id: 'silence',
    name: { en: 'No Music', bn: 'সঙ্গীত ছাড়া' },
    category: { en: 'Silence', bn: 'নীরবতা' },
    src: '',
    durationSeconds: 0,
    isPremium: false,
  },
  {
    id: 'rain_window',
    name: { en: 'Rain on the Window', bn: 'জানালায় বৃষ্টির শব্দ' },
    category: { en: 'Ambient', bn: 'পরিবেশ ধ্বনি' },
    src: '/audio/rain-window.mp3',
    durationSeconds: 128,
    isPremium: false,
  },
  {
    id: 'gramophone_lofi_tune',
    name: { en: 'Old Gramophone Tune', bn: 'পুরনো দিনের গ্রামোফোন টিউন' },
    category: { en: 'Nostalgia', bn: 'নস্টালজিয়া' },
    src: '/audio/gramophone.mp3',
    durationSeconds: 95,
    isPremium: false,
  },
  {
    id: 'romantic_flute',
    name: { en: 'Romantic Flute', bn: 'রোমান্টিক বাঁশির সুর' },
    category: { en: 'Romantic', bn: 'রোমান্টিক' },
    src: '/audio/flute.mp3',
    durationSeconds: 140,
    isPremium: true,
  },
  {
    id: 'lofi_piano',
    name: { en: 'Lo-fi Piano', bn: 'লো-ফাই পিয়ানো' },
    category: { en: 'Calm', bn: 'শান্ত' },
    src: '/audio/piano.mp3',
    durationSeconds: 160,
    isPremium: true,
  },
  {
    id: 'evening_crickets',
    name: { en: 'Village Evening', bn: 'গ্রামের সন্ধ্যা' },
    category: { en: 'Ambient', bn: 'পরিবেশ ধ্বনি' },
    src: '/audio/evening.mp3',
    durationSeconds: 110,
    isPremium: false,
  },
];
