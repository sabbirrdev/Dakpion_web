import type {
  AdminCourierBookingRequest,
  AdminCourierBookingResponse,
  AdminModerationRequest,
  AudioTrack,
  DeliveryOption,
  FaqItem,
  FontDefinition,
  Letter,
  ModerationStatus,
  PageResponse,
  PricingPlan,
  ServiceResponse,
  ThemeDefinition,
} from '../types';
import { fail, mockTable, networkDelay, ok } from './serviceUtils';
import { httpClient } from './httpClient';
import { LETTERS_SEED } from '../mock/catalog';

export interface AdminService {
  // Letters Moderation
  getModerationQueue(
    status?: ModerationStatus,
    page?: number,
    size?: number,
  ): Promise<ServiceResponse<PageResponse<Letter>>>;
  moderateLetter(id: string, req: AdminModerationRequest): Promise<ServiceResponse<Letter>>;
  bookCourier(id: string, req?: AdminCourierBookingRequest): Promise<ServiceResponse<AdminCourierBookingResponse>>;
  getPrintPdfUrl(id: string): string;

  // Themes CRUD
  saveTheme(theme: Partial<ThemeDefinition>): Promise<ServiceResponse<ThemeDefinition>>;
  deleteTheme(id: string): Promise<ServiceResponse<void>>;

  // Audio Tracks CRUD
  saveAudioTrack(track: Partial<AudioTrack>): Promise<ServiceResponse<AudioTrack>>;
  deleteAudioTrack(id: string): Promise<ServiceResponse<void>>;

  // Delivery Options CRUD
  saveDeliveryOption(option: Partial<DeliveryOption>): Promise<ServiceResponse<DeliveryOption>>;
  deleteDeliveryOption(type: string): Promise<ServiceResponse<void>>;

  // Pricing Plans CRUD
  savePricingPlan(plan: Partial<PricingPlan>): Promise<ServiceResponse<PricingPlan>>;
  deletePricingPlan(id: string): Promise<ServiceResponse<void>>;

  // Fonts & Typography CRUD
  saveFont(font: Partial<FontDefinition>): Promise<ServiceResponse<FontDefinition>>;
  deleteFont(id: string): Promise<ServiceResponse<void>>;

  // FAQ CRUD
  saveFaq(faq: Partial<FaqItem>): Promise<ServiceResponse<FaqItem>>;
  deleteFaq(id: string): Promise<ServiceResponse<void>>;
}

class MockAdminService implements AdminService {
  private getLetters(): Letter[] {
    return mockTable.read<Letter[]>('letters', LETTERS_SEED);
  }

  private saveLetters(letters: Letter[]) {
    mockTable.write('letters', letters);
  }

  async getModerationQueue(
    status?: ModerationStatus,
    page: number = 0,
    size: number = 20,
  ): Promise<ServiceResponse<PageResponse<Letter>>> {
    await networkDelay(300);
    const letters = this.getLetters();
    const filtered = status ? letters.filter((l) => l.moderationStatus === status) : letters;
    const start = page * size;
    const paginated = filtered.slice(start, start + size);

    return ok({
      content: paginated,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size) || 1,
      size,
      number: page,
      first: page === 0,
      last: start + size >= filtered.length,
      empty: paginated.length === 0,
    });
  }

  async moderateLetter(id: string, req: AdminModerationRequest): Promise<ServiceResponse<Letter>> {
    await networkDelay(400);
    const letters = this.getLetters();
    const idx = letters.findIndex((l) => l.id === id);
    if (idx === -1) {
      return fail('NOT_FOUND', 'Letter not found');
    }

    letters[idx] = {
      ...letters[idx],
      moderationStatus: req.status,
      status: req.status === 'APPROVED' ? 'DELIVERED' : 'SUBMITTED',
    };
    this.saveLetters(letters);
    return ok(letters[idx]);
  }

  async bookCourier(
    id: string,
    req?: AdminCourierBookingRequest,
  ): Promise<ServiceResponse<AdminCourierBookingResponse>> {
    await networkDelay(500);
    return ok({
      courierBookingId: `BOOK-${id.slice(0, 8).toUpperCase()}`,
      courierTrackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      courierStatus: 'DISPATCHED',
      courierProvider: req?.courierProvider || 'PATHAO',
      estimatedDeliveryDays: 2,
    });
  }

  getPrintPdfUrl(id: string): string {
    return `/api/v1/admin/letters/${id}/print-pdf`;
  }

  async saveTheme(theme: Partial<ThemeDefinition>): Promise<ServiceResponse<ThemeDefinition>> {
    await networkDelay(300);
    return ok(theme as ThemeDefinition);
  }

  async deleteTheme(_id: string): Promise<ServiceResponse<void>> {
    await networkDelay(200);
    return ok(undefined);
  }

  async saveAudioTrack(track: Partial<AudioTrack>): Promise<ServiceResponse<AudioTrack>> {
    await networkDelay(300);
    return ok(track as AudioTrack);
  }

  async deleteAudioTrack(_id: string): Promise<ServiceResponse<void>> {
    await networkDelay(200);
    return ok(undefined);
  }

  async saveDeliveryOption(option: Partial<DeliveryOption>): Promise<ServiceResponse<DeliveryOption>> {
    await networkDelay(300);
    return ok(option as DeliveryOption);
  }

  async deleteDeliveryOption(_type: string): Promise<ServiceResponse<void>> {
    await networkDelay(200);
    return ok(undefined);
  }

  async savePricingPlan(plan: Partial<PricingPlan>): Promise<ServiceResponse<PricingPlan>> {
    await networkDelay(300);
    return ok(plan as PricingPlan);
  }

  async deletePricingPlan(_id: string): Promise<ServiceResponse<void>> {
    await networkDelay(200);
    return ok(undefined);
  }

  async saveFont(font: Partial<FontDefinition>): Promise<ServiceResponse<FontDefinition>> {
    await networkDelay(300);
    return ok(font as FontDefinition);
  }

  async deleteFont(_id: string): Promise<ServiceResponse<void>> {
    await networkDelay(200);
    return ok(undefined);
  }

  async saveFaq(faq: Partial<FaqItem>): Promise<ServiceResponse<FaqItem>> {
    await networkDelay(300);
    return ok(faq as FaqItem);
  }

  async deleteFaq(_id: string): Promise<ServiceResponse<void>> {
    await networkDelay(200);
    return ok(undefined);
  }
}

