import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryType, ShippingAddress } from '../types';

interface ComposeDraft {
  senderNickname: string;
  recipientName: string;
  recipientPhone: string;
  content: string;
  themeId: string;
  audioId: string;
  deliveryType: DeliveryType;
  shippingAddress: ShippingAddress | null;
}

interface ComposeState extends ComposeDraft {
  setField: <K extends keyof ComposeDraft>(field: K, value: ComposeDraft[K]) => void;
  reset: () => void;
}

const initialDraft: ComposeDraft = {
  senderNickname: '',
  recipientName: '',
  recipientPhone: '',
  content: '',
  themeId: 'kraft_classic',
  audioId: 'silence',
  deliveryType: 'DIGITAL',
  shippingAddress: null,
};

export const useComposeStore = create<ComposeState>()(
  persist(
    (set) => ({
      ...initialDraft,
      setField: (field, value) => set({ [field]: value } as Partial<ComposeState>),
      reset: () => set(initialDraft),
    }),
    {
      name: 'dakpion:draft',
    },
  ),
);
