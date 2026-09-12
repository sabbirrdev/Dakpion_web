import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather } from 'lucide-react';
import { letterService, sanitizeLetterHtml } from '../services/letterService';
import { catalogService } from '../services/catalogService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { LinkButton } from '../components/shared/LinkButton';
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher';
import type { AudioTrack, Letter, ThemeDefinition } from '../types';

type Stage = 'loading' | 'closed' | 'opening' | 'open' | 'not-found';

export function EnvelopePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { play } = useAudioPlayer();

  const [stage, setStage] = useState<Stage>('loading');
  const [letter, setLetter] = useState<Letter | null>(null);
  const [theme, setTheme] = useState<ThemeDefinition | null>(null);
  const [audio, setAudio] = useState<AudioTrack | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      letterService.getLetterById(id),
      catalogService.getThemes(),
      catalogService.getAudioTracks(),
    ]).then(([letterRes, themeRes, audioRes]) => {
      if (!letterRes.success) {
        setStage('not-found');
        return;
      }
      setLetter(letterRes.data);
      if (themeRes.success) {
        setTheme(
          themeRes.data.find((th) => th.id === letterRes.data.themeId) ?? themeRes.data[0],
        );
      }
      if (audioRes.success) {
        setAudio(audioRes.data.find((tr) => tr.id === letterRes.data.audioId) ?? null);
      }
      setStage('closed');
    });
  }, [id]);

  function handleOpen() {
    if (!letter) return;
    setStage('opening');
    if (audio?.src) play(audio.id, audio.src, { loop: true, volume: 0.35 });
    letterService.markOpened(letter.id);
    setTimeout(() => setStage('open'), 900);
  }

  const envelopeColor = theme?.palette.envelope ?? '#C9A876';
  const sealColor = theme?.palette.seal ?? '#A63D40';
  const paperColor = theme?.palette.paperBg ?? '#F2E7D0';
  const inkColor = theme?.palette.ink ?? '#241C14';

  const sanitizedContent = letter ? sanitizeLetterHtml(letter.content) : '';

  return (
    <div className="flex min-h-screen flex-col bg-ink-vignette">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-parchment/80">
          <Feather className="h-4 w-4 text-gold" strokeWidth={1.5} />
          {t('common.appName')}
        </span>
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10">
        {stage === 'loading' && <p className="text-parchment/50">{t('envelope.loading')}</p>}

        {stage === 'not-found' && (
          <div className="max-w-sm text-center">
            <h1 className="font-display text-2xl text-parchment">{t('envelope.notFoundTitle')}</h1>
            <p className="mt-3 text-sm text-parchment/55">{t('envelope.notFoundBody')}</p>
            <LinkButton to="/write" className="mt-6">
              {t('envelope.writeYourOwn')}
            </LinkButton>
          </div>
        )}

        {(stage === 'closed' || stage === 'opening') && letter && (
          <div className="flex flex-col items-center">
            <motion.button
              type="button"
              onClick={handleOpen}
              disabled={stage === 'opening'}
              className="relative"
              whileHover={stage === 'closed' ? { scale: 1.02 } : undefined}
            >
              <svg viewBox="0 0 320 220" className="w-72 sm:w-80" aria-label={t('envelope.tapToOpen')}>
                <rect x="10" y="30" width="300" height="180" rx="10" fill={envelopeColor} />
                <path
                  d="M10 30 L160 150 L310 30"
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="2"
                />
                <motion.path
                  d="M10 30 L160 130 L310 30 Z"
                  fill={envelopeColor}
                  stroke="rgba(0,0,0,0.1)"
                  style={{ transformOrigin: '160px 30px' }}
                  animate={stage === 'opening' ? { rotateX: 180 } : { rotateX: 0 }}
                  transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
                />
                <motion.circle
                  cx="160"
                  cy="115"
                  r="26"
                  fill={sealColor}
                  animate={
                    stage === 'opening'
                      ? { scale: 0, opacity: 0, rotate: 25 }
                      : { scale: 1, opacity: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.4 }}
                  style={{ transformOrigin: '160px 115px' }}
                />
              </svg>
              {stage === 'closed' && (
                <motion.p
                  className="mt-4 text-sm text-parchment/60"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {t('envelope.tapToOpen')}
                </motion.p>
              )}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {stage === 'open' && letter && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-paper-grain w-full max-w-lg rounded-2xl p-8 shadow-2xl sm:p-10"
              style={{ backgroundColor: paperColor }}
            >
              <p className="font-solaiman text-xs uppercase tracking-wide opacity-50" style={{ color: inkColor }}>
                {t('envelope.from')}: {letter.senderNickname}
              </p>
              <div
                className="mt-6 font-letter text-lg leading-relaxed prose max-w-none"
                style={{ color: inkColor }}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
              {letter.openedAt && (
                <p className="mt-8 text-right text-xs opacity-40" style={{ color: inkColor }}>
                  {t('envelope.openedOn', { date: new Date(letter.openedAt).toLocaleDateString() })}
                </p>
              )}
              <div className="mt-8 flex justify-center">
                <LinkButton to="/write" size="sm">
                  {t('envelope.writeYourOwn')}
                </LinkButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
