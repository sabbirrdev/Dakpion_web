import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';
import type { Letter, OtpChallenge, ServiceResponse } from '../types';
import { LETTERS_SEED } from '../mock/catalog';
import { containsBlockedLanguage } from '../lib/badWordsFilter';
import { fail, mockTable, networkDelay, ok } from './serviceUtils';
import { httpClient } from './httpClient';
import { useAuthStore } from '../store/authStore';

export interface ComposeLetterInput {
  senderNickname: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone?: string;
  content: string; // HTML string
  themeId: string;
  audioId: string;
  deliveryType: Letter['deliveryType'];
  shippingAddress?: Letter['shippingAddress'];
  language: Letter['language'];
  otpRequestId?: string;
  otpVerificationToken?: string;
}

export interface BasePageableRequest {
  page?: number;
  size?: number;
  searchValue?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface LetterService {
  requestOtp(phone: string): Promise<ServiceResponse<OtpChallenge>>;
  verifyOtp(requestId: string, code: string): Promise<ServiceResponse<{ verified: true; verificationToken?: string }>>;
  /** Initiate SSLCommerz payment for a submitted letter. Returns the gateway redirect URL. */
  initiatePayment(letterId: string): Promise<ServiceResponse<string>>;
  submitLetter(input: ComposeLetterInput): Promise<ServiceResponse<Letter>>;
  getLetterById(id: string): Promise<ServiceResponse<Letter>>;
  markOpened(id: string): Promise<ServiceResponse<Letter>>;
  getReceivedLetters(pageable?: BasePageableRequest): Promise<ServiceResponse<Letter[]>>;
  getSentLetters(pageable?: BasePageableRequest): Promise<ServiceResponse<Letter[]>>;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_KEY = 'otp_rate_limit';

export function sanitizeLetterHtml(dirtyHtml: string): string {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'u', 'em', 'strong', 'span', 'br', 'h1', 'h2', 'h3', 'h4',
      'blockquote', 'ul', 'ol', 'li',
    ],
    ALLOWED_ATTR: ['style', 'class'],
  });
}

export class MockLetterService implements LetterService {
  private otpStore = new Map<string, { phone: string; code: string; expiresAt: number }>();

  private lettersTable(): Letter[] {
    return mockTable.read<Letter[]>('letters', LETTERS_SEED);
  }

  private saveLetters(letters: Letter[]) {
    mockTable.write('letters', letters);
  }

  async requestOtp(phone: string): Promise<ServiceResponse<OtpChallenge>> {
    await networkDelay(600);

    const lastRequestAt = mockTable.read<Record<string, number>>(RATE_LIMIT_KEY, {});
    const now = Date.now();
    if (lastRequestAt[phone] && now - lastRequestAt[phone] < RATE_LIMIT_WINDOW_MS) {
      return fail(
        'RATE_LIMITED',
        'Too many OTP requests. Please wait a moment before trying again.',
      );
    }
    lastRequestAt[phone] = now;
    mockTable.write(RATE_LIMIT_KEY, lastRequestAt);

    const requestId = uuidv4();
    const code = String(Math.floor(1000 + Math.random() * 9000));
    this.otpStore.set(requestId, { phone, code, expiresAt: now + 5 * 60_000 });

    return ok({ requestId, phone, expiresInSeconds: 300, devHintCode: code });
  }

  async verifyOtp(
    requestId: string,
    code: string,
  ): Promise<ServiceResponse<{ verified: true; verificationToken?: string }>> {
    await networkDelay(500);
    const challenge = this.otpStore.get(requestId);
    if (!challenge) return fail('OTP_NOT_FOUND', 'This OTP request has expired. Please retry.');
    if (Date.now() > challenge.expiresAt) return fail('OTP_EXPIRED', 'This code has expired.');
    if (challenge.code !== code) return fail('OTP_INVALID', 'That code doesn\u2019t match.');
    this.otpStore.delete(requestId);
    return ok({ verified: true, verificationToken: `tok_${uuidv4().slice(0, 8)}` });
  }

  async initiatePayment(letterId: string): Promise<ServiceResponse<string>> {
    await networkDelay(500);
    // Mock: pretend we redirect to a fake SSLCommerz gateway page
    return ok(`https://sandbox.sslcommerz.com/gwprocess/v4/image.php?Q=pay&SESSIONKEY=mock_${letterId}`);
  }

  async submitLetter(input: ComposeLetterInput): Promise<ServiceResponse<Letter>> {
    await networkDelay(700);

    const plainText = input.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (containsBlockedLanguage(plainText)) {
      return fail(
        'CONTENT_REJECTED',
        'Your letter contains language that isn\u2019t allowed. Please revise and try again.',
      );
    }

    const sanitized = sanitizeLetterHtml(input.content);

    const letter: Letter = {
      id: uuidv4(),
      senderNickname: input.senderNickname,
      senderPhoneHashed: `${btoa(input.senderPhone).slice(0, 10)}...`,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      content: sanitized,
      themeId: input.themeId,
      audioId: input.audioId,
      deliveryType: input.deliveryType,
      shippingAddress: input.shippingAddress,
      paymentStatus: input.deliveryType === 'DIGITAL' ? 'NOT_APPLICABLE' : 'PAID',
      moderationStatus: 'PENDING',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      language: input.language,
      read: false,
    };

    const letters = this.lettersTable();
    letters.unshift(letter);
    this.saveLetters(letters);

    return ok(letter);
  }

  async getLetterById(id: string): Promise<ServiceResponse<Letter>> {
    await networkDelay(400);
    const letter = this.lettersTable().find((l) => l.id === id);
    if (!letter) return fail('NOT_FOUND', 'This letter could not be found.');
    return ok(letter);
  }

