import { motion } from 'framer-motion';

export function EnvelopeIllustration() {
  return (
    <motion.svg
      viewBox="0 0 420 320"
      className="w-full max-w-md"
      initial="hidden"
      animate="visible"
    >
      <defs>
        <linearGradient id="envelopeBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9BD8E" />
          <stop offset="100%" stopColor="#C9A876" />
        </linearGradient>
        <linearGradient id="envelopeFlap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAD6AC" />
          <stop offset="100%" stopColor="#D9BD8E" />
        </linearGradient>
      </defs>

      {/* back of envelope */}
      <rect x="30" y="70" width="360" height="220" rx="10" fill="url(#envelopeBody)" />

      {/* letter peeking out */}
      <motion.rect
        x="70"
        y="30"
        width="280"
        height="180"
        rx="6"
        fill="#F2E7D0"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 30, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <line x1="96" y1="70" x2="300" y2="70" stroke="#241C14" strokeOpacity="0.15" strokeWidth="3" strokeLinecap="round" />
        <line x1="96" y1="92" x2="324" y2="92" stroke="#241C14" strokeOpacity="0.12" strokeWidth="3" strokeLinecap="round" />
        <line x1="96" y1="114" x2="270" y2="114" stroke="#241C14" strokeOpacity="0.12" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* envelope flap */}
      <path d="M30 70 L210 190 L390 70 Z" fill="url(#envelopeFlap)" stroke="#B8965F" strokeWidth="1.5" />
      <path d="M30 290 L170 175 M390 290 L250 175" stroke="#B8965F" strokeWidth="1.5" fill="none" />

      {/* wax seal */}
      <motion.g
        initial={{ scale: 0, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.1, duration: 0.5, ease: 'backOut' }}
      >
        <circle cx="210" cy="150" r="28" fill="#A63D40" />
        <circle cx="210" cy="150" r="28" fill="none" stroke="#832F32" strokeWidth="1" />
        <path
          d="M210 136 C216 140 216 148 210 152 C204 148 204 140 210 136 Z M198 150 C202 144 210 144 214 150 C210 154 202 154 198 150 Z"
          fill="#C9A227"
          opacity="0.85"
        />
      </motion.g>
    </motion.svg>
  );
}
