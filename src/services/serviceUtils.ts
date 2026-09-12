import type { ServiceResponse } from '../types';

/**
 * Simulates realistic network latency so loading states are exercised
 * during development, the same way they will be against a real API.
 */
export const networkDelay = (ms = 450 + Math.random() * 350) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const ok = <T,>(data: T): ServiceResponse<T> => ({ success: true, data });

export const fail = <T,>(code: string, message: string): ServiceResponse<T> => ({
  success: false,
  code,
  message,
});

const STORAGE_PREFIX = 'dakpion:mock:';

/** Tiny localStorage-backed store standing in for a real database table. */
export const mockTable = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore quota / private-mode errors in the mock layer */
    }
  },
};
