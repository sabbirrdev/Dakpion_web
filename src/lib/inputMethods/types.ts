export interface InputMethod {
  id: string;
  name: string;
  nativeName: string;
  transformWord: (word: string) => string;
  transformText: (text: string) => string;
}
