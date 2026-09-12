import type { InputMethod } from './types';
import { avroInputMethod } from './avro';
import { englishInputMethod } from './english';

export * from './types';
export * from './avro';
export * from './english';

export const AVAILABLE_INPUT_METHODS: InputMethod[] = [
  avroInputMethod,
  englishInputMethod,
];

let activeInputMethodId = 'avro';

export function setActiveInputMethodId(id: string): void {
  activeInputMethodId = id;
}

export function getActiveInputMethodId(): string {
  return activeInputMethodId;
}

export function getInputMethod(id: string): InputMethod {
  return (
    AVAILABLE_INPUT_METHODS.find((m) => m.id === id) ?? avroInputMethod
  );
}

export interface BaseResponse<T = unknown> {
  statusCode: number;
  status: boolean;
  message?: string;
  messageBn?: string;
  data: T;
}

// Mirrors a Spring Data Page<T> as serialized by Jackson
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageableRequest {
  page: number;
  size: number;
  searchValue?: string;
  intParam1?: number;
  intParam2?: number;
  intParam3?: number;
  stringParam1?: string;
  stringParam2?: string;
}