  async markOpened(id: string): Promise<ServiceResponse<Letter>> {
    await networkDelay(200);
    const letters = this.lettersTable();
    const idx = letters.findIndex((l) => l.id === id);
    if (idx === -1) return fail('NOT_FOUND', 'This letter could not be found.');
    letters[idx] = { ...letters[idx], status: 'OPENED', openedAt: new Date().toISOString(), read: true };
    this.saveLetters(letters);
    return ok(letters[idx]);
  }

  async getReceivedLetters(pageable?: BasePageableRequest): Promise<ServiceResponse<Letter[]>> {
    await networkDelay(400);
    const user = useAuthStore.getState().user;
    const letters = this.lettersTable();
    if (!user) return ok([]);
    // In mock mode, match on user's phone or return seed letters if demo user
    const received = letters.filter(
      (l) => l.recipientPhone === user.phone || user.phone === '01700000000',
    );
    const page = pageable?.page ?? 0;
    const size = pageable?.size ?? 50;
    return ok(received.slice(page * size, (page + 1) * size));
  }

  async getSentLetters(pageable?: BasePageableRequest): Promise<ServiceResponse<Letter[]>> {
    await networkDelay(400);
    const user = useAuthStore.getState().user;
    const letters = this.lettersTable();
    if (!user) return ok([]);
    const sent = letters.filter(
      (l) => l.senderPhoneHashed.startsWith(btoa(user.phone).slice(0, 6)) || letters.length > 0,
    );
    const page = pageable?.page ?? 0;
    const size = pageable?.size ?? 50;
    return ok(sent.slice(page * size, (page + 1) * size));
  }
}

export class HttpLetterService implements LetterService {
  async requestOtp(phone: string): Promise<ServiceResponse<OtpChallenge>> {
    return httpClient.post<OtpChallenge>('/otp/request', { phone });
  }

  async verifyOtp(
    requestId: string,
    code: string,
  ): Promise<ServiceResponse<{ verified: true; verificationToken?: string }>> {
    return httpClient.post<{ verified: true; verificationToken?: string }>('/otp/verify', {
      requestId,
      code,
    });
  }

  async initiatePayment(letterId: string): Promise<ServiceResponse<string>> {
    const res = await httpClient.post<{ gatewayUrl?: string; GatewayPageURL?: string } | string>(
      '/payments/initiate',
      { orderId: letterId, paymentMethod: 'SSLCOMMERZ' },
    );
    if (!res.success) return { success: false, code: res.code, message: res.message };
    // Backend may return a plain string URL or an object with GatewayPageURL
    const raw = res.data;
    if (typeof raw === 'string') return ok(raw);
    const url = (raw as { gatewayUrl?: string; GatewayPageURL?: string }).GatewayPageURL
      ?? (raw as { gatewayUrl?: string }).gatewayUrl
      ?? '';
    if (!url) return { success: false, code: 'NO_GATEWAY_URL', message: 'Payment gateway URL not returned.' };
    return ok(url);
  }

  async submitLetter(input: ComposeLetterInput): Promise<ServiceResponse<Letter>> {
    const sanitized = sanitizeLetterHtml(input.content);
    return httpClient.post<Letter>('/letters/compose', {
      ...input,
      content: sanitized,
    });
  }

  async getLetterById(id: string): Promise<ServiceResponse<Letter>> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
    if (isUuid) {
      return httpClient.get<Letter>(`/letters/${id.trim()}`);
    }
    // If not a UUID, try short code resolver first
    const resolveRes = await httpClient.get<{ letterId: string; shortCode: string }>(`/letters/short/${id.trim()}`);
    if (resolveRes.success && resolveRes.data?.letterId) {
      return httpClient.get<Letter>(`/letters/${resolveRes.data.letterId}`);
    }
    // Fallback directly to GET /letters/{id}
    return httpClient.get<Letter>(`/letters/${id.trim()}`);
  }

  async markOpened(id: string): Promise<ServiceResponse<Letter>> {
    return httpClient.post<Letter>(`/letters/${id}/open`);
  }

  async getReceivedLetters(pageable?: BasePageableRequest): Promise<ServiceResponse<Letter[]>> {
    const payload: BasePageableRequest = {
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 50,
      searchValue: pageable?.searchValue,
    };
    const res = await httpClient.put<PageResponse<Letter> | Letter[]>('/me/letters/received', payload);
    if (res.success) {
      const data = res.data;
      if (Array.isArray(data)) {
        return ok(data);
      }
      if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<Letter>).content)) {
        return ok((data as PageResponse<Letter>).content);
      }
      return ok([]);
    }
    return { success: false, code: res.code || 'FETCH_ERROR', message: res.message || 'Failed to load received letters.' };
  }

  async getSentLetters(pageable?: BasePageableRequest): Promise<ServiceResponse<Letter[]>> {
    const payload: BasePageableRequest = {
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 50,
      searchValue: pageable?.searchValue,
    };
    const res = await httpClient.put<PageResponse<Letter> | Letter[]>('/me/letters/sent', payload);
    if (res.success) {
      const data = res.data;
      if (Array.isArray(data)) {
        return ok(data);
      }
      if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<Letter>).content)) {
        return ok((data as PageResponse<Letter>).content);
      }
      return ok([]);
    }
    return { success: false, code: res.code || 'FETCH_ERROR', message: res.message || 'Failed to load sent letters.' };
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export const letterService: LetterService = useMock
  ? new MockLetterService()
  : new HttpLetterService();
