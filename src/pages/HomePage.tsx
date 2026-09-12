import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PenLine, Palette, ShieldCheck, Send, Plus, Minus } from 'lucide-react';
import { EnvelopeIllustration } from '../components/shared/EnvelopeIllustration';
import { LinkButton } from '../components/shared/LinkButton';
import { catalogService } from '../services/catalogService';
import type { FaqItem, Testimonial } from '../types';
import { usePicker } from '../hooks/useLocale';

const STEP_ICONS = [PenLine, Palette, ShieldCheck, Send];

export function HomePage() {
  const { t } = useTranslation();
  const pick = usePicker();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    catalogService.getTestimonials().then((res) => {
      if (res.success) setTestimonials(res.data);
    });
    catalogService.getFaq().then((res) => {
      if (res.success) setFaqs(res.data);
    });
  }, []);

  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`home.step${n}Title`),
    body: t(`home.step${n}Body`),
    Icon: STEP_ICONS[n - 1],
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink-vignette">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium text-gold">{t('home.heroEyebrow')}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-parchment md:text-5xl">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-parchment/60">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LinkButton to="/write" size="lg">
                {t('home.ctaWrite')}
              </LinkButton>
              <a
                href="#how-it-works"
                className="text-sm text-parchment/70 underline decoration-parchment/30 underline-offset-4 hover:text-parchment"
              >
                {t('home.ctaHowItWorks')}
              </a>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-parchment/10 pt-6">
              <div>
                <dt className="font-display text-2xl text-parchment">৪২,১৮০+</dt>
                <dd className="mt-1 text-xs text-parchment/45">{t('home.statsLettersSent')}</dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-parchment">৬৪</dt>
                <dd className="mt-1 text-xs text-parchment/45">{t('home.statsCities')}</dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-parchment">৭ {t('common.language') === 'Language' ? 'min' : 'মিনিট'}</dt>
                <dd className="mt-1 text-xs text-parchment/45">{t('home.statsAvgTime')}</dd>
              </div>
            </dl>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <EnvelopeIllustration />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-md font-display text-3xl text-parchment">{t('home.howItWorksTitle')}</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ title, body, Icon }, i) => (
            <div key={title} className="relative rounded-2xl border border-parchment/10 bg-ink-2 p-6">
              <span className="font-display text-sm text-gold/70">{String(i + 1).padStart(2, '0')}</span>
              <Icon className="mt-4 h-6 w-6 text-parchment/70" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg text-parchment">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-parchment/50">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="border-y border-parchment/10 bg-ink-2/40">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl text-parchment">{t('home.testimonialsTitle')}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((tm) => (
                <figure key={tm.id} className="rounded-2xl bg-parchment p-6 text-charcoal shadow-lg">
                  <blockquote className="font-display text-[17px] leading-snug">
                    “{pick(tm.quote)}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-charcoal/55">
                    {tm.authorNickname} · {pick(tm.city)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-seal to-seal-dark p-10 text-parchment md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl">{t('home.pricingTeaserTitle')}</h2>
            <p className="mt-2 max-w-md text-sm text-parchment/80">{t('home.pricingTeaserBody')}</p>
          </div>
          <LinkButton to="/pricing" variant="secondary" size="md" className="shrink-0">
            {t('home.pricingTeaserCta')}
          </LinkButton>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
          <h2 className="font-display text-3xl text-parchment">{t('home.faqTitle')}</h2>
          <div className="mt-8 divide-y divide-parchment/10 rounded-2xl border border-parchment/10">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15px] text-parchment">{pick(faq.question)}</span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0 text-gold" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-parchment/40" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-parchment/55">
                      {pick(faq.answer)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
