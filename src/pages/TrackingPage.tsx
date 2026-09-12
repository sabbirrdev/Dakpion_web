import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, Stamp, AlertCircle } from 'lucide-react';
import { trackingService } from '../services/trackingService';
import { Button } from '../components/shared/Button';
import type { PublicTrackingInfo } from '../types';

export function TrackingPage() {
  const { trackingCode: routeCode } = useParams<{ trackingCode?: string }>();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const initialCode = routeCode || searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<PublicTrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (trackCode: string) => {
    if (!trackCode.trim()) return;
    setLoading(true);
    setError(null);
    const res = await trackingService.getTrackingDetails(trackCode.trim());
    setLoading(false);
    if (!res.success) {
      setTrackingInfo(null);
      setError(
        res.code === 'NOT_FOUND'
          ? (isBn ? 'এই ট্র্যাকিং কোডের কোনো চিঠি পাওয়া যায়নি।' : 'No physical letter found with this tracking code.')
          : (res.message || (isBn ? 'ট্র্যাকিং তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load tracking details.')),
      );
      return;
    }
    setTrackingInfo(res.data);
  };

  useEffect(() => {
    if (initialCode) {
      fetchTracking(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(code);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { en: string; bn: string }> = {
      SUBMITTED: { en: 'Letter Submitted', bn: 'চিঠি জমা দেওয়া হয়েছে' },
      MODERATION_APPROVED: { en: 'Moderation Approved', bn: 'অনুমোদিত হয়েছে' },
      MODERATION_REJECTED: { en: 'Moderation Rejected', bn: 'চিঠি বাতিল হয়েছে' },
      PRINTING: { en: 'Parchment Printing', bn: 'ভিন্টেজ কাগজে প্রিন্ট হচ্ছে' },
      SEALED: { en: 'Wax Sealed', bn: 'গালা দিয়ে সিলমোহরকৃত' },
      HANDED_TO_COURIER: { en: 'Handed to Courier', bn: 'কুরিয়ারে হস্তান্তর করা হয়েছে' },
      IN_TRANSIT: { en: 'In Transit', bn: 'গন্তব্যের পথে রয়েছে' },
      OUT_FOR_DELIVERY: { en: 'Out for Delivery', bn: 'ডেলিভারির জন্য বের হয়েছে' },
      DELIVERED: { en: 'Delivered', bn: 'সফলভাবে পৌঁছে দেওয়া হয়েছে' },
      DELIVERY_FAILED: { en: 'Delivery Attempt Failed', bn: 'ডেলিভারি ব্যর্থ হয়েছে' },
      RETURNED: { en: 'Returned', bn: 'ফেরত পাঠানো হয়েছে' },
    };
    return map[status]?.[isBn ? 'bn' : 'en'] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'HANDED_TO_COURIER':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return <Truck className="h-5 w-5 text-amber-600" />;
      case 'SEALED':
      case 'PRINTING':
        return <Stamp className="h-5 w-5 text-seal" />;
      default:
        return <Clock className="h-5 w-5 text-charcoal/50" />;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-medium text-charcoal">
            <Package className="h-3.5 w-3.5 text-seal" />
            {isBn ? 'ফিজিক্যাল ডাকপিওন ট্র্যাকিং' : 'Physical DakPion Letter Tracking'}
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-charcoal font-bold tracking-tight">
            {isBn ? 'চিঠির বর্তমান অবস্থান ট্র্যাক করুন' : 'Track Your Handcrafted Letter'}
          </h1>
          <p className="mt-2 text-sm text-charcoal/70 max-w-md mx-auto">
            {isBn
              ? 'আপনার মোমরঙে সিলমোহর করা ফিজিক্যাল চিঠির বর্তমান অবস্থা এবং কুরিয়ার ডেলিভারি টাইমলাইন দেখুন।'
              : 'Follow the journey of your wax-sealed, physical parcel delivery from printing to doorstep.'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={isBn ? 'ট্র্যাকিং কোড লিখুন (যেমন: DP-7F3K9Q)' : 'Enter tracking code (e.g. DP-7F3K9Q)'}
              className="w-full rounded-xl border border-charcoal/20 bg-white pl-10 pr-4 py-3 text-sm tracking-wider font-mono uppercase outline-none focus:border-seal focus:ring-1 focus:ring-seal"
            />
          </div>
          <Button type="submit" loading={loading} disabled={!code.trim()}>
            {isBn ? 'অনুসন্ধান করুন' : 'Track Status'}
          </Button>
        </form>

        {/* Privacy Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-charcoal/55">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            {isBn
              ? 'গোপনীয়তার নিশ্চয়তা: প্রেরক বা প্রাপকের ব্যক্তিগত তথ্য এখানে সম্পূর্ণ সুরক্ষিত।'
              : 'Privacy Guaranteed: Sender, recipient identity & letter content are strictly confidential.'}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Tracking Details */}
        <AnimatePresence>
          {trackingInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 rounded-2xl border border-charcoal/15 bg-white p-6 sm:p-8 shadow-md relative overflow-hidden"
            >
              {/* Postal Stamp Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-charcoal/50 font-medium">
                    {isBn ? 'ট্র্যাকিং নম্বর' : 'Tracking Code'}
                  </span>
                  <p className="font-mono text-xl font-bold text-charcoal">{trackingInfo.trackingCode}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-charcoal/50 font-medium">
                    {isBn ? 'বর্তমান অবস্থা' : 'Current Status'}
                  </span>
                  <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    {getStatusLabel(trackingInfo.currentStatus)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-charcoal/60 mb-6">
                  {isBn ? 'ডেলিভারি পরিক্রমা' : 'Delivery Milestones'}
                </h3>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-charcoal/15">
                  {trackingInfo.events && trackingInfo.events.length > 0 ? (
                    trackingInfo.events.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[27px] top-0.5 rounded-full bg-white p-0.5 border border-charcoal/20">
                          {getStatusIcon(event.status)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-charcoal">
                              {getStatusLabel(event.status)}
                            </h4>
                            <time className="text-xs text-charcoal/50 font-mono">
                              {new Date(event.occurredAt).toLocaleString(isBn ? 'bn-BD' : 'en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </time>
                          </div>
                          {event.note && (
                            <p className="mt-1 text-xs text-charcoal/70 leading-relaxed">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-charcoal/50">
                      {isBn ? 'কোনো টাইমলাইন ইভেন্ট পাওয়া যায়নি।' : 'No timeline events recorded yet.'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
