import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useUiStore } from '../store/uiStore';

/**
 * Plays at most one AudioTrack at a time (by id + src). Used both for the
 * "preview" button in the theme/audio picker and for looping ambience once
 * a letter is opened. Howler instances are cached per src so scrubbing
 * between previews doesn't re-decode audio repeatedly.
 */
export function useAudioPlayer() {
  const howlsRef = useRef<Map<string, Howl>>(new Map());
  const currentlyPlayingAudioId = useUiStore((s) => s.currentlyPlayingAudioId);
  const setCurrentlyPlayingAudioId = useUiStore((s) => s.setCurrentlyPlayingAudioId);

  useEffect(() => {
    const cache = howlsRef.current;
    return () => {
      cache.forEach((howl) => howl.unload());
      cache.clear();
    };
  }, []);

  const stopAll = useCallback(() => {
    howlsRef.current.forEach((howl) => howl.stop());
    setCurrentlyPlayingAudioId(null);
  }, [setCurrentlyPlayingAudioId]);

  const play = useCallback(
    (id: string, src: string, options?: { loop?: boolean; volume?: number }) => {
      if (!src) {
        stopAll();
        return;
      }
      stopAll();
      let howl = howlsRef.current.get(id);
      if (!howl) {
        howl = new Howl({
          src: [src],
          loop: options?.loop ?? false,
          volume: options?.volume ?? 0.6,
          html5: true,
        });
        howlsRef.current.set(id, howl);
      }
      howl.play();
      setCurrentlyPlayingAudioId(id);
    },
    [setCurrentlyPlayingAudioId, stopAll],
  );

  const toggle = useCallback(
    (id: string, src: string, options?: { loop?: boolean; volume?: number }) => {
      if (currentlyPlayingAudioId === id) {
        stopAll();
      } else {
        play(id, src, options);
      }
    },
    [currentlyPlayingAudioId, play, stopAll],
  );

  return { play, stopAll, toggle, currentlyPlayingAudioId };
}
