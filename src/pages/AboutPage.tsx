import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HeartHandshake, ShieldCheck, Mail, Sparkles, Building2, Feather } from 'lucide-react';
import { LinkButton } from '../components/shared/LinkButton';

export function AboutPage() {
  const { t } = useTranslation();

  const values = [
    {
      icon: HeartHandshake,
      title: t('about.val1Title'),
      body: t('about.val1Body'),
    },
    {
      icon: ShieldCheck,
      title: t('about.val2Title'),
      body: t('about.val2Body'),
    },
    {
      icon: Mail,
      title: t('about.val3Title'),
      body: t('about.val3Body'),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/20">
          <Feather className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="mt-6 font-display text-4xl text-parchment md:text-5xl">{t('about.title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-parchment/65 leading-relaxed">
          {t('about.subtitle')}
        </p>
      </motion.div>

      {/* Story Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-14 rounded-3xl border border-parchment/10 bg-ink-2/70 p-8 md:p-12 shadow-xl backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 text-gold">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-display text-2xl text-parchment">{t('about.storyTitle')}</h2>
        </div>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-parchment/75">
          <p>{t('about.storyP1')}</p>
          <p>{t('about.storyP2')}</p>
        </div>
      </motion.div>

      {/* Core Values */}
      <div className="mt-16">
        <h2 className="text-center font-display text-2xl text-parchment">{t('about.valuesTitle')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="rounded-2xl border border-parchment/10 bg-ink-2/40 p-6 transition-all hover:border-gold/30 hover:bg-ink-2/70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg text-parchment">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-parchment/60">{v.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Company / Developer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16 rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 via-ink-2 to-ink p-8 md:p-10 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-ink">
          <Building2 className="h-6 w-6" strokeWidth={2} />
        </div>
        <h3 className="mt-4 font-display text-2xl text-parchment">{t('about.techTitle')}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-parchment/70">
          {t('about.techBody')}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <LinkButton to="/write" size="md">
            {t('nav.write')}
          </LinkButton>
          <LinkButton to="/contact" variant="outline-light" size="md">
            {t('footer.contact')}
          </LinkButton>
        </div>
      </motion.div>
    </div>
  );
}
