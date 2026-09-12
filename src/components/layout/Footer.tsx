import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Feather } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-parchment/10 bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg text-parchment">
              <Feather className="h-5 w-5 text-gold" strokeWidth={1.5} />
              {t('common.appName')}
            </div>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-parchment/50">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-parchment/40">
              {t('footer.product')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-parchment/60">
              <li>
                <Link to="/write" className="hover:text-parchment">
                  {t('nav.write')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-parchment">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-parchment/40">
              {t('footer.company')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-parchment/60">
              <li>
                <Link to="/about" className="transition-colors hover:text-parchment">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-parchment">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-parchment/40">
              {t('footer.legal')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-parchment/60">
              <li>
                <Link to="/privacy" className="transition-colors hover:text-parchment">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-parchment">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-parchment/10 pt-6 text-xs text-parchment/35 sm:flex-row">
          <div>
            © {year} {t('common.appName')}. {t('footer.rightsReserved')}
          </div>
          <div className="flex items-center gap-1.5">
            <span>{t('footer.developedBy', { defaultValue: 'Developed by' })}</span>
            <a
              href="https://msrtechnologiesbd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold transition-colors hover:text-gold/80 hover:underline"
            >
              MSR Technologies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
