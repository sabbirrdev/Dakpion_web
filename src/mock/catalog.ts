import type {
  DeliveryOption,
  FaqItem,
  Letter,
  PricingPlan,
  Testimonial,
} from '../types';

export const DELIVERY_OPTIONS_SEED: DeliveryOption[] = [
  {
    type: 'DIGITAL',
    name: { en: 'Digital Link', bn: 'ডিজিটাল লিংক' },
    description: {
      en: 'A unique secret link you share yourself, however you like.',
      bn: 'একটি ইউনিক সিক্রেট লিংক যা আপনি নিজের ইচ্ছেমতো শেয়ার করবেন।',
    },
    price: 0,
    etaLabel: { en: 'Instant', bn: 'সাথে সাথে' },
    icon: 'link',
  },
  {
    type: 'SMS_SPEED_POST',
    name: { en: 'Speed Post (SMS)', bn: 'স্পিড পোস্ট (এসএমএস)' },
    description: {
      en: 'We send an anonymous SMS alert straight to the recipient\u2019s phone.',
      bn: 'আমরা প্রাপকের ফোনে সরাসরি একটি বেনামী এসএমএস অ্যালার্ট পাঠাই।',
    },
    price: 10,
    etaLabel: { en: 'Within minutes', bn: 'কয়েক মিনিটের মধ্যে' },
    icon: 'sms',
  },
  {
    type: 'PHYSICAL',
    name: { en: 'Physical DakPion', bn: 'ফিজিক্যাল ডাকপিওন' },
    description: {
      en: 'Printed on vintage paper, sealed with wax, and couriered to their door.',
      bn: 'ভিন্টেজ কাগজে প্রিন্ট করে, মোম দিয়ে সিলগালা করে সরাসরি ঠিকানায় কুরিয়ার করা হয়।',
    },
    price: 120,
    etaLabel: { en: '2\u20134 business days', bn: '২-৪ কর্মদিবস' },
    icon: 'courier',
  },
];

export const PRICING_PLANS_SEED: PricingPlan[] = [
  {
    id: 'free',
    name: { en: 'Free', bn: 'ফ্রি' },
    tagline: { en: 'For your first letter', bn: 'আপনার প্রথম চিঠির জন্য' },
    price: 0,
    billingUnit: { en: 'per letter', bn: 'প্রতি চিঠি' },
    features: [
      { en: 'Plain & kraft paper themes', bn: 'প্লেইন ও ক্র্যাফট পেপার থিম' },
      { en: '3 free ambient tracks', bn: '৩টি ফ্রি অ্যাম্বিয়েন্ট মিউজিক' },
      { en: 'Digital link delivery', bn: 'ডিজিটাল লিংক ডেলিভারি' },
      { en: 'OTP-verified sending', bn: 'ওটিপি-যাচাইকৃত পাঠানো' },
    ],
  },
  {
    id: 'premium_letter',
    name: { en: 'Premium Letter', bn: 'প্রিমিয়াম চিঠি' },
    tagline: { en: 'Dress it up for the occasion', bn: 'উপলক্ষ অনুযায়ী সাজিয়ে নিন' },
    price: 25,
    billingUnit: { en: 'per letter', bn: 'প্রতি চিঠি' },
    features: [
      { en: 'All vintage & seasonal themes', bn: 'সব ভিন্টেজ ও মৌসুমি থিম' },
      { en: 'Full music library incl. flute & piano', bn: 'বাঁশি ও পিয়ানোসহ সম্পূর্ণ মিউজিক লাইব্রেরি' },
      { en: 'Wax-seal envelope animation', bn: 'মোম-সিল খাম অ্যানিমেশন' },
      { en: 'Priority moderation review', bn: 'অগ্রাধিকার মডারেশন রিভিউ' },
    ],
    highlighted: true,
  },
  {
    id: 'physical_bundle',
    name: { en: 'Physical DakPion', bn: 'ফিজিক্যাল ডাকপিওন' },
    tagline: { en: 'A real letter, at their door', bn: 'সত্যিকারের চিঠি, তাদের দরজায়' },
    price: 120,
    billingUnit: { en: 'per delivery', bn: 'প্রতি ডেলিভারি' },
    features: [
      { en: 'Printed on vintage stock', bn: 'ভিন্টেজ কাগজে প্রিন্ট' },
      { en: 'Real wax seal', bn: 'আসল মোমের সিল' },
      { en: 'Nationwide courier tracking', bn: 'দেশজুড়ে কুরিয়ার ট্র্যাকিং' },
      { en: 'Includes Premium theme & music', bn: 'প্রিমিয়াম থিম ও মিউজিক অন্তর্ভুক্ত' },
    ],
  },
];

