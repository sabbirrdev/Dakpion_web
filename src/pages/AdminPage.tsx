import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  Eye,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit2,
  Music,
  Palette,
  DollarSign,
  HelpCircle,
  Type,
  Layers,
  Play,
  Pause,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { catalogService } from '../services/catalogService';
import { useUiStore } from '../store/uiStore';
import { Button } from '../components/shared/Button';
import type {
  Letter,
  ModerationStatus,
  ThemeDefinition,
  AudioTrack,
  DeliveryOption,
  PricingPlan,
  FontDefinition,
  FaqItem,
} from '../types';

type AdminTab = 'moderation' | 'themes' | 'audio' | 'delivery' | 'pricing' | 'fonts' | 'faq';

export function AdminPage() {
  const pushToast = useUiStore((s) => s.pushToast);
  const [activeTab, setActiveTab] = useState<AdminTab>('moderation');

  // ---------------------------------------------------------------------------
  // Moderation State
  // ---------------------------------------------------------------------------
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Catalogs CMS State
  // ---------------------------------------------------------------------------
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [fonts, setFonts] = useState<FontDefinition[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Audio playback preview
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Modal Editing State
  const [editingTheme, setEditingTheme] = useState<Partial<ThemeDefinition> | null>(null);
  const [editingAudio, setEditingAudio] = useState<Partial<AudioTrack> | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Partial<DeliveryOption> | null>(null);
  const [editingPricing, setEditingPricing] = useState<Partial<PricingPlan> | null>(null);
  const [editingFont, setEditingFont] = useState<Partial<FontDefinition> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const fetchLetters = useCallback(async () => {
    setLoadingLetters(true);
    const filter = statusFilter === 'ALL' ? undefined : statusFilter;
    const res = await adminService.getModerationQueue(filter, 0, 50);
    setLoadingLetters(false);

    if (res.success) {
      setLetters(res.data.content || []);
    } else {
      pushToast('error', res.message || 'Failed to fetch letters for moderation');
    }
  }, [statusFilter, pushToast]);

  const fetchCatalogs = useCallback(async () => {
    setLoadingCatalog(true);
    const [tRes, aRes, dRes, pRes, fRes, qRes] = await Promise.all([
      catalogService.getThemes(),
      catalogService.getAudioTracks(),
      catalogService.getDeliveryOptions(),
      catalogService.getPricingPlans(),
      catalogService.getFonts(),
      catalogService.getFaq(),
    ]);
    setLoadingCatalog(false);

    if (tRes.success) setThemes(tRes.data || []);
    if (aRes.success) setAudioTracks(aRes.data || []);
    if (dRes.success) setDeliveryOptions(dRes.data || []);
    if (pRes.success) setPricingPlans(pRes.data || []);
    if (fRes.success) setFonts(fRes.data || []);
    if (qRes.success) setFaqs(qRes.data || []);
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') {
      fetchLetters();
    } else {
      fetchCatalogs();
    }
  }, [activeTab, fetchLetters, fetchCatalogs]);

  // ---------------------------------------------------------------------------
  // Audio playback handler
  // ---------------------------------------------------------------------------
  const togglePlayAudio = (track: AudioTrack) => {
    if (playingAudioId === track.id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(track.src);
      audioPlayerRef.current = audio;
      audio.play().catch(() => pushToast('error', 'Audio playback failed'));
      audio.onended = () => setPlayingAudioId(null);
      setPlayingAudioId(track.id);
    }
  };

  // ---------------------------------------------------------------------------
  // Moderation Actions
  // ---------------------------------------------------------------------------
  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    const res = await adminService.moderateLetter(id, { status: 'APPROVED' });
    setActionInProgress(null);

    if (res.success) {
      pushToast('success', 'Letter approved and queued for delivery');
      setLetters((prev) =>
        prev.map((l) => (l.id === id ? { ...l, moderationStatus: 'APPROVED' } : l)),
      );
      if (selectedLetter?.id === id) {
        setSelectedLetter((prev) => (prev ? { ...prev, moderationStatus: 'APPROVED' } : null));
      }
    } else {
      pushToast('error', res.message || 'Failed to approve letter');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;

    setActionInProgress(rejectingId);
    const res = await adminService.moderateLetter(rejectingId, {
      status: 'REJECTED',
      reason: rejectionReason || 'Content violates decency and privacy standards',
    });
    setActionInProgress(null);
    setRejectingId(null);
    setRejectionReason('');

    if (res.success) {
      pushToast('info', 'Letter rejected');
      setLetters((prev) =>
        prev.map((l) => (l.id === rejectingId ? { ...l, moderationStatus: 'REJECTED' } : l)),
      );
      if (selectedLetter?.id === rejectingId) {
        setSelectedLetter((prev) => (prev ? { ...prev, moderationStatus: 'REJECTED' } : null));
      }
    } else {
      pushToast('error', res.message || 'Failed to reject letter');
    }
  };

  const handleBookCourier = async (id: string) => {
    setActionInProgress(id);
    const res = await adminService.bookCourier(id, { courierProvider: 'PATHAO' });
    setActionInProgress(null);

    if (res.success) {
      pushToast(
        'success',
        `Courier booked with ${res.data.courierProvider}! Tracking ID: ${res.data.courierTrackingId}`,
      );
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                courierBookingId: res.data.courierBookingId,
                courierTrackingId: res.data.courierTrackingId,
              }
            : l,
        ),
      );
    } else {
      pushToast('error', res.message || 'Failed to book courier');
    }
  };

  // ---------------------------------------------------------------------------
  // CMS CRUD Handlers
  // ---------------------------------------------------------------------------

  // Themes
  const handleSaveTheme = async (theme: Partial<ThemeDefinition>) => {
    const res = await adminService.saveTheme(theme);
    if (res.success) {
      pushToast('success', `Theme "${theme.id}" saved successfully!`);
      setEditingTheme(null);
      fetchCatalogs();
    } else {
      pushToast('error', res.message || 'Failed to save theme');
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete theme "${id}"?`)) return;
    const res = await adminService.deleteTheme(id);
    if (res.success) {
      pushToast('info', `Theme "${id}" deleted`);
      setThemes((prev) => prev.filter((t) => t.id !== id));
    } else {
      pushToast('error', res.message || 'Failed to delete theme');
    }
  };

  // Audio Tracks
  const handleSaveAudio = async (track: Partial<AudioTrack>) => {
    const res = await adminService.saveAudioTrack(track);
    if (res.success) {
      pushToast('success', `Audio track "${track.id}" saved successfully!`);
      setEditingAudio(null);
      fetchCatalogs();
    } else {
      pushToast('error', res.message || 'Failed to save audio track');
    }
  };

  const handleDeleteAudio = async (id: string) => {
    if (!window.confirm(`Delete audio track "${id}"?`)) return;
    const res = await adminService.deleteAudioTrack(id);
    if (res.success) {
      pushToast('info', `Audio track "${id}" deleted`);
      setAudioTracks((prev) => prev.filter((a) => a.id !== id));
    } else {
      pushToast('error', res.message || 'Failed to delete audio track');
    }
  };

  // Delivery Options
  const handleSaveDelivery = async (option: Partial<DeliveryOption>) => {
    const res = await adminService.saveDeliveryOption(option);
    if (res.success) {
      pushToast('success', `Delivery option "${option.type}" saved!`);
      setEditingDelivery(null);
      fetchCatalogs();
    } else {
      pushToast('error', res.message || 'Failed to save delivery option');
    }
  };

  const handleDeleteDelivery = async (type: string) => {
    if (!window.confirm(`Delete delivery option "${type}"?`)) return;
    const res = await adminService.deleteDeliveryOption(type);
    if (res.success) {
      pushToast('info', `Delivery option "${type}" deleted`);
      setDeliveryOptions((prev) => prev.filter((d) => d.type !== type));
    } else {
      pushToast('error', res.message || 'Failed to delete delivery option');
    }
  };

  // Pricing Plans
  const handleSavePricing = async (plan: Partial<PricingPlan>) => {
    const res = await adminService.savePricingPlan(plan);
    if (res.success) {
      pushToast('success', `Pricing plan "${plan.id}" saved!`);
      setEditingPricing(null);
      fetchCatalogs();
    } else {
      pushToast('error', res.message || 'Failed to save pricing plan');
    }
  };

  const handleDeletePricing = async (id: string) => {
    if (!window.confirm(`Delete pricing plan "${id}"?`)) return;
    const res = await adminService.deletePricingPlan(id);
    if (res.success) {
      pushToast('info', `Pricing plan "${id}" deleted`);
      setPricingPlans((prev) => prev.filter((p) => p.id !== id));
    } else {
      pushToast('error', res.message || 'Failed to delete pricing plan');
    }
  };

  // Fonts
  const handleSaveFont = async (font: Partial<FontDefinition>) => {
    const res = await adminService.saveFont(font);
    if (res.success) {
      pushToast('success', `Font "${font.name}" saved!`);
      setEditingFont(null);
      fetchCatalogs();
    } else {
      pushToast('error', res.message || 'Failed to save font');
    }
  };

  const handleDeleteFont = async (id: string) => {
    if (!window.confirm(`Delete font "${id}"?`)) return;
    const res = await adminService.deleteFont(id);
    if (res.success) {
      pushToast('info', `Font "${id}" deleted`);
      setFonts((prev) => prev.filter((f) => f.id !== id));
    } else {
      pushToast('error', res.message || 'Failed to delete font');
    }
  };

  // FAQs
  const handleSaveFaq = async (faq: Partial<FaqItem>) => {
    const res = await adminService.saveFaq(faq);
    if (res.success) {
      pushToast('success', 'FAQ item saved!');
      setEditingFaq(null);
      fetchCatalogs();
    } else {
      pushToast('error', res.message || 'Failed to save FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Delete this FAQ item?')) return;
    const res = await adminService.deleteFaq(id);
    if (res.success) {
      pushToast('info', 'FAQ item deleted');
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } else {
      pushToast('error', res.message || 'Failed to delete FAQ');
    }
  };

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  const filteredLetters = letters.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.recipientName?.toLowerCase().includes(term) ||
      l.senderNickname?.toLowerCase().includes(term) ||
      l.recipientPhone?.includes(term) ||
      l.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-solaiman">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-parchment/10 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-parchment flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-gold" strokeWidth={1.75} />
            DakPion Admin & CMS Hub
          </h1>
          <p className="mt-1 text-sm text-parchment/60 font-solaiman">
            Manage moderation queue, physical dispatches, pricing, fonts, audio, themes, and dynamic portal assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={activeTab === 'moderation' ? fetchLetters : fetchCatalogs}
            disabled={loadingLetters || loadingCatalog}
            className="flex items-center gap-1.5"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingLetters || loadingCatalog ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-parchment/15 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'moderation'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <Layers className="h-4 w-4" />
          Letter Moderation Queue
          {letters.filter((l) => l.moderationStatus === 'PENDING').length > 0 && (
            <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
              {letters.filter((l) => l.moderationStatus === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'themes'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <Palette className="h-4 w-4" />
          Letter Themes ({themes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'audio'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <Music className="h-4 w-4" />
          Audio Tracks ({audioTracks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fonts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'fonts'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <Type className="h-4 w-4" />
          Fonts & Typography ({fonts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'delivery'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <Truck className="h-4 w-4" />
          Delivery Options ({deliveryOptions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'pricing'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Pricing Plans ({pricingPlans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'faq'
              ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/20'
              : 'bg-ink-2/80 text-parchment/70 hover:bg-ink-2 hover:text-parchment border border-parchment/10'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          FAQ ({faqs.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MODERATION QUEUE */}
      {/* ===================================================================== */}
      {activeTab === 'moderation' && (
        <div className="mt-6">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="flex items-center gap-1 rounded-xl bg-ink-2 p-1 border border-parchment/10 text-xs">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipient, sender, phone..."
                className="w-full rounded-lg border border-parchment/15 bg-ink-2 pl-9 pr-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Letters Table */}
          <div className="mt-6 rounded-xl border border-parchment/15 bg-ink-2/60 overflow-hidden shadow-xl">
            {loadingLetters ? (
              <div className="py-24 text-center text-parchment/50">Loading letters queue…</div>
            ) : filteredLetters.length === 0 ? (
              <div className="py-20 text-center text-parchment/40">
                No letters found matching the criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-parchment">
                  <thead className="border-b border-parchment/10 bg-ink-2/90 text-xs uppercase text-parchment/50">
                    <tr>
                      <th className="px-4 py-3">Letter Details</th>
                      <th className="px-4 py-3">Delivery</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment/10">
                    {filteredLetters.map((l) => (
                      <tr key={l.id} className="hover:bg-ink-3/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-parchment">
                            To: <span className="text-gold">{l.recipientName}</span>
                          </div>
                          <div className="text-xs text-parchment/50">
                            From: {l.senderNickname} ({l.senderPhoneHashed})
                          </div>
                          {l.recipientPhone && (
                            <div className="text-[11px] text-parchment/40 font-mono">
                              Ph: {l.recipientPhone}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded px-2 py-0.5 text-xs font-mono bg-parchment/10 text-parchment/80">
                            {l.deliveryType}
                          </span>
                          {l.paymentStatus && (
                            <div className="text-[11px] text-parchment/50 mt-0.5">
                              Pay: {l.paymentStatus}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              l.moderationStatus === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : l.moderationStatus === 'REJECTED'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-gold/15 text-gold'
                            }`}
                          >
                            {l.moderationStatus}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-parchment/50">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLetter(l)}
                            className="rounded border border-parchment/15 bg-ink p-1.5 text-parchment/70 hover:text-parchment hover:border-gold transition-colors"
                            title="View Letter"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <a
                            href={adminService.getPrintPdfUrl(l.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded border border-parchment/15 bg-ink p-1.5 text-parchment/70 hover:text-gold hover:border-gold transition-colors"
                            title="Print Vintage PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </a>

                          {l.moderationStatus !== 'APPROVED' && (
                            <button
                              type="button"
                              disabled={actionInProgress === l.id}
                              onClick={() => handleApprove(l.id)}
                              className="rounded border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="Approve Letter"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          {l.moderationStatus !== 'REJECTED' && (
                            <button
                              type="button"
                              disabled={actionInProgress === l.id}
                              onClick={() => setRejectingId(l.id)}
                              className="rounded border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Reject Letter"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          {l.deliveryType === 'PHYSICAL' && l.moderationStatus === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={actionInProgress === l.id}
                              onClick={() => handleBookCourier(l.id)}
                              className="rounded border border-gold/30 bg-gold/10 p-1.5 text-gold hover:bg-gold/20 transition-colors"
                              title="Book Courier Dispatch"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: THEMES CMS */}
      {/* ===================================================================== */}
      {activeTab === 'themes' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-parchment">Letter Theme Assets</h2>
              <p className="text-xs text-parchment/60">
                Configure background paper textures, color palettes, seals, and pricing tiers.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingTheme({
                  id: '',
                  name: { en: '', bn: '' },
                  description: { en: '', bn: '' },
                  tier: 'FREE',
                  price: 0,
                  previewImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
                  palette: {
                    paperBg: '#faf4ea',
                    paperTexture: 'url(/textures/vintage-paper.jpg)',
                    ink: '#2b231d',
                    accent: '#8c2d19',
                    envelope: '#e8d9c5',
                    seal: '#b83b26',
                  },
                })
              }
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Theme
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-parchment/15 bg-ink-2/70 overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden bg-ink-3">
                  <img
                    src={t.previewImage}
                    alt={t.name.en}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        t.tier === 'PREMIUM'
                          ? 'bg-gold text-ink shadow-md'
                          : 'bg-emerald-500/80 text-white'
                      }`}
                    >
                      {t.tier === 'PREMIUM' ? `৳${t.price}` : 'FREE'}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: t.palette?.paperBg || '#faf4ea' }}
                      title="Paper"
                    />
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: t.palette?.ink || '#2b231d' }}
                      title="Ink"
                    />
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: t.palette?.accent || '#8c2d19' }}
                      title="Accent"
                    />
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: t.palette?.seal || '#b83b26' }}
                      title="Wax Seal"
                    />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-parchment text-base flex items-center justify-between">
                      <span>{t.name.en}</span>
                      <span className="text-xs text-gold/80 font-normal">{t.name.bn}</span>
                    </h3>
                    <p className="mt-1 text-xs text-parchment/60 line-clamp-2">
                      {t.description.en} • {t.description.bn}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-parchment/40">
                      ID: {t.id} {t.occasion ? `• ${t.occasion.en}` : ''}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-parchment/10 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTheme(t)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTheme(t.id)}
                      className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Theme"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: AUDIO TRACKS CMS */}
      {/* ===================================================================== */}
      {activeTab === 'audio' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-parchment">Atmospheric Audio Tracks</h2>
              <p className="text-xs text-parchment/60">
                Background musical ambiance, rain soundscapes, and acoustic melodies for letters.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingAudio({
                  id: '',
                  name: { en: '', bn: '' },
                  category: { en: 'Ambient', bn: 'আবহ' },
                  src: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
                  durationSeconds: 120,
                  isPremium: false,
                })
              }
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Audio Track
            </Button>
          </div>

          <div className="rounded-xl border border-parchment/15 bg-ink-2/60 overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-parchment">
              <thead className="border-b border-parchment/10 bg-ink-2/90 text-xs uppercase text-parchment/50">
                <tr>
                  <th className="px-4 py-3">Audio Track</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment/10">
                {audioTracks.map((a) => (
                  <tr key={a.id} className="hover:bg-ink-3/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(a)}
                          className={`rounded-full p-2 border transition-all ${
                            playingAudioId === a.id
                              ? 'bg-gold text-ink border-gold animate-pulse'
                              : 'bg-ink border-parchment/20 text-parchment hover:border-gold'
                          }`}
                        >
                          {playingAudioId === a.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <div>
                          <div className="font-semibold text-parchment">
                            {a.name.en} <span className="text-xs text-gold/80">({a.name.bn})</span>
                          </div>
                          <div className="text-[11px] font-mono text-parchment/40 truncate max-w-xs">
                            ID: {a.id} • {a.src}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-parchment/70">
                      {a.category.en} / {a.category.bn}
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono text-parchment/60">
                      {Math.floor(a.durationSeconds / 60)}:
                      {String(a.durationSeconds % 60).padStart(2, '0')} min
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          a.isPremium ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {a.isPremium ? 'PREMIUM' : 'FREE'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAudio(a)}
                        className="text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAudio(a.id)}
                        className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: FONTS & TYPOGRAPHY CMS */}
      {/* ===================================================================== */}
      {activeTab === 'fonts' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-parchment">Bengali & Latin Typography</h2>
              <p className="text-xs text-parchment/60">
                Manage web fonts, letter writing fonts (Kalpana UNICODE), SolaimanLipi, and custom typefaces.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingFont({
                  id: '',
                  name: '',
                  fontFamily: '',
                  category: 'bengali',
                  previewSample: 'চিঠির পাতায় একমুঠো স্মৃতি',
                  active: true,
                  displayOrder: fonts.length + 1,
                })
              }
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Font
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fonts.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-parchment/15 bg-ink-2/70 p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-parchment/10 pb-3">
                    <div>
                      <h3 className="font-semibold text-parchment text-base">{f.name}</h3>
                      <div className="text-[11px] font-mono text-parchment/40">
                        ID: {f.id} • Family: {f.fontFamily}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        f.category === 'bengali'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-cyan-500/15 text-cyan-300'
                      }`}
                    >
                      {f.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Live Render Preview */}
                  <div className="mt-4 rounded-xl bg-ink p-4 border border-parchment/10">
                    <div className="text-[10px] uppercase text-parchment/40 font-mono mb-1">
                      Render Sample:
                    </div>
                    <p
                      className="text-lg text-parchment leading-relaxed"
                      style={{ fontFamily: f.fontFamily }}
                    >
                      {f.previewSample || 'আমার প্রিয় মানুষটিকে লেখা এক টুকরো চিঠি...'}
                    </p>
                  </div>

                  {f.cssUrl && (
                    <div className="mt-2 text-[11px] text-parchment/40 truncate flex items-center gap-1">
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      <span>{f.cssUrl}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-parchment/10 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingFont(f)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFont(f.id)}
                    className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: DELIVERY OPTIONS CMS */}
      {/* ===================================================================== */}
      {activeTab === 'delivery' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-parchment">Delivery Channels & Pricing</h2>
              <p className="text-xs text-parchment/60">
                Digital web link, SMS Speed Post, and Physical vintage seal courier options.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingDelivery({
                  type: 'DIGITAL',
                  name: { en: '', bn: '' },
                  description: { en: '', bn: '' },
                  price: 0,
                  etaLabel: { en: 'Instant', bn: 'তাৎক্ষণিক' },
                  icon: 'link',
                })
              }
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Delivery Option
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deliveryOptions.map((d) => (
              <div
                key={d.type}
                className="rounded-2xl border border-parchment/15 bg-ink-2/70 p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-gold/15 px-2.5 py-1 text-xs font-mono font-bold text-gold">
                      {d.type}
                    </span>
                    <span className="text-lg font-bold text-parchment">৳{d.price}</span>
                  </div>

                  <h3 className="mt-3 font-semibold text-parchment text-base">
                    {d.name.en} <span className="text-xs text-gold/80">({d.name.bn})</span>
                  </h3>
                  <p className="mt-1 text-xs text-parchment/60">{d.description.en}</p>
                  <p className="mt-0.5 text-xs text-parchment/50">{d.description.bn}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-parchment/70 bg-ink p-2 rounded-lg">
                    <span>ETA:</span>
                    <span className="font-semibold text-gold">
                      {d.etaLabel.en} / {d.etaLabel.bn}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-parchment/10 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDelivery(d)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDelivery(d.type)}
                    className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: PRICING PLANS CMS */}
      {/* ===================================================================== */}
      {activeTab === 'pricing' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-parchment">Subscription & Letter Plans</h2>
              <p className="text-xs text-parchment/60">
                Edit tier pricing, perks, highlighted flags, and billing unit labels.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingPricing({
                  id: '',
                  name: { en: '', bn: '' },
                  tagline: { en: '', bn: '' },
                  price: 0,
                  billingUnit: { en: 'per letter', bn: 'প্রতি চিঠি' },
                  features: [],
                  highlighted: false,
                })
              }
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Pricing Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-6 shadow-xl flex flex-col justify-between ${
                  p.highlighted
                    ? 'border-gold bg-gradient-to-b from-gold/10 to-ink-2/90 shadow-gold/10'
                    : 'border-parchment/15 bg-ink-2/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-parchment">{p.name.en}</h3>
                    {p.highlighted && (
                      <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-ink">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gold/80 mt-0.5">{p.name.bn}</div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-parchment">৳{p.price}</span>
                    <span className="text-xs text-parchment/60">/ {p.billingUnit.en}</span>
                  </div>

                  <p className="mt-2 text-xs text-parchment/60">{p.tagline.en}</p>

                  <ul className="mt-4 space-y-2 border-t border-parchment/10 pt-3 text-xs text-parchment/80">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
                        <span>{f.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-parchment/10 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPricing(p)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeletePricing(p.id)}
                    className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: FAQ CMS */}
      {/* ===================================================================== */}
      {activeTab === 'faq' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-parchment">Frequently Asked Questions</h2>
              <p className="text-xs text-parchment/60">
                Help center entries displayed on the DakPion home and pricing pages.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingFaq({
                  id: `faq-${Date.now()}`,
                  question: { en: '', bn: '' },
                  answer: { en: '', bn: '' },
                })
              }
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add FAQ Item
            </Button>
          </div>

          <div className="space-y-4">
            {faqs.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-parchment/15 bg-ink-2/70 p-5 shadow-md flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="font-semibold text-parchment text-base">
                    {q.question.en}{' '}
                    <span className="text-sm text-gold/80 block mt-0.5">{q.question.bn}</span>
                  </div>
                  <div className="text-xs text-parchment/70 leading-relaxed border-t border-parchment/10 pt-2">
                    <p>{q.answer.en}</p>
                    <p className="mt-1 text-parchment/50 font-solaiman">{q.answer.bn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingFaq(q)}
                    className="text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(q.id)}
                    className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS */}
      {/* ===================================================================== */}

      {/* Theme Modal */}
      {editingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-parchment/20 bg-ink-2 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-parchment/10 pb-4">
              <h3 className="font-display text-lg text-parchment">
                {editingTheme.id ? `Edit Theme: ${editingTheme.id}` : 'Create New Theme'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTheme(null)}
                className="text-parchment/50 hover:text-parchment"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTheme(editingTheme);
              }}
              className="mt-4 space-y-4 text-xs text-parchment"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Theme ID (slug)</label>
                  <input
                    type="text"
                    required
                    value={editingTheme.id || ''}
                    onChange={(e) => setEditingTheme({ ...editingTheme, id: e.target.value })}
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none focus:border-gold"
                    placeholder="e.g. vintage-parchment"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-parchment/70">Tier & Price (BDT)</label>
                  <div className="flex gap-2">
                    <select
                      value={editingTheme.tier || 'FREE'}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          tier: e.target.value as 'FREE' | 'PREMIUM',
                        })
                      }
                      className="rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                    <input
                      type="number"
                      value={editingTheme.price || 0}
                      onChange={(e) =>
                        setEditingTheme({ ...editingTheme, price: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingTheme.name?.en || ''}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        name: { en: e.target.value, bn: editingTheme.name?.bn || '' },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-parchment/70">Name (Bengali - বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={editingTheme.name?.bn || ''}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        name: { en: editingTheme.name?.en || '', bn: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Preview Image URL</label>
                <input
                  type="text"
                  value={editingTheme.previewImage || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, previewImage: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none focus:border-gold"
                />
              </div>

              {/* Palette */}
              <div className="border border-parchment/10 rounded-xl p-3 bg-ink/50 space-y-2">
                <div className="font-semibold text-gold text-xs">Palette Colors:</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-parchment/60">Paper Bg:</span>
                    <input
                      type="text"
                      value={editingTheme.palette?.paperBg || '#faf4ea'}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          palette: {
                            paperBg: e.target.value,
                            paperTexture: editingTheme.palette?.paperTexture || '',
                            ink: editingTheme.palette?.ink || '#2b231d',
                            accent: editingTheme.palette?.accent || '#8c2d19',
                            envelope: editingTheme.palette?.envelope || '#e8d9c5',
                            seal: editingTheme.palette?.seal || '#b83b26',
                          },
                        })
                      }
                      className="w-full rounded border border-parchment/20 bg-ink p-1 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-parchment/60">Ink Color:</span>
                    <input
                      type="text"
                      value={editingTheme.palette?.ink || '#2b231d'}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          palette: {
                            paperBg: editingTheme.palette?.paperBg || '#faf4ea',
                            paperTexture: editingTheme.palette?.paperTexture || '',
                            ink: e.target.value,
                            accent: editingTheme.palette?.accent || '#8c2d19',
                            envelope: editingTheme.palette?.envelope || '#e8d9c5',
                            seal: editingTheme.palette?.seal || '#b83b26',
                          },
                        })
                      }
                      className="w-full rounded border border-parchment/20 bg-ink p-1 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-parchment/60">Wax Seal:</span>
                    <input
                      type="text"
                      value={editingTheme.palette?.seal || '#b83b26'}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          palette: {
                            paperBg: editingTheme.palette?.paperBg || '#faf4ea',
                            paperTexture: editingTheme.palette?.paperTexture || '',
                            ink: editingTheme.palette?.ink || '#2b231d',
                            accent: editingTheme.palette?.accent || '#8c2d19',
                            envelope: editingTheme.palette?.envelope || '#e8d9c5',
                            seal: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded border border-parchment/20 bg-ink p-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingTheme(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Save className="h-4 w-4 mr-1" /> Save Theme
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audio Modal */}
      {editingAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-parchment/20 bg-ink-2 p-6 shadow-2xl">
            <h3 className="font-display text-lg text-parchment">
              {editingAudio.id ? `Edit Track: ${editingAudio.id}` : 'Create Audio Track'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAudio(editingAudio);
              }}
              className="mt-4 space-y-3 text-xs text-parchment"
            >
              <div>
                <label className="block mb-1 text-parchment/70">Audio ID (slug)</label>
                <input
                  type="text"
                  required
                  value={editingAudio.id || ''}
                  onChange={(e) => setEditingAudio({ ...editingAudio, id: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment outline-none"
                  placeholder="e.g. monsoon-rain"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingAudio.name?.en || ''}
                    onChange={(e) =>
                      setEditingAudio({
                        ...editingAudio,
                        name: { en: e.target.value, bn: editingAudio.name?.bn || '' },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-parchment/70">Name (BN)</label>
                  <input
                    type="text"
                    required
                    value={editingAudio.name?.bn || ''}
                    onChange={(e) =>
                      setEditingAudio({
                        ...editingAudio,
                        name: { en: editingAudio.name?.en || '', bn: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Audio Source URL (.mp3)</label>
                <input
                  type="text"
                  required
                  value={editingAudio.src || ''}
                  onChange={(e) => setEditingAudio({ ...editingAudio, src: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Duration (seconds)</label>
                  <input
                    type="number"
                    value={editingAudio.durationSeconds || 120}
                    onChange={(e) =>
                      setEditingAudio({ ...editingAudio, durationSeconds: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="audioPrem"
                    checked={editingAudio.isPremium || false}
                    onChange={(e) =>
                      setEditingAudio({ ...editingAudio, isPremium: e.target.checked })
                    }
                    className="rounded border-parchment/20"
                  />
                  <label htmlFor="audioPrem" className="text-parchment/90">
                    Premium Track
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingAudio(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Save className="h-4 w-4 mr-1" /> Save Audio Track
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Font Modal */}
      {editingFont && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-parchment/20 bg-ink-2 p-6 shadow-2xl">
            <h3 className="font-display text-lg text-parchment">
              {editingFont.id ? `Edit Font: ${editingFont.id}` : 'Add New Typography Font'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveFont(editingFont);
              }}
              className="mt-4 space-y-3 text-xs text-parchment"
            >
              <div>
                <label className="block mb-1 text-parchment/70">Font ID (e.g. kalpana-unicode)</label>
                <input
                  type="text"
                  required
                  value={editingFont.id || ''}
                  onChange={(e) => setEditingFont({ ...editingFont, id: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Font Display Name</label>
                <input
                  type="text"
                  required
                  value={editingFont.name || ''}
                  onChange={(e) => setEditingFont({ ...editingFont, name: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  placeholder="e.g. Kalpana UNICODE (কল্পনা ইউনিকোড)"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">CSS Font Family Name</label>
                <input
                  type="text"
                  required
                  value={editingFont.fontFamily || ''}
                  onChange={(e) => setEditingFont({ ...editingFont, fontFamily: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2 font-mono"
                  placeholder="e.g. 'Kalpana', 'Kalpana UNICODE', serif"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Google Font / Web CSS URL (Optional)</label>
                <input
                  type="text"
                  value={editingFont.cssUrl || ''}
                  onChange={(e) => setEditingFont({ ...editingFont, cssUrl: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Preview Sample Text</label>
                <input
                  type="text"
                  value={editingFont.previewSample || ''}
                  onChange={(e) => setEditingFont({ ...editingFont, previewSample: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingFont(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Save className="h-4 w-4 mr-1" /> Save Font
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Option Modal */}
      {editingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-parchment/20 bg-ink-2 p-6 shadow-2xl">
            <h3 className="font-display text-lg text-parchment">Edit Delivery Option</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveDelivery(editingDelivery);
              }}
              className="mt-4 space-y-3 text-xs text-parchment"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Type</label>
                  <select
                    value={editingDelivery.type || 'DIGITAL'}
                    onChange={(e) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2 text-parchment"
                  >
                    <option value="DIGITAL">DIGITAL</option>
                    <option value="SMS_SPEED_POST">SMS_SPEED_POST</option>
                    <option value="PHYSICAL">PHYSICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-parchment/70">Price (BDT)</label>
                  <input
                    type="number"
                    value={editingDelivery.price || 0}
                    onChange={(e) =>
                      setEditingDelivery({ ...editingDelivery, price: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingDelivery.name?.en || ''}
                    onChange={(e) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        name: { en: e.target.value, bn: editingDelivery.name?.bn || '' },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-parchment/70">Name (BN)</label>
                  <input
                    type="text"
                    required
                    value={editingDelivery.name?.bn || ''}
                    onChange={(e) =>
                      setEditingDelivery({
                        ...editingDelivery,
                        name: { en: editingDelivery.name?.en || '', bn: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingDelivery(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Save className="h-4 w-4 mr-1" /> Save Delivery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Plan Modal */}
      {editingPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-parchment/20 bg-ink-2 p-6 shadow-2xl">
            <h3 className="font-display text-lg text-parchment">Edit Pricing Plan</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSavePricing(editingPricing);
              }}
              className="mt-4 space-y-3 text-xs text-parchment"
            >
              <div>
                <label className="block mb-1 text-parchment/70">Plan ID</label>
                <input
                  type="text"
                  required
                  value={editingPricing.id || ''}
                  onChange={(e) => setEditingPricing({ ...editingPricing, id: e.target.value })}
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-parchment/70">Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingPricing.name?.en || ''}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        name: { en: e.target.value, bn: editingPricing.name?.bn || '' },
                      })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-parchment/70">Price (BDT)</label>
                  <input
                    type="number"
                    value={editingPricing.price || 0}
                    onChange={(e) =>
                      setEditingPricing({ ...editingPricing, price: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="planHighlight"
                  checked={editingPricing.highlighted || false}
                  onChange={(e) =>
                    setEditingPricing({ ...editingPricing, highlighted: e.target.checked })
                  }
                />
                <label htmlFor="planHighlight">Highlighted / Popular Badge</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingPricing(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Save className="h-4 w-4 mr-1" /> Save Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-parchment/20 bg-ink-2 p-6 shadow-2xl">
            <h3 className="font-display text-lg text-parchment">Edit FAQ Item</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveFaq(editingFaq);
              }}
              className="mt-4 space-y-3 text-xs text-parchment"
            >
              <div>
                <label className="block mb-1 text-parchment/70">Question (English)</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question?.en || ''}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      question: { en: e.target.value, bn: editingFaq.question?.bn || '' },
                    })
                  }
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Question (Bengali - বাংলা)</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question?.bn || ''}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      question: { en: editingFaq.question?.en || '', bn: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Answer (English)</label>
                <textarea
                  rows={3}
                  required
                  value={editingFaq.answer?.en || ''}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      answer: { en: e.target.value, bn: editingFaq.answer?.bn || '' },
                    })
                  }
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div>
                <label className="block mb-1 text-parchment/70">Answer (Bengali - বাংলা)</label>
                <textarea
                  rows={3}
                  required
                  value={editingFaq.answer?.bn || ''}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      answer: { en: editingFaq.answer?.en || '', bn: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-parchment/20 bg-ink p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingFaq(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Save className="h-4 w-4 mr-1" /> Save FAQ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-ink-2 p-6 shadow-2xl">
            <h3 className="text-lg font-display text-parchment flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-400" />
              Reject Letter
            </h3>
            <p className="mt-2 text-sm text-parchment/60">
              Provide a reason for rejecting this letter.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Inappropriate language, spam, or privacy violation"
              className="mt-4 w-full rounded-lg border border-parchment/15 bg-ink p-3 text-sm text-parchment outline-none focus:border-rose-400"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-rose-600 hover:!bg-rose-700 text-white"
                onClick={handleRejectConfirm}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Letter View Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-parchment/20 bg-ink-2 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-parchment/10 pb-4">
              <div>
                <h3 className="font-display text-xl text-parchment">
                  Letter to {selectedLetter.recipientName}
                </h3>
                <p className="text-xs text-parchment/50">
                  From: {selectedLetter.senderNickname} • Created:{' '}
                  {new Date(selectedLetter.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLetter(null)}
                className="text-parchment/50 hover:text-parchment text-lg"
              >
                ✕
              </button>
            </div>

            {/* Letter Content preview */}
            <div
              className="mt-6 rounded-xl bg-parchment p-6 text-charcoal font-serif prose max-w-none shadow-inner min-h-[160px] font-letter"
              dangerouslySetInnerHTML={{ __html: selectedLetter.content }}
            />

            {/* Delivery & Address */}
            {selectedLetter.shippingAddress && (
              <div className="mt-4 rounded-lg bg-ink p-3 text-xs text-parchment/70 space-y-1">
                <div className="font-semibold text-gold">Physical Shipping Address:</div>
                <div>{selectedLetter.shippingAddress.fullAddress}</div>
                <div>
                  {selectedLetter.shippingAddress.city} - {selectedLetter.shippingAddress.postalCode}
                </div>
                <div>Contact: {selectedLetter.shippingAddress.phone}</div>
              </div>
            )}

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-parchment/10">
              <a
                href={adminService.getPrintPdfUrl(selectedLetter.id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 font-medium"
              >
                <FileText className="h-3.5 w-3.5" />
                Generate Vintage PDF
              </a>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedLetter(null)}>
                  Close
                </Button>
                {selectedLetter.moderationStatus !== 'APPROVED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedLetter.id)}
                  >
                    Approve Letter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
