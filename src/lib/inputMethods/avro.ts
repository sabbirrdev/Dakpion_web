import type { InputMethod } from './types';

/**
 * -----------------------------------------------------------------------------
 * Avro Phonetic Transliteration Engine for Bengali Unicode
 * -----------------------------------------------------------------------------
 * Maps English phonetic keystrokes to standard Unicode Bengali characters
 * according to Avro Phonetic rules.
 * -----------------------------------------------------------------------------
 */

// Special symbols & digits
const NUMBERS: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
};

// Independent vowels (at the start of words or after vowels)
const VOWELS: Record<string, string> = {
  'a': 'অ',
  'o': 'অ',
  'aa': 'আ',
  'A': 'আ',
  'i': 'ই',
  'I': 'ঈ',
  'ee': 'ঈ',
  'u': 'উ',
  'U': 'ঊ',
  'oo': 'ঊ',
  'e': 'এ',
  'E': 'এ',
  'oi': 'ঐ',
  'O': 'ও',
  'ou': 'ঔ',
  'au': 'ঔ',
  'rri': 'ঋ',
  'ri': 'ঋ',
};

// Dependent vowel signs (kar) attached to consonants
const KAR: Record<string, string> = {
  'aa': 'া',
  'a': 'া',
  'A': 'া',
  'i': 'ি',
  'I': 'ী',
  'ee': 'ী',
  'u': 'ু',
  'U': 'ূ',
  'oo': 'ূ',
  'e': 'ে',
  'E': '্যা',
  'oi': 'ৈ',
  'O': 'ো',
  'o': 'ো',
  'ou': 'ৌ',
  'au': 'ৌ',
  'rri': 'ৃ',
  'ri': 'ৃ',
};

