import type {
  AudioTrack,
  DeliveryOption,
  FaqItem,
  PricingPlan,
  ServiceResponse,
  Testimonial,
  ThemeDefinition,
} from '../types';
import { AUDIO_TRACKS_SEED } from '../mock/audioTracks';
import {
  DELIVERY_OPTIONS_SEED,
  FAQ_SEED,
  PRICING_PLANS_SEED,
  TESTIMONIALS_SEED,
} from '../mock/catalog';
import { THEMES_SEED } from '../mock/themes';
import { networkDelay, ok } from './serviceUtils';
import { httpClient } from './httpClient';

export interface CatalogService {
  getThemes(): Promise<ServiceResponse<ThemeDefinition[]>>;
  getAudioTracks(): Promise<ServiceResponse<AudioTrack[]>>;
  getDeliveryOptions(): Promise<ServiceResponse<DeliveryOption[]>>;
  getPricingPlans(): Promise<ServiceResponse<PricingPlan[]>>;
  getTestimonials(): Promise<ServiceResponse<Testimonial[]>>;
  getFaq(): Promise<ServiceResponse<FaqItem[]>>;
  getFonts(): Promise<ServiceResponse<import('../types').FontDefinition[]>>;
}

export class MockCatalogService implements CatalogService {
  async getThemes(): Promise<ServiceResponse<ThemeDefinition[]>> {
    await networkDelay();
    return ok(THEMES_SEED);
  }

  async getAudioTracks(): Promise<ServiceResponse<AudioTrack[]>> {
    await networkDelay();
    return ok(AUDIO_TRACKS_SEED);
  }

  async getDeliveryOptions(): Promise<ServiceResponse<DeliveryOption[]>> {
    await networkDelay();
    return ok(DELIVERY_OPTIONS_SEED);
  }

  async getPricingPlans(): Promise<ServiceResponse<PricingPlan[]>> {
    await networkDelay();
    return ok(PRICING_PLANS_SEED);
  }

  async getTestimonials(): Promise<ServiceResponse<Testimonial[]>> {
    await networkDelay(250);
    return ok(TESTIMONIALS_SEED);
  }

  async getFaq(): Promise<ServiceResponse<FaqItem[]>> {
    await networkDelay(250);
    return ok(FAQ_SEED);
  }

  async getFonts(): Promise<ServiceResponse<import('../types').FontDefinition[]>> {
    await networkDelay(200);
    return ok([
      { id: 'kalpana-unicode', name: 'Kalpana (কল্পনা ইউনিকোড)', fontFamily: "'Kalpana', 'Kalpana UNICODE', serif", category: 'bengali', previewSample: 'কল্পনার রঙিন চিঠি' },
      { id: 'solaiman-lipi', name: 'SolaimanLipi (সোলাইমান)', fontFamily: "'SolaimanLipi', 'Hind Siliguri', sans-serif", category: 'bengali', previewSample: 'ডাকপিওনের বার্তা' },
      { id: 'tiro-bangla', name: 'Tiro Bangla (তিরো)', fontFamily: "'Tiro Bangla', serif", category: 'bengali', cssUrl: 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap', previewSample: 'আমার সোনার বাংলা' },
      { id: 'hind-siliguri', name: 'Hind Siliguri (শিলিগুড়ি)', fontFamily: "'Hind Siliguri', sans-serif", category: 'bengali', cssUrl: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap', previewSample: 'চিঠির পাতায় স্মৃতি' },
      { id: 'kalpurush', name: 'Kalpurush (কালপুরুষ)', fontFamily: "'Kalpurush', 'Tiro Bangla', serif", category: 'bengali', cssUrl: 'https://fonts.maateen.me/kalpurush/font.css', previewSample: 'একমুঠো ভালোবাসা' },
      { id: 'fraunces', name: 'Fraunces (Vintage Serif)', fontFamily: "'Fraunces', serif", category: 'latin', cssUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&display=swap', previewSample: 'Nostalgic Letters' },
      { id: 'inter', name: 'Inter (Modern Sans)', fontFamily: "'Inter', sans-serif", category: 'latin', cssUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap', previewSample: 'Clean & Timeless' },
    ]);
  }
}

export class HttpCatalogService implements CatalogService {
  async getThemes(): Promise<ServiceResponse<ThemeDefinition[]>> {
    return httpClient.get<ThemeDefinition[]>('/themes');
  }

  async getAudioTracks(): Promise<ServiceResponse<AudioTrack[]>> {
    return httpClient.get<AudioTrack[]>('/audio-tracks');
  }

  async getDeliveryOptions(): Promise<ServiceResponse<DeliveryOption[]>> {
    return httpClient.get<DeliveryOption[]>('/delivery-options');
  }

  async getPricingPlans(): Promise<ServiceResponse<PricingPlan[]>> {
    return httpClient.get<PricingPlan[]>('/pricing-plans');
  }

  async getTestimonials(): Promise<ServiceResponse<Testimonial[]>> {
    return httpClient.get<Testimonial[]>('/testimonials');
  }

  async getFaq(): Promise<ServiceResponse<FaqItem[]>> {
    return httpClient.get<FaqItem[]>('/faq');
  }

  async getFonts(): Promise<ServiceResponse<import('../types').FontDefinition[]>> {
    return httpClient.get<import('../types').FontDefinition[]>('/fonts');
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export const catalogService: CatalogService = useMock
  ? new MockCatalogService()
  : new HttpCatalogService();
