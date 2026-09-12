// ---------------------------------------------------------------------------
// Domain types for DakPion.
// These mirror the eventual backend schema (see project spec) so the mock
// data layer and the future API layer can share the exact same shapes.
// Nothing in the UI layer should import from `mock/` directly — everything
// flows through `services/`, typed against these interfaces.
// ---------------------------------------------------------------------------

export type LocaleCode = 'en' | 'bn';

/** A string that must be supplied in both supported locales. */
export interface LocalizedText {
  en: string;
  bn: string;
}

export type DeliveryType = 'DIGITAL' | 'SMS_SPEED_POST' | 'PHYSICAL';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'NOT_APPLICABLE';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LetterStatus = 'DRAFT' | 'SUBMITTED' | 'DELIVERED' | 'OPENED';

export interface User {
  id: string;
  username?: string;
  phone: string;
  nickname?: string;
  displayName?: string;
  role?: 'SYSTEM_ADMIN' | 'ADMIN' | 'MODERATOR' | 'DEVELOPER' | 'USER';
  appUserType?: string;
  createdAt?: string;
  phoneVerified?: boolean;
}

export interface AdminModerationRequest {
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
}

export interface AdminCourierBookingRequest {
  courierProvider?: 'PATHAO' | 'STEADFAST' | 'NOOP';
  pickupAddress?: string;
  recipientCity?: string;
  recipientZone?: string;
  specialInstructions?: string;
}

export interface AdminCourierBookingResponse {
  courierBookingId: string;
  courierTrackingId: string;
  courierStatus: string;
  courierProvider: string;
  estimatedDeliveryDays: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ThemeDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  tier: 'FREE' | 'PREMIUM';
  price: number; // BDT, 0 for free themes
  /** Tailwind-friendly design tokens so components stay data-driven. */
  palette: {
    paperBg: string;
    paperTexture: string;
    ink: string;
    accent: string;
    envelope: string;
    seal: string;
  };
  previewImage: string;
  occasion?: LocalizedText;
}

export interface AudioTrack {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  /** Public URL — in the mock layer these point at royalty-free sample audio. */
  src: string;
  durationSeconds: number;
  isPremium: boolean;
  price?: number;
}

export interface DeliveryOption {
  type: DeliveryType;
  name: LocalizedText;
  description: LocalizedText;
  price: number; // BDT
  etaLabel: LocalizedText;
  icon: 'link' | 'sms' | 'courier';
}

export interface ShippingAddress {
  fullAddress: string;
  city: string;
  postalCode?: string;
  phone: string;
}

export interface Letter {
  id: string;
  senderNickname: string;
  senderPhoneHashed: string;
  recipientName: string;
  recipientPhone?: string;
  content: string; // Sanitized HTML
  themeId: string;
  audioId: string;
  deliveryType: DeliveryType;
  shippingAddress?: ShippingAddress;
  themeAmount?: number;
  audioAmount?: number;
  deliveryAmount?: number;
  totalAmount?: number;
  currency?: string;
  paymentStatus: PaymentStatus;
  moderationStatus: ModerationStatus;
  status: LetterStatus;
  createdAt: string; // ISO timestamp
  openedAt?: string;
  language: LocaleCode;
  read?: boolean; // Client-side or inbox-specific read indicator
}

export interface OtpChallenge {
  requestId: string;
  phone: string;
  maskedPhone?: string;
  expiresInSeconds: number;
  canResendInSeconds?: number;
  /** Only ever populated by the mock layer or dev for testing convenience. */
  devHintCode?: string;
}

export interface PricingPlan {
  id: string;
  name: LocalizedText;
  tagline: LocalizedText;
  price: number;
  billingUnit: LocalizedText;
  features: LocalizedText[];
  highlighted?: boolean;
}

export interface Testimonial {
  id: string;
  authorNickname: string;
  quote: LocalizedText;
  city: LocalizedText;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface FontDefinition {
  id: string;
  name: string;
  fontFamily: string;
  category: 'bengali' | 'latin';
  cssUrl?: string;
  previewSample: string;
  active?: boolean;
  displayOrder?: number;
}

/** Generic async-result envelope every service method resolves to. */
export interface ServiceResult<T> {
  data: T;
  success: true;
}

export interface DeliveryEvent {
  status: string;
  note?: string;
  occurredAt: string;
}

export interface PublicTrackingInfo {
  trackingCode: string;
  currentStatus: string;
  estimatedDelivery?: string;
  events: DeliveryEvent[];
}

export interface ServiceError {
  success: false;
  code: string;
  message: string;
}

export type ServiceResponse<T> = ServiceResult<T> | ServiceError;
