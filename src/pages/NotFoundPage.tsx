import { useTranslation } from 'react-i18next';
import { LinkButton } from '../components/shared/LinkButton';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <span className="font-display text-6xl text-gold/60">404</span>
      <p className="mt-4 text-parchment/60">{t('envelope.notFoundBody')}</p>
      <LinkButton to="/" className="mt-6">
        {t('common.appName')}
      </LinkButton>
    </div>
  );
}
