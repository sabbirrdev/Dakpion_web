import type { PublicTrackingInfo, ServiceResponse } from '../types';
import { fail, ok, networkDelay } from './serviceUtils';
import { httpClient } from './httpClient';

export interface TrackingService {
  getTrackingDetails(trackingCode: string): Promise<ServiceResponse<PublicTrackingInfo>>;
}

export class MockTrackingService implements TrackingService {
  async getTrackingDetails(trackingCode: string): Promise<ServiceResponse<PublicTrackingInfo>> {
    await networkDelay(600);
    const cleanCode = trackingCode.trim().toUpperCase();

    if (!cleanCode.startsWith('DP-') && cleanCode.length < 5) {
      return fail('NOT_FOUND', 'No letter found with this tracking code.');
    }

    const mockInfo: PublicTrackingInfo = {
      trackingCode: cleanCode,
      currentStatus: 'HANDED_TO_COURIER',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      events: [
        {
          status: 'SUBMITTED',
          note: 'Letter submitted and received in postbox',
          occurredAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        },
        {
          status: 'MODERATION_APPROVED',
          note: 'Letter reviewed and approved for fulfillment',
          occurredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          status: 'PRINTING',
          note: 'Letter printed on vintage textured parchment paper',
          occurredAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        },
        {
          status: 'SEALED',
          note: 'Hand-crafted vintage wax seal applied to envelope',
          occurredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
        {
          status: 'HANDED_TO_COURIER',
          note: 'Dispatched with premium courier partner for delivery',
          occurredAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        },
      ],
    };

    return ok(mockInfo);
  }
}

export class HttpTrackingService implements TrackingService {
  async getTrackingDetails(trackingCode: string): Promise<ServiceResponse<PublicTrackingInfo>> {
    const cleanCode = encodeURIComponent(trackingCode.trim());
    return httpClient.get<PublicTrackingInfo>(`/track/${cleanCode}`);
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export const trackingService: TrackingService = useMock
  ? new MockTrackingService()
  : new HttpTrackingService();
