// Lightweight client-side mirror of the backend's "Bad Words Filter
// Middleware" (see Sprint 1 spec). This is intentionally conservative and
// only used to short-circuit obviously abusive submissions before they hit
// the network — the backend remains the source of truth for moderation.
const BLOCKED_TERMS_EN = ['idiot', 'stupid', 'hate you', 'kill you'];
const BLOCKED_TERMS_BN = ['বোকা', 'মূর্খ', 'ঘৃণা করি'];

export function containsBlockedLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return [...BLOCKED_TERMS_EN, ...BLOCKED_TERMS_BN].some((term) =>
    lower.includes(term.toLowerCase()),
  );
}
