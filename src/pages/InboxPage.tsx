import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Send, Eye, Clock, CheckCircle2, AlertCircle, Inbox, Sparkles } from 'lucide-react';
import { letterService } from '../services/letterService';
import { useAuthStore } from '../store/authStore';
import { LinkButton } from '../components/shared/LinkButton';
import type { Letter } from '../types';

type Tab = 'received' | 'sent';

export function InboxPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [receivedLetters, setReceivedLetters] = useState<Letter[]>([]);
  const [sentLetters, setSentLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      letterService.getReceivedLetters({ page: 0, size: 50 }),
      letterService.getSentLetters({ page: 0, size: 50 }),
    ]).then(([recRes, sentRes]) => {
      if (!mounted) return;
      if (recRes.success && Array.isArray(recRes.data)) {
        setReceivedLetters(recRes.data);
      }
      if (sentRes.success && Array.isArray(sentRes.data)) {
        setSentLetters(sentRes.data);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = receivedLetters.filter((l) => !l.read && l.status !== 'OPENED').length;

  const renderStatusBadge = (status: Letter['status']) => {
    switch (status) {
      case 'OPENED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            {t('inbox.statusOpened', 'Opened')}
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold">
            <Clock className="h-3 w-3" />
            {t('inbox.statusDelivered', 'Delivered')}
          </span>
        );
      case 'SUBMITTED':
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-parchment/10 px-2.5 py-0.5 text-xs font-medium text-parchment/70">
            <AlertCircle className="h-3 w-3" />
            {t('inbox.statusPending', 'In Transit')}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-parchment/10 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-parchment flex items-center gap-3">
            <Inbox className="h-7 w-7 text-gold" strokeWidth={1.75} />
            {t('inbox.title', 'Your Postbox')}
          </h1>
          <p className="mt-1 text-sm text-parchment/60">
            {t('inbox.subtitle', 'Letters sealed with love and memories.')}
            {user?.phone ? ` • ${user.phone}` : ''}
          </p>
        </div>
        <LinkButton to="/write" size="sm" variant="primary">
          {t('nav.write', 'Write a letter')}
        </LinkButton>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-parchment/10">
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-gold text-gold font-semibold'
              : 'border-transparent text-parchment/60 hover:text-parchment'
          }`}
        >
          <Mail className="h-4 w-4" />
          {t('inbox.tabReceived', 'Received')}
          {unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-seal px-2 py-0.2 text-[11px] font-bold text-parchment">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-gold text-gold font-semibold'
              : 'border-transparent text-parchment/60 hover:text-parchment'
          }`}
        >
          <Send className="h-4 w-4" />
          {t('inbox.tabSent', 'Sent')}
          <span className="ml-1 text-xs text-parchment/40">({sentLetters.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="py-20 text-center text-parchment/50">
            {t('common.loading', 'Loading…')}
          </div>
        ) : activeTab === 'received' ? (
          receivedLetters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-parchment/15 bg-ink-2/50 py-16 text-center">
              <Mail className="mx-auto h-12 w-12 text-parchment/20" strokeWidth={1} />
              <h3 className="mt-4 font-display text-lg text-parchment">
                {t('inbox.emptyReceivedTitle', 'No letters in your postbox yet')}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-parchment/55">
                {t(
                  'inbox.emptyReceivedBody',
                  'When someone addresses a letter to your phone number, it will arrive here.',
                )}
              </p>
              <LinkButton to="/write" size="sm" className="mt-6">
                {t('inbox.sendFirstLetter', 'Send someone a surprise letter')}
              </LinkButton>
            </div>
          ) : (
            <div className="grid gap-4">
              {receivedLetters.map((letter) => {
                const isUnread = !letter.read && letter.status !== 'OPENED';
                return (
                  <div
                    key={letter.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border p-5 transition-all ${
                      isUnread
                        ? 'border-gold/40 bg-ink-2 shadow-lg ring-1 ring-gold/20'
                        : 'border-parchment/10 bg-ink-2/70 hover:border-parchment/20'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                            <Sparkles className="h-3 w-3" />
                            {t('inbox.newBadge', 'New')}
                          </span>
                        )}
                        <h3 className="font-display text-base text-parchment">
                          {t('inbox.from', 'From')}:{' '}
                          <span className="font-medium text-parchment/90">
                            {letter.senderNickname}
                          </span>
                        </h3>
                      </div>
                      <p className="text-xs text-parchment/50">
                        {t('inbox.receivedOn', 'Received')}{' '}
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Link
                        to={`/letter/${letter.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t('inbox.openLetter', 'Open Letter')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          sentLetters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-parchment/15 bg-ink-2/50 py-16 text-center">
              <Send className="mx-auto h-12 w-12 text-parchment/20" strokeWidth={1} />
              <h3 className="mt-4 font-display text-lg text-parchment">
                {t('inbox.emptySentTitle', 'You haven\u2019t sent any letters yet')}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-parchment/55">
                {t(
                  'inbox.emptySentBody',
                  'Pick a vintage paper, add a soothing melody, and write to someone today.',
                )}
              </p>
              <LinkButton to="/write" size="sm" className="mt-6">
                {t('nav.write', 'Write a letter')}
              </LinkButton>
            </div>
          ) : (
            <div className="grid gap-4">
              {sentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-parchment/10 bg-ink-2/70 p-5 hover:border-parchment/20 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base text-parchment">
                        {t('inbox.to', 'To')}:{' '}
                        <span className="font-medium text-parchment/90">
                          {letter.recipientName}
                        </span>
                      </h3>
                      {renderStatusBadge(letter.status)}
                    </div>
                    <p className="text-xs text-parchment/50">
                      {t('inbox.sentOn', 'Sent')}{' '}
                      {new Date(letter.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Link
                      to={`/letter/${letter.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-parchment/15 px-3 py-1.5 text-xs text-parchment/80 transition-colors hover:bg-parchment/10 hover:text-parchment"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('inbox.viewOpening', 'View Opening')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
