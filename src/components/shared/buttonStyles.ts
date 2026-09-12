export type Variant = 'primary' | 'secondary' | 'ghost' | 'outline-light';
export type Size = 'md' | 'lg' | 'sm';

export const variantClasses: Record<Variant, string> = {
  primary:
    'bg-seal text-parchment hover:bg-seal-dark shadow-[0_8px_24px_-8px_rgba(166,61,64,0.6)]',
  secondary:
    'bg-parchment text-charcoal hover:bg-parchment-2 border border-charcoal/10',
  ghost: 'bg-transparent text-parchment hover:bg-white/5',
  'outline-light':
    'bg-transparent text-parchment border border-parchment/30 hover:border-gold hover:text-gold',
};

export const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-1.5 rounded-full',
  md: 'text-[15px] px-5 py-2.5 rounded-full',
  lg: 'text-base px-7 py-3.5 rounded-full',
};