class HttpAdminService implements AdminService {
  async getModerationQueue(
    status?: ModerationStatus,
    page: number = 0,
    size: number = 20,
  ): Promise<ServiceResponse<PageResponse<Letter>>> {
    return httpClient.get<PageResponse<Letter>>('/admin/letters', {
      params: {
        status: status || undefined,
        page,
        size,
      },
    });
  }

  async moderateLetter(id: string, req: AdminModerationRequest): Promise<ServiceResponse<Letter>> {
    return httpClient.post<Letter>(`/admin/letters/${id}/moderate`, req);
  }

  async bookCourier(
    id: string,
    req?: AdminCourierBookingRequest,
  ): Promise<ServiceResponse<AdminCourierBookingResponse>> {
    return httpClient.post<AdminCourierBookingResponse>(
      `/admin/letters/${id}/courier-book`,
      req || {},
    );
  }

  getPrintPdfUrl(id: string): string {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
    return `${baseUrl}/admin/letters/${id}/print-pdf`;
  }

  async saveTheme(theme: Partial<ThemeDefinition>): Promise<ServiceResponse<ThemeDefinition>> {
    if (theme.id) {
      return httpClient.put<ThemeDefinition>(`/admin/catalog/themes/${theme.id}`, theme);
    }
    return httpClient.post<ThemeDefinition>('/admin/catalog/themes', theme);
  }

  async deleteTheme(id: string): Promise<ServiceResponse<void>> {
    return httpClient.delete<void>(`/admin/catalog/themes/${id}`);
  }

  async saveAudioTrack(track: Partial<AudioTrack>): Promise<ServiceResponse<AudioTrack>> {
    if (track.id) {
      return httpClient.put<AudioTrack>(`/admin/catalog/audio-tracks/${track.id}`, track);
    }
    return httpClient.post<AudioTrack>('/admin/catalog/audio-tracks', track);
  }

  async deleteAudioTrack(id: string): Promise<ServiceResponse<void>> {
    return httpClient.delete<void>(`/admin/catalog/audio-tracks/${id}`);
  }

  async saveDeliveryOption(option: Partial<DeliveryOption>): Promise<ServiceResponse<DeliveryOption>> {
    if (option.type) {
      return httpClient.put<DeliveryOption>(`/admin/catalog/delivery-options/${option.type}`, option);
    }
    return httpClient.post<DeliveryOption>('/admin/catalog/delivery-options', option);
  }

  async deleteDeliveryOption(type: string): Promise<ServiceResponse<void>> {
    return httpClient.delete<void>(`/admin/catalog/delivery-options/${type}`);
  }

  async savePricingPlan(plan: Partial<PricingPlan>): Promise<ServiceResponse<PricingPlan>> {
    if (plan.id) {
      return httpClient.put<PricingPlan>(`/admin/catalog/pricing-plans/${plan.id}`, plan);
    }
    return httpClient.post<PricingPlan>('/admin/catalog/pricing-plans', plan);
  }

  async deletePricingPlan(id: string): Promise<ServiceResponse<void>> {
    return httpClient.delete<void>(`/admin/catalog/pricing-plans/${id}`);
  }

  async saveFont(font: Partial<FontDefinition>): Promise<ServiceResponse<FontDefinition>> {
    if (font.id) {
      return httpClient.put<FontDefinition>(`/admin/catalog/fonts/${font.id}`, font);
    }
    return httpClient.post<FontDefinition>('/admin/catalog/fonts', font);
  }

  async deleteFont(id: string): Promise<ServiceResponse<void>> {
    return httpClient.delete<void>(`/admin/catalog/fonts/${id}`);
  }

  async saveFaq(faq: Partial<FaqItem>): Promise<ServiceResponse<FaqItem>> {
    if (faq.id) {
      return httpClient.put<FaqItem>(`/admin/catalog/faq/${faq.id}`, faq);
    }
    return httpClient.post<FaqItem>('/admin/catalog/faq', faq);
  }

  async deleteFaq(id: string): Promise<ServiceResponse<void>> {
    return httpClient.delete<void>(`/admin/catalog/faq/${id}`);
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export const adminService: AdminService = useMock ? new MockAdminService() : new HttpAdminService();
