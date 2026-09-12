import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useComposeStore } from '../../store/composeStore';
import type { ThemeDefinition } from '../../types';
import { RichEditor } from './RichEditor';

interface WritingPadProps {
  activeTheme?: ThemeDefinition;
  errors: Partial<Record<'nickname' | 'recipientName' | 'content', string>>;
}

export function WritingPad({ activeTheme, errors }: WritingPadProps) {
  const { t } = useTranslation();
  const { senderNickname, recipientName, content, setField } = useComposeStore();

  // Extract initial plain text length if content already exists
  const initialPlainText = content ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const [charCount, setCharCount] = useState<number>(initialPlainText.length);

  const handleEditorChange = (html: string, plainText: string) => {
    setField('content', html);
    setCharCount(plainText.length);
  };

  return (
    <div>
      <h2 className="font-display text-xl text-parchment">{t('compose.title')}</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-parchment/70">
            {t('compose.nicknameLabel')}
          </label>
          <input
            value={senderNickname}
            onChange={(e) => setField('senderNickname', e.target.value)}
            placeholder={t('compose.nicknamePlaceholder')}
            className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
          />
          {errors.nickname && <p className="mt-1 text-xs text-seal">{errors.nickname}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-parchment/70">
            {t('compose.recipientNameLabel')}
          </label>
          <input
            value={recipientName}
            onChange={(e) => setField('recipientName', e.target.value)}
            placeholder={t('compose.recipientNamePlaceholder')}
            className="w-full rounded-lg border border-parchment/15 bg-ink-2 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
          />
          {errors.recipientName && <p className="mt-1 text-xs text-seal">{errors.recipientName}</p>}
        </div>
      </div>

      {/* The Rich Editor on themed paper */}
      <div className="mt-6">
        <RichEditor
          content={content}
          onChange={handleEditorChange}
          activeTheme={activeTheme}
          placeholder={t('compose.contentPlaceholder')}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-parchment/60">
          <span className="text-seal">{errors.content}</span>
          <span>{t('compose.charCount', { count: charCount })}</span>
        </div>
      </div>
    </div>
  );
}
