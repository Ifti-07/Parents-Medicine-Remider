'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getDhakaDateParts,
  formatTimeBengali,
  formatDateTimeBengali,
  CORTISOL_SCHEDULE,
  isActiveWindow,
} from '@/lib/scheduling';
import { IMedicine, IMedicineRecord } from '@/types';
import { saveOfflineRecord } from '@/lib/indexeddb';

interface CortisolCardProps {
  medicine: IMedicine;
  todayRecords: IMedicineRecord[];
  onDoseGiven: () => void;
}

export default function CortisolCard({ medicine, todayRecords, onDoseGiven }: CortisolCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [activeWindow, setActiveWindow] = useState(true);

  const updateTime = useCallback(() => {
    const parts = getDhakaDateParts();
    setCurrentHour(parts.hour);
    setCurrentMinute(parts.minute);
    setActiveWindow(isActiveWindow());
  }, []);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [updateTime]);

  // Find the most recent record for this medicine today
  const lastRecord = todayRecords
    .filter((r) => r.medicineId === medicine._id)
    .sort((a, b) => new Date(b.actualGivenTime).getTime() - new Date(a.actualGivenTime).getTime())[0];

  // Determine which scheduled hours have been given today
  const givenHours = new Set(
    todayRecords
      .filter((r) => r.medicineId === medicine._id)
      .map((r) => {
        const d = new Date(r.scheduledTime);
        const fmt = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          hour12: false,
        });
        const parts = fmt.formatToParts(d);
        return parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
      })
  );

  // Find next upcoming scheduled hour
  const getNextHour = (): number | null => {
    if (!activeWindow) return null;
    for (const h of CORTISOL_SCHEDULE) {
      if (!givenHours.has(h)) {
        if (h > currentHour || (h === currentHour && currentMinute <= 30)) {
          return h;
        }
      }
    }
    return null;
  };

  // Find current due hour (scheduled in last 2 hours and not given)
  const getCurrentDue = (): number | null => {
    if (!activeWindow) return null;
    for (const h of CORTISOL_SCHEDULE) {
      if (!givenHours.has(h)) {
        if (h <= currentHour && (currentHour - h < 2 || (currentHour - h === 1 && currentMinute < 30))) {
          return h;
        }
      }
    }
    return null;
  };

  const nextHour = getNextHour();
  const currentDue = getCurrentDue();
  const isDue = currentDue !== null;

  const handleGiveDose = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const now = new Date();
      const parts = getDhakaDateParts();
      const scheduledHour = currentDue ?? nextHour ?? currentHour;

      // Build scheduled time (today at scheduledHour in Dhaka = UTC scheduledHour-6)
      const scheduledDate = new Date(Date.UTC(
        parts.year, parts.month - 1, parts.day,
        scheduledHour - 6, 0, 0, 0
      ));

      const clientRecordId = `${medicine._id}-${scheduledHour}-${parts.dateString}-${Date.now()}`;

      const recordData = {
        medicineId: medicine._id,
        medicineNameEn: medicine.nameEn,
        medicineNameBn: medicine.nameBn,
        scheduledTime: scheduledDate.toISOString(),
        actualGivenTime: now.toISOString(),
        date: parts.dateString,
        clientRecordId,
      };

      try {
        const response = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recordData),
        });

        if (!response.ok && response.status !== 409) {
          throw new Error('Server error');
        }
      } catch {
        // Save offline if network fails
        await saveOfflineRecord({
          id: clientRecordId,
          ...recordData,
          synced: false,
          createdAt: now.toISOString(),
        });
      }

      onDoseGiven();
    } finally {
      setIsLoading(false);
    }
  };

  const totalDoses = CORTISOL_SCHEDULE.length;
  const givenCount = givenHours.size;
  const progressText = `${givenCount}/${totalDoses}`;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-slate-50 border-b-2 border-slate-100 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cortisol</h2>
          <p className="text-lg text-slate-600 mt-0.5">কর্টিসল</p>
        </div>
        <div className="text-right">
          <Badge variant={givenCount === totalDoses ? 'success' : 'info'} className="text-sm">
            আজ: {progressText}
          </Badge>
          <p className="text-sm text-slate-500 mt-1">প্রতি ২ ঘণ্টা</p>
        </div>
      </div>

      {/* Medicine Image + Info */}
      <div className="px-5 py-5 flex items-start gap-4">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
          <Image
            src={medicine.image}
            alt="কর্টিসল আই ড্রপস"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-slate-500">মাত্রা</span>
            <span className="text-lg font-bold text-slate-900">{medicine.doseBn}</span>
          </div>

          {/* Status */}
          {!activeWindow ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={18} aria-hidden="true" />
              <span className="text-base">রাতের বিশ্রাম</span>
            </div>
          ) : isDue ? (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle size={18} aria-hidden="true" />
              <span className="text-base font-semibold">
                এখন দেওয়ার সময়: {formatTimeBengali(currentDue!)}
              </span>
            </div>
          ) : nextHour !== null ? (
            <div className="flex items-center gap-2 text-blue-600">
              <Clock size={18} aria-hidden="true" />
              <span className="text-base">
                পরবর্তী: {formatTimeBengali(nextHour)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span className="text-base font-semibold">আজকের সব ডোজ সম্পন্ন</span>
            </div>
          )}

          {/* Last given */}
          {lastRecord && (
            <p className="text-sm text-slate-400 mt-2">
              শেষ দেওয়া: {formatDateTimeBengali(lastRecord.actualGivenTime)}
            </p>
          )}
        </div>
      </div>

      {/* Schedule strip */}
      <div className="px-5 pb-3">
        <p className="text-sm font-medium text-slate-500 mb-2">আজকের সময়সূচি</p>
        <div className="flex flex-wrap gap-2">
          {CORTISOL_SCHEDULE.map((h) => {
            const isGiven = givenHours.has(h);
            const isCurrent = h === currentDue;
            return (
              <span
                key={h}
                className={`
                  inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium
                  ${isGiven
                    ? 'bg-green-100 text-green-800 line-through decoration-green-500'
                    : isCurrent
                    ? 'bg-amber-100 text-amber-800 font-bold ring-2 ring-amber-400'
                    : 'bg-slate-100 text-slate-600'
                  }
                `}
                aria-label={`${formatTimeBengali(h)} ${isGiven ? '- দেওয়া হয়েছে' : isCurrent ? '- এখন' : '- বাকি'}`}
              >
                {formatTimeBengali(h)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Give Dose Button */}
      <div className="px-5 pb-5">
        <Button
          onClick={handleGiveDose}
          disabled={isLoading || (!isDue && nextHour === null && activeWindow) || !activeWindow}
          variant={isDue ? 'success' : 'primary'}
          className="w-full h-16 text-xl font-bold"
          aria-label={`কর্টিসল দিয়েছি${isDue ? ` - ${formatTimeBengali(currentDue!)} এর ডোজ` : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              সংরক্ষণ হচ্ছে...
            </span>
          ) : !activeWindow ? (
            '🌙 রাতের বিশ্রাম'
          ) : (
            <>
              <CheckCircle2 size={24} aria-hidden="true" />
              দিয়েছি
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
