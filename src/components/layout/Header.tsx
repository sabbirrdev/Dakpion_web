import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Feather, Inbox, User as UserIcon, LogOut, ShieldAlert } from 'lucide-react';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { LinkButton } from '../shared/LinkButton';
import { useAuthStore } from '../../store/authStore';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors hover:text-parchment ${isActive ? 'text-parchment' : 'text-parchment/60'}`;

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-parchment/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-parchment">
          <Feather className="h-5 w-5 text-gold" strokeWidth={1.5} />
          {t('common.appName')}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/#how-it-works" className={navLinkClass}>
            {t('nav.howItWorks')}
          </NavLink>
          <NavLink to="/pricing" className={navLinkClass}>
            {t('nav.pricing')}
          </NavLink>
          <NavLink to="/track" className={navLinkClass}>
            {t('nav.track', 'Track')}
          </NavLink>
          <NavLink to="/#faq" className={navLinkClass}>
            {t('nav.faq')}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/inbox" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Inbox className="h-4 w-4 text-gold" />
                {t('nav.inbox', 'Inbox')}
              </span>
            </NavLink>
          )}
          {isAuthenticated && ['ADMIN', 'SYSTEM_ADMIN', 'MODERATOR', 'DEVELOPER'].includes(user?.role || user?.appUserType || '') && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="flex items-center gap-1.5 text-gold">
                <ShieldAlert className="h-4 w-4 text-gold" />
                Admin
              </span>
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher variant="dark" />
          
          <LinkButton to="/write" size="sm" variant="primary">
            {t('nav.write')}
          </LinkButton>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-parchment/15 bg-ink-2 px-3 py-1.5 text-xs text-parchment hover:border-gold transition-colors"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <UserIcon className="h-3 w-3" />
                </div>
                <span className="max-w-[100px] truncate font-medium">
                  {user?.nickname || user?.displayName || user?.username || t('account.defaultName', 'Traveler')}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-parchment/20 bg-ink-2 p-1.5 shadow-2xl text-parchment z-50">
                  <div className="px-3 py-2 border-b border-parchment/10 text-xs">
                    <p className="font-medium truncate">{user?.nickname || user?.displayName || user?.username || 'Traveler'}</p>
                    <p className="text-[11px] text-parchment/50 truncate font-mono">{user?.phone || user?.role || ''}</p>
                  </div>
                  {['ADMIN', 'SYSTEM_ADMIN', 'MODERATOR', 'DEVELOPER'].includes(user?.role || user?.appUserType || '') && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gold hover:bg-ink-3 transition-colors font-medium"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Admin Desk
                    </Link>
                  )}
                  <Link
                    to="/inbox"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-parchment/80 hover:bg-ink-3 hover:text-parchment transition-colors"
                  >
                    <Inbox className="h-3.5 w-3.5 text-gold" />
                    {t('nav.inbox', 'Inbox')}
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-parchment/80 hover:bg-ink-3 hover:text-parchment transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    {t('nav.account', 'Profile & Settings')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-seal hover:bg-seal/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t('account.signOut', 'Sign Out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LinkButton to="/sign-in" size="sm" variant="ghost">
                {t('nav.signIn', 'Sign in')}
              </LinkButton>
              <LinkButton to="/sign-up" size="sm" variant="secondary" className="text-xs">
                Register
              </LinkButton>
            </div>
          )}
        </div>

        <button
          type="button"
          className="text-parchment md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-parchment/10 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link to="/#how-it-works" className="text-sm text-parchment/80" onClick={() => setMobileOpen(false)}>
              {t('nav.howItWorks')}
            </Link>
            <Link to="/pricing" className="text-sm text-parchment/80" onClick={() => setMobileOpen(false)}>
              {t('nav.pricing')}
            </Link>
            <Link to="/track" className="text-sm text-parchment/80" onClick={() => setMobileOpen(false)}>
              {t('nav.track', 'Track')}
            </Link>
            <Link to="/#faq" className="text-sm text-parchment/80" onClick={() => setMobileOpen(false)}>
              {t('nav.faq')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/inbox" className="text-sm text-gold flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <Inbox className="h-4 w-4" />
                  {t('nav.inbox', 'Inbox')}
                </Link>
                <Link to="/account" className="text-sm text-parchment/80" onClick={() => setMobileOpen(false)}>
                  {t('nav.account', 'Profile & Settings')}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/sign-in" className="text-sm text-parchment/80" onClick={() => setMobileOpen(false)}>
                  {t('nav.signIn', 'Sign in')}
                </Link>
                <Link to="/sign-up" className="text-sm text-gold font-medium" onClick={() => setMobileOpen(false)}>
                  Register Account
                </Link>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <LanguageSwitcher variant="dark" />
              <LinkButton to="/write" size="sm" onClick={() => setMobileOpen(false)}>
                {t('nav.write')}
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