// Compound consonants / Juktakkhor patterns sorted by length descending
const JUKTO: [string, string][] = [
  ['kkhy', 'ক্ষ্য'],
  ['kkhm', 'ক্ষ্ম'],
  ['kkhN', 'ক্ষ্ণ'],
  ['shchw', 'শ্ছ'],
  ['cchw', 'চ্ছ্ব'],
  ['jjw', 'জ্জ্ব'],
  ['ttw', 'ত্ত্ব'],
  ['kkh', 'ক্ষ'],
  ['cch', 'চ্ছ'],
  ['gdh', 'গ্ধ'],
  ['Ngk', 'ঙ্ক'],
  ['Ngkh', 'ঙ্খ'],
  ['Nggh', 'ঙ্ঘ'],
  ['Ngm', 'ঙ্ম'],
  ['Ngg', 'ঙ্গ'],
  ['shch', 'শ্চ'],
  ['shn', 'শ্ন'],
  ['shm', 'শ্ম'],
  ['shb', 'শ্ব'],
  ['shl', 'শ্ল'],
  ['shr', 'শ্র'],
  ['STh', 'ষ্ঠ'],
  ['Sph', 'ষ্ফ'],
  ['sth', 'স্থ'],
  ['sph', 'স্ফ'],
  ['dhn', 'ধ্ন'],
  ['dhm', 'ধ্ম'],
  ['dhr', 'ধ্র'],
  ['dhw', 'ধ্ব'],
  ['mph', 'ম্ফ'],
  ['mbh', 'ম্ভ'],
  ['lph', 'ল্ফ'],
  ['lbh', 'ল্ভ'],
  ['nth', 'ন্থ'],
  ['ndh', 'ন্ধ'],
  ['NTh', 'ণ্ঠ'],
  ['NDh', 'ণ্ঢ'],
  ['TTh', 'ট্ঠ'],
  ['DDh', 'ড্ঢ'],
  ['dbh', 'দ্ভ'],
  ['jN', 'জ্ঞ'],
  ['jJ', 'জ্ঞ'],
  ['kk', 'ক্ক'],
  ['kt', 'ক্ত'],
  ['kl', 'ক্ল'],
  ['kw', 'ক্ব'],
  ['ks', 'ক্স'],
  ['gn', 'গ্ন'],
  ['gm', 'গ্ম'],
  ['gl', 'গ্ল'],
  ['gw', 'গ্ব'],
  ['cc', 'চ্চ'],
  ['jj', 'জ্জ'],
  ['jjh', 'জ্ঝ'],
  ['TT', 'ট্ট'],
  ['DD', 'ড্ড'],
  ['NT', 'ণ্ট'],
  ['ND', 'ণ্ড'],
  ['Nn', 'ণ্ণ'],
  ['Nm', 'ণ্ম'],
  ['Nw', 'ণ্ব'],
  ['tt', 'ত্ত'],
  ['tth', 'ত্থ'],
  ['tn', 'ত্ন'],
  ['tm', 'ত্ম'],
  ['tr', 'ত্র'],
  ['tw', 'ত্ব'],
  ['ts', 'ৎস'],
  ['thw', 'থ্ব'],
  ['dd', 'দ্দ'],
  ['ddh', 'দ্ধ'],
  ['db', 'দ্ব'],
  ['dm', 'দ্ম'],
  ['dr', 'দ্র'],
  ['dw', 'দ্ব'],
  ['nt', 'ন্ত'],
  ['nd', 'ন্দ'],
  ['nn', 'ন্ন'],
  ['nm', 'ন্ম'],
  ['nr', 'ন্র'],
  ['nw', 'ন্ব'],
  ['ns', 'ন্স'],
  ['pt', 'প্ত'],
  ['pn', 'প্ন'],
  ['pp', 'প্প'],
  ['pl', 'প্ল'],
  ['ps', 'প্স'],
  ['pw', 'প্ব'],
  ['bd', 'ব্দ'],
  ['bdh', 'ব্ধ'],
  ['bb', 'ব্ব'],
  ['bl', 'ব্ল'],
  ['bw', '্ব'],
  ['bhy', 'ভ্য'],
  ['bhr', 'ভ্র'],
  ['mn', 'ম্ন'],
  ['mp', 'ম্প'],
  ['mb', 'ম্ব'],
  ['mm', 'ম্ম'],
  ['ml', 'ম্ল'],
  ['mr', 'ম্র'],
  ['mw', 'ম্ব'],
  ['lk', 'ল্ক'],
  ['lg', 'ল্গ'],
  ['lt', 'ল্ত'],
  ['ld', 'ল্দ'],
  ['lp', 'ল্প'],
  ['lb', 'ল্ব'],
  ['lm', 'ল্ম'],
  ['ll', 'ল্ল'],
  ['ST', 'ষ্ট'],
  ['SN', 'ষ্ণ'],
  ['Sp', 'ষ্প'],
  ['Sm', 'ষ্ম'],
  ['st', 'স্ত'],
  ['sn', 'স্ন'],
  ['sp', 'স্প'],
  ['sb', 'স্ব'],
  ['sm', 'স্ম'],
  ['sr', 'স্র'],
  ['sl', 'স্ল'],
  ['sw', 'স্ব'],
  ['hn', 'হ্ন'],
  ['hN', 'হ্ণ'],
  ['hm', 'হ্ম'],
  ['hl', 'হ্ল'],
  ['hb', 'হ্ব'],
  ['hr', 'হ্র'],
];

// Single consonants sorted by length descending
const CONSONANTS: [string, string][] = [
  ['kkh', 'ক্ষ'],
  ['k', 'ক'],
  ['kh', 'খ'],
  ['gh', 'ঘ'],
  ['g', 'গ'],
  ['Ng', 'ঙ'],
  ['ng', 'ং'],
  ['chh', 'ছ'],
  ['Ch', 'ছ'],
  ['ch', 'চ'],
  ['c', 'চ'],
  ['jh', 'ঝ'],
  ['j', 'জ'],
  ['Ny', 'ঞ'],
  ['Th', 'ঠ'],
  ['T', 'ট'],
  ['Dh', 'ঢ'],
  ['D', 'ড'],
  ['Rh', 'ঢ়'],
  ['R', 'ড়'],
  ['N', 'ণ'],
  ['th', 'থ'],
  ['t`', 'ৎ'],
  ['t', 'ত'],
  ['dh', 'ধ'],
  ['d', 'দ'],
  ['n', 'ন'],
  ['ph', 'ফ'],
  ['p', 'প'],
  ['f', 'ফ'],
  ['bh', 'ভ'],
  ['v', 'ভ'],
  ['b', 'ব'],
  ['m', 'ম'],
  ['z', 'য'],
  ['y', 'য়'],
  ['Z', '্য'],
  ['r', 'র'],
  ['l', 'ল'],
  ['sh', 'শ'],
  ['Sh', 'ষ'],
  ['S', 'ষ'],
  ['s', 'স'],
  ['h`', 'ঃ'],
  ['h', 'হ'],
  ['w', 'ও'],
];

