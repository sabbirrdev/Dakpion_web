import type { InputMethod } from './types';

export const englishInputMethod: InputMethod = {
  id: 'english',
  name: 'English',
  nativeName: 'English',
  transformWord: (word: string) => word,
  transformText: (text: string) => text,
};
