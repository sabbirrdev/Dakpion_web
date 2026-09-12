import { useTranslation } from 'react-i18next';
import { Play, Square, Lock } from 'lucide-react';
import type { AudioTrack } from '../../types';
import { usePicker } from '../../hooks/useLocale';
import { useComposeStore } from '../../store/composeStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioSelectorProps {
  tracks: AudioTrack[];
  loading: boolean;
}

export function AudioSelector({ tracks, loading }: AudioSelectorProps) {
  const { t } = useTranslation();
  const pick = usePicker();
  const { audioId, setField } = useComposeStore();
  const { toggle, currentlyPlayingAudioId } = useAudioPlayer();

  return (
    <div>
      <h3 className="font-display text-lg text-parchment">{t('compose.audioSectionTitle')}</h3>
      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-2" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {tracks.map((track) => {
            const isSelected = track.id === audioId;
            const isPlaying = currentlyPlayingAudioId === track.id;
            return (
              <div
                key={track.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  isSelected ? 'border-gold bg-ink-2' : 'border-parchment/10 bg-ink-2/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setField('audioId', track.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`h-3.5 w-3.5 shrink-0 rounded-full border ${
                      isSelected ? 'border-gold bg-gold' : 'border-parchment/30'
                    }`}
                  />
                  <span className="flex-1">
                    <span className="block text-sm text-parchment">{pick(track.name)}</span>
                    <span className="block text-xs text-parchment/40">{pick(track.category)}</span>
                  </span>
                  {track.isPremium && <Lock className="h-3.5 w-3.5 text-parchment/30" />}
                </button>
                {track.src && (
                  <button
                    type="button"
                    onClick={() => toggle(track.id, track.src, { loop: false, volume: 0.5 })}
                    className="shrink-0 rounded-full bg-parchment/10 p-2 text-parchment hover:bg-parchment/20"
                    aria-label={isPlaying ? t('compose.audioStop') : t('compose.audioPreview')}
                  >
                    {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