export function transliterateAvroWord(word: string): string {
  if (!word) return '';

  let i = 0;
  let result = '';
  let lastWasConsonant = false;

  while (i < word.length) {
    const char = word[i];

    // Numbers
    if (NUMBERS[char]) {
      result += NUMBERS[char];
      lastWasConsonant = false;
      i++;
      continue;
    }

    // Punctuations or special flags
    if (char === ':' || char === '`') {
      if (word.startsWith('``', i)) {
        i += 2;
        continue;
      }
      if (char === ':') {
        result += 'ঃ';
        lastWasConsonant = false;
        i++;
        continue;
      }
    }

    if (char === '^') {
      result += 'ঁ';
      lastWasConsonant = false;
      i++;
      continue;
    }

    // Check ref (r prefix followed by consonant)
    if (char === 'r' && i + 1 < word.length) {
      const nextSlice = word.slice(i + 1);
      const isNextConsonant = CONSONANTS.some(([eng]) => nextSlice.startsWith(eng));
      const isNextVowel = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'].includes(word[i + 1]);
      if (isNextConsonant && !isNextVowel && !lastWasConsonant) {
        // Look for the consonant
        for (const [eng, bn] of CONSONANTS) {
          if (nextSlice.startsWith(eng)) {
            result += bn + '্'; // In Bengali Unicode: consonant + hasant + ya or ref
            // Actually standard Ref in Unicode is র্ (Ra + Hasanta + Consonant)
            // 'r' followed by consonant becomes র্ + consonant
            result = result.slice(0, -2) + 'র্' + bn;
            lastWasConsonant = true;
            i += 1 + eng.length;
            break;
          }
        }
        continue;
      }
    }

    // Check compound consonants (Jukto)
    let matchedJukto = false;
    for (const [eng, bn] of JUKTO) {
      if (word.startsWith(eng, i)) {
        result += bn;
        lastWasConsonant = true;
        matchedJukto = true;
        i += eng.length;
        break;
      }
    }
    if (matchedJukto) continue;

    // Check single consonants
    let matchedConsonant = false;
    for (const [eng, bn] of CONSONANTS) {
      if (word.startsWith(eng, i)) {
        result += bn;
        lastWasConsonant = true;
        matchedConsonant = true;
        i += eng.length;
        break;
      }
    }
    if (matchedConsonant) continue;

    // Check vowels (Kar if following a consonant, or independent vowel)
    let matchedVowel = false;
    const vowelKeys = ['rri', 'ri', 'aa', 'ee', 'oo', 'oi', 'ou', 'au', 'a', 'A', 'i', 'I', 'u', 'U', 'e', 'E', 'o', 'O'];
    for (const v of vowelKeys) {
      if (word.startsWith(v, i)) {
        if (lastWasConsonant) {
          if (v === 'a' || v === 'o') {
            // Implicit inherent vowel, omit explicit kar
            lastWasConsonant = false;
          } else {
            result += KAR[v] || '';
            lastWasConsonant = false;
          }
        } else {
          result += VOWELS[v] || '';
          lastWasConsonant = false;
        }
        matchedVowel = true;
        i += v.length;
        break;
      }
    }
    if (matchedVowel) continue;

    // Direct passthrough for unknown characters
    result += char;
    lastWasConsonant = false;
    i++;
  }

  return result;
}

export function transliterateAvroText(text: string): string {
  // Split on word boundaries while preserving whitespace & formatting
  return text.replace(/([a-zA-Z0-9`^:]+)/g, (match) => {
    return transliterateAvroWord(match);
  });
}

export const avroInputMethod: InputMethod = {
  id: 'avro',
  name: 'Bangla (Avro)',
  nativeName: 'বাংলা (Avro)',
  transformWord: transliterateAvroWord,
  transformText: transliterateAvroText,
};
