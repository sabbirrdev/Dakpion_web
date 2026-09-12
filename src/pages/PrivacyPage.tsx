import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CreditCard, Database, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: ShieldCheck,
      title: t('privacy.sec1Title'),
      body: t('privacy.sec1Body'),
    },
    {
      icon: Lock,
      title: t('privacy.sec2Title'),
      body: t('privacy.sec2Body'),
    },
    {
      icon: CreditCard,
      title: t('privacy.sec3Title'),
      body: t('privacy.sec3Body'),
    },
    {
      icon: Database,
      title: t('privacy.sec4Title'),
      body: t('privacy.sec4Body'),
    },
    {
      icon: HelpCircle,
      title: t('privacy.sec5Title'),
      body: t('privacy.sec5Body'),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/20">
          <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="mt-6 font-display text-4xl text-parchment md:text-5xl">{t('privacy.title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-parchment/65 leading-relaxed">
          {t('privacy.subtitle')}
        </p>
        <p className="mt-3 text-xs text-parchment/40">{t('privacy.lastUpdated')}</p>
      </motion.div>

      {/* Sections */}
      <div className="mt-14 space-y-8">
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-3xl border border-parchment/10 bg-ink-2/60 p-8 md:p-10 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="font-display text-xl text-parchment">{sec.title}</h2>
              </div>
              <p className="mt-5 text-sm md:text-base leading-relaxed text-parchment/75">
                {sec.body}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-parchment/50">
        <span>Questions? </span>
        <Link to="/contact" className="text-gold underline hover:text-gold/80">
          {t('footer.contact')}
        </Link>
      </div>
    </div>
  );
}
