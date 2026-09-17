'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import CortisolCard from '@/components/medicine/CortisolCard';
import FourHourContainer from '@/components/medicine/FourHourContainer';
import NextMedicineSection from '@/components/medicine/NextMedicineSection';
import LastGivenSection from '@/components/medicine/LastGivenSection';
import { IMedicine, IMedicineRecord } from '@/types';
import { getDhakaDate, getDhakaDateParts, isActiveWindow } from '@/lib/scheduling';
import { syncOfflineRecords } from '@/lib/indexeddb';

export default function HomePage() {
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [todayRecords, setTodayRecords] = useState<IMedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [medRes, recRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch(`/api/records?date=${getDhakaDate()}`),
      ]);

      if (medRes.ok) {
        const medData = await medRes.json();
        if (medData.success) setMedicines(medData.data);
      }

      if (recRes.ok) {
        const recData = await recRes.json();
        if (recData.success) setTodayRecords(recData.data);
      }

      setError(null);
    } catch {
      setError('ডেটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Try to sync offline records when online
    const handleOnline = async () => {
      try {
        const synced = await syncOfflineRecords();
        if (synced > 0) {
          fetchData(); // Refresh data after sync
        }
      } catch {
        // Ignore sync errors silently
      }
    };

    window.addEventListener('online', handleOnline);

    // Attempt sync on load too
    if (navigator.onLine) {
      handleOnline();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [fetchData]);

  const handleDoseGiven = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const cortisolMedicine = medicines.find((m) => m.group === 'cortisol');
  const nclMedicine = medicines.find((m) => m.group === 'four-hour' && m.order === 1);
  const moxibacMedicine = medicines.find((m) => m.group === 'four-hour' && m.order === 2);

  const parts = getDhakaDateParts();
  const activeWindow = isActiveWindow();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-lg text-slate-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {error && (
          <div
            className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-4"
            role="alert"
            aria-live="polite"
          >
            <p className="text-base font-semibold text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-base text-red-600 underline font-medium"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Next Medicine Section */}
        <NextMedicineSection
          medicines={medicines}
          todayRecords={todayRecords}
          currentHour={parts.hour}
          currentMinute={parts.minute}
          isActiveWindow={activeWindow}
        />

        {/* Section Title */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">আজকের ওষুধ</h2>

          <div className="space-y-5">
            {/* Cortisol Card */}
            {cortisolMedicine ? (
              <CortisolCard
                medicine={cortisolMedicine}
                todayRecords={todayRecords}
                onDoseGiven={handleDoseGiven}
              />
            ) : (
              <div className="bg-slate-100 rounded-2xl p-6 text-center">
                <p className="text-slate-500 text-base">কর্টিসলের তথ্য পাওয়া যাচ্ছে না।</p>
              </div>
            )}

            {/* 4-Hour Container */}
            {nclMedicine && moxibacMedicine ? (
              <FourHourContainer
                nclMedicine={nclMedicine}
                moxibacMedicine={moxibacMedicine}
                todayRecords={todayRecords}
                onDoseGiven={handleDoseGiven}
              />
            ) : (
              <div className="bg-slate-100 rounded-2xl p-6 text-center">
                <p className="text-slate-500 text-base">৪ ঘণ্টার ওষুধের তথ্য পাওয়া যাচ্ছে না।</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Given Section */}
        <LastGivenSection records={todayRecords} />

        {/* Offline indicator */}
        {typeof window !== 'undefined' && !navigator.onLine && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-amber-700 font-medium">
              📴 অফলাইনে কাজ করছে। ইন্টারনেট পেলে স্বয়ংক্রিয়ভাবে সংরক্ষণ হবে।
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