export const TESTIMONIALS_SEED: Testimonial[] = [
  {
    id: 't1',
    authorNickname: 'অচেনা পথিক',
    quote: {
      en: 'I hadn\u2019t written a letter by hand in ten years. This made me cry a little, in a good way.',
      bn: 'দশ বছর ধরে হাতে চিঠি লিখিনি। এটা আমাকে একটু কাঁদিয়েছে, ভালো লাগায়।',
    },
    city: { en: 'Dhaka', bn: 'ঢাকা' },
  },
  {
    id: 't2',
    authorNickname: 'নীল আকাশ',
    quote: {
      en: 'Sent a physical letter to my grandmother in Rajshahi. She called me the moment it arrived.',
      bn: 'রাজশাহীতে আমার দাদির কাছে একটা ফিজিক্যাল চিঠি পাঠিয়েছিলাম। পৌঁছানোর সাথে সাথেই ফোন দিলেন।',
    },
    city: { en: 'Rajshahi', bn: 'রাজশাহী' },
  },
  {
    id: 't3',
    authorNickname: 'বৃষ্টিভেজা',
    quote: {
      en: 'The envelope-opening animation with the rain sound is the most delightful five seconds on the internet.',
      bn: 'বৃষ্টির শব্দসহ খাম খোলার অ্যানিমেশনটা ইন্টারনেটের সবচেয়ে সুন্দর পাঁচ সেকেন্ড।',
    },
    city: { en: 'Chattogram', bn: 'চট্টগ্রাম' },
  },
];

export const FAQ_SEED: FaqItem[] = [
  {
    id: 'f1',
    question: { en: 'Do I need an account to write a letter?', bn: 'চিঠি লিখতে কি অ্যাকাউন্ট লাগবে?' },
    answer: {
      en: 'No. Writing is completely guest-mode — no login required. We only ask for a phone number to verify with an OTP right before sending.',
      bn: 'না। লেখাটা সম্পূর্ণ গেস্ট মোডে হয় — লগইন লাগে না। পাঠানোর ঠিক আগে শুধু ওটিপি যাচাইয়ের জন্য একটি ফোন নম্বর চাওয়া হয়।',
    },
  },
  {
    id: 'f2',
    question: { en: 'Will the recipient know who sent it?', bn: 'প্রাপক কি জানবেন কে পাঠিয়েছে?' },
    answer: {
      en: 'Only if you tell them. You can sign with any nickname, and your real phone number is hashed and never shown.',
      bn: 'শুধুমাত্র যদি আপনি নিজে বলেন। আপনি যেকোনো ছদ্মনামে সই করতে পারেন, আর আপনার আসল ফোন নম্বর হ্যাশ করা থাকে, কখনো দেখানো হয় না।',
    },
  },
  {
    id: 'f3',
    question: { en: 'How does the Physical DakPion delivery work?', bn: 'ফিজিক্যাল ডাকপিওন ডেলিভারি কীভাবে কাজ করে?' },
    answer: {
      en: 'After payment, our team prints your letter on vintage paper, seals it with real wax, and books a courier pickup — typically arriving in 2\u20134 business days.',
      bn: 'পেমেন্টের পর আমাদের টিম আপনার চিঠি ভিন্টেজ কাগজে প্রিন্ট করে, আসল মোম দিয়ে সিল করে, এবং কুরিয়ার বুক করে — সাধারণত ২-৪ কর্মদিবসের মধ্যে পৌঁছায়।',
    },
  },
  {
    id: 'f4',
    question: { en: 'Is my letter moderated before delivery?', bn: 'ডেলিভারির আগে কি আমার চিঠি মডারেট করা হয়?' },
    answer: {
      en: 'A lightweight automated filter checks for abusive language at submission. Physical deliveries also get a quick human review before printing.',
      bn: 'সাবমিশনের সময় একটি হালকা অটোমেটেড ফিল্টার আপত্তিকর ভাষা যাচাই করে। ফিজিক্যাল ডেলিভারির ক্ষেত্রে প্রিন্টের আগে দ্রুত মানুষের রিভিউও হয়।',
    },
  },
];

// A handful of realistic sample letters — used to preview the recipient
// "envelope opening" experience and inbox without a live backend.
export const LETTERS_SEED: Letter[] = [
  {
    id: 'a3f1c2d4-11e2-4b8a-9c3d-000000000001',
    senderNickname: 'অচেনা পথিক',
    senderPhoneHashed: 'f3a1...9c2e',
    recipientName: 'তনিমা',
    recipientPhone: '01700000000',
    content:
      '<p>তনিমা,</p><p>অনেকদিন কথা হয় না। আজ হঠাৎ পুরনো গানটা শুনে <strong>তোমার কথা</strong> খুব মনে পড়ল। ভালো থেকো, খুব ভালো থেকো।</p><p>— <em>অচেনা পথিক</em></p>',
    themeId: 'vintage_premium_04',
    audioId: 'gramophone_lofi_tune',
    deliveryType: 'SMS_SPEED_POST',
    paymentStatus: 'PAID',
    moderationStatus: 'APPROVED',
    status: 'DELIVERED',
    createdAt: '2026-08-20T10:15:00.000Z',
    language: 'bn',
    read: false,
  },
  {
    id: 'a3f1c2d4-11e2-4b8a-9c3d-000000000002',
    senderNickname: 'Rainy Afternoon',
    senderPhoneHashed: 'b7c2...1d4f',
    recipientName: 'Traveler',
    recipientPhone: '01700000000',
    content:
      '<p>Dear Friend,</p><p>Just wanted to say <u>thank you</u> for always picking up the phone at 2 AM. Not everyone would do that.</p><p>See you Friday.<br/>— <strong>A friend who owes you a coffee</strong></p>',
    themeId: 'kraft_classic',
    audioId: 'rain_window',
    deliveryType: 'DIGITAL',
    paymentStatus: 'NOT_APPLICABLE',
    moderationStatus: 'APPROVED',
    status: 'OPENED',
    createdAt: '2026-08-28T06:40:00.000Z',
    openedAt: '2026-08-28T09:12:00.000Z',
    language: 'en',
    read: true,
  },
];
