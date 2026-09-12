import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { useUiStore } from '../store/uiStore';

export function ContactPage() {
  const { t } = useTranslation();
  const pushToast = useUiStore((s) => s.pushToast);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) {
      pushToast('error', t('errors.generic'));
      return;
    }

    setSubmitting(true);
    // Simulate sending message cleanly
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      pushToast('success', t('contact.successMessage'));
    }, 600);
  }

  const infoItems = [
    {
      icon: Mail,
      label: t('contact.emailLabel'),
      value: t('contact.emailValue'),
      href: 'mailto:msrtechnologiesbd@gmail.com',
    },
    {
      icon: Phone,
      label: t('contact.phoneLabel'),
      value: t('contact.phoneValue'),
      href: 'tel:+8801771243165',
    },
    {
      icon: MapPin,
      label: t('contact.addressLabel'),
      value: t('contact.addressValue'),
    },
    {
      icon: Clock,
      label: t('contact.hoursLabel'),
      value: t('contact.hoursValue'),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="font-display text-4xl text-parchment md:text-5xl">{t('contact.title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-parchment/65 leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </motion.div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Info Grid */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {infoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-parchment/10 bg-ink-2/50 p-6 transition-all hover:border-gold/30 hover:bg-ink-2"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-parchment/40">
                    {item.label}
                  </h3>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block font-display text-base text-parchment hover:text-gold transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 font-display text-base text-parchment">{item.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl border border-parchment/10 bg-ink-2/80 p-8 md:p-10 shadow-2xl backdrop-blur-sm"
        >
          {submitted ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-2xl text-parchment">{t('contact.formTitle')}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-parchment/70">
                {t('contact.successMessage')}
              </p>
              <Button
                className="mt-6"
                variant="outline-light"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setContact('');
                  setSubject('');
                  setMessage('');
                }}
              >
                {t('about.storyTitle')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-2xl text-parchment">{t('contact.formTitle')}</h2>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('contact.namePlaceholder')}
                  required
                  className="w-full rounded-xl border border-parchment/15 bg-ink/60 px-4 py-3 text-sm text-parchment placeholder-parchment/35 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t('contact.emailPlaceholder')}
                  required
                  className="w-full rounded-xl border border-parchment/15 bg-ink/60 px-4 py-3 text-sm text-parchment placeholder-parchment/35 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('contact.subjectPlaceholder')}
                  className="w-full rounded-xl border border-parchment/15 bg-ink/60 px-4 py-3 text-sm text-parchment placeholder-parchment/35 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('contact.messagePlaceholder')}
                  required
                  className="w-full rounded-xl border border-parchment/15 bg-ink/60 px-4 py-3 text-sm text-parchment placeholder-parchment/35 focus:border-gold focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" loading={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {t('contact.sendButton')}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
