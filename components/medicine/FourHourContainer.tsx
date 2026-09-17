'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getDhakaDateParts,
  formatTimeBengali,
  formatDateTimeBengali,
  FOUR_HOUR_SCHEDULE,
  isActiveWindow,
} from '@/lib/scheduling';
import { IMedicine, IMedicineRecord } from '@/types';
import { saveOfflineRecord } from '@/lib/indexeddb';

interface FourHourContainerProps {
  nclMedicine: IMedicine;
  moxibacMedicine: IMedicine;
  todayRecords: IMedicineRecord[];
  onDoseGiven: () => void;
}

type MedicineStatus = 'given' | 'due' | 'upcoming' | 'done-today' | 'inactive';

export default function FourHourContainer({
  nclMedicine,
  moxibacMedicine,
  todayRecords,
  onDoseGiven,
}: FourHourContainerProps) {
  const [loadingNcl, setLoadingNcl] = useState(false);
  const [loadingMoxibac, setLoadingMoxibac] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [activeWindow, setActiveWindow] = useState(true);
  const [showInstruction, setShowInstruction] = useState(false);

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

  // Get given hours for a specific medicine
  const getGivenHours = (medicineId: string): Set<number> => {
    return new Set(
      todayRecords
        .filter((r) => r.medicineId === medicineId)
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
  };

  const nclGivenHours = getGivenHours(nclMedicine._id);
  const moxibacGivenHours = getGivenHours(moxibacMedicine._id);

  // Determine current due hour for 4-hour schedule
  const getCurrentDueHour = (): number | null => {
    if (!activeWindow) return null;
    for (const h of FOUR_HOUR_SCHEDULE) {
      if (h <= currentHour && (currentHour - h < 4)) {
        // This slot is "current" if we're within 4 hours of it and it's the latest past slot
        const nextH = FOUR_HOUR_SCHEDULE[FOUR_HOUR_SCHEDULE.indexOf(h) + 1];
        if (!nextH || currentHour < nextH) {
          return h;
        }
      }
    }
    return null;
  };

  const getNextHour = (): number | null => {
    if (!activeWindow) return null;
    for (const h of FOUR_HOUR_SCHEDULE) {
      if (h > currentHour || (h === currentHour && currentMinute <= 30)) {
        return h;
      }
    }
    return null;
  };

  const currentDueHour = getCurrentDueHour();
  const nextHour = getNextHour();

  // Status for NCL
  const getNclStatus = (): MedicineStatus => {
    if (!activeWindow) return 'inactive';
    if (currentDueHour !== null && nclGivenHours.has(currentDueHour)) return 'given';
    if (currentDueHour !== null && !nclGivenHours.has(currentDueHour)) return 'due';
    if (nextHour !== null) return 'upcoming';
    // Check if all doses done
    const allDone = FOUR_HOUR_SCHEDULE.every(
      (h) => h > currentHour || nclGivenHours.has(h)
    );
    if (allDone) return 'done-today';
    return 'upcoming';
  };

  // Status for Moxibac - depends on NCL being given first
  const getMoxibacStatus = (): MedicineStatus => {
    if (!activeWindow) return 'inactive';
    if (currentDueHour !== null && moxibacGivenHours.has(currentDueHour)) return 'given';
    // Moxibac is due only after NCL is given
    if (currentDueHour !== null && nclGivenHours.has(currentDueHour) && !moxibacGivenHours.has(currentDueHour)) return 'due';
    if (currentDueHour !== null && !nclGivenHours.has(currentDueHour)) return 'upcoming'; // NCL not yet given
    if (nextHour !== null) return 'upcoming';
    const allDone = FOUR_HOUR_SCHEDULE.every(
      (h) => h > currentHour || moxibacGivenHours.has(h)
    );
    if (allDone) return 'done-today';
    return 'upcoming';
  };

  const nclStatus = getNclStatus();
  const moxibacStatus = getMoxibacStatus();

  const handleGiveDose = async (medicine: IMedicine, setter: (v: boolean) => void) => {
    setter(true);

    try {
      const now = new Date();
      const parts = getDhakaDateParts();
      const scheduledHour = currentDueHour ?? nextHour ?? currentHour;

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
        await saveOfflineRecord({
          id: clientRecordId,
          ...recordData,
          synced: false,
          createdAt: now.toISOString(),
        });
      }

      // If NCL was just given, show instruction
      if (medicine._id === nclMedicine._id) {
        setShowInstruction(true);
        setTimeout(() => setShowInstruction(false), 30000); // Hide after 30s
      }

      onDoseGiven();
    } finally {
      setter(false);
    }
  };

  const totalDoses = FOUR_HOUR_SCHEDULE.length;
  const nclGiven = nclGivenHours.size;
  const moxibacGiven = moxibacGivenHours.size;

  // Last given records
  const nclLastRecord = todayRecords
    .filter((r) => r.medicineId === nclMedicine._id)
    .sort((a, b) => new Date(b.actualGivenTime).getTime() - new Date(a.actualGivenTime).getTime())[0];
  const moxibacLastRecord = todayRecords
    .filter((r) => r.medicineId === moxibacMedicine._id)
    .sort((a, b) => new Date(b.actualGivenTime).getTime() - new Date(a.actualGivenTime).getTime())[0];

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
      {/* Container Header */}
      <div className="bg-blue-50 border-b-2 border-blue-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">৪ ঘণ্টার ওষুধ</h2>
            <p className="text-base text-slate-600 mt-0.5">একসাথে দুটি ওষুধ</p>
          </div>
          <div className="text-right">
            {currentDueHour !== null ? (
              <Badge variant="warning" className="text-sm">
                এখন: {formatTimeBengali(currentDueHour)}
              </Badge>
            ) : nextHour !== null ? (
              <Badge variant="info" className="text-sm">
                পরবর্তী: {formatTimeBengali(nextHour)}
              </Badge>
            ) : activeWindow ? (
              <Badge variant="success" className="text-sm">সম্পন্ন</Badge>
            ) : (
              <Badge variant="secondary" className="text-sm">বিশ্রাম</Badge>
            )}
          </div>
        </div>

        {/* Schedule strip */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {FOUR_HOUR_SCHEDULE.map((h) => {
            const nclDone = nclGivenHours.has(h);
            const moxDone = moxibacGivenHours.has(h);
            const bothDone = nclDone && moxDone;
            const isCurrent = h === currentDueHour;
            return (
              <span
                key={h}
                className={`
                  inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium
                  ${bothDone
                    ? 'bg-green-100 text-green-800 line-through'
                    : isCurrent
                    ? 'bg-amber-100 text-amber-800 font-bold ring-2 ring-amber-400'
                    : 'bg-white text-slate-600 border border-slate-200'
                  }
                `}
              >
                {formatTimeBengali(h)}
              </span>
            );
          })}
        </div>
      </div>

      {/* NCL Section */}
      <MedicineRow
        medicine={nclMedicine}
        imageAlt="এনসিএল আই ড্রপস"
        status={nclStatus}
        givenCount={nclGiven}
        totalCount={totalDoses}
        lastRecord={nclLastRecord}
        isLoading={loadingNcl}
        onGive={() => handleGiveDose(nclMedicine, setLoadingNcl)}
        order={1}
      />

      {/* NCL Given Instruction */}
      {showInstruction && (
        <div className="mx-5 mb-3 flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <Info size={22} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-base font-semibold text-amber-800 leading-snug">
            {nclMedicine.instructionBn}
          </p>
        </div>
      )}

      {/* Divider with instruction hint */}
      <div className="px-5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs font-medium text-slate-400 px-2">তারপর</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>
      </div>

      {/* Moxibac Section */}
      <MedicineRow
        medicine={moxibacMedicine}
        imageAlt="মক্সিব্যাক আই ড্রপস"
        status={moxibacStatus}
        givenCount={moxibacGiven}
        totalCount={totalDoses}
        lastRecord={moxibacLastRecord}
        isLoading={loadingMoxibac}
        onGive={() => handleGiveDose(moxibacMedicine, setLoadingMoxibac)}
        order={2}
        disabledReason={
          nclStatus === 'due' ? 'আগে NCL দিন' : undefined
        }
      />

      {/* Permanent instruction at bottom */}
      {activeWindow && (
        <div className="mx-5 mb-5 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <Info size={18} className="text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>মনে রাখুন:</strong> NCL আগে, তারপর ২ মিনিট অপেক্ষা করে Moxibac দিন।
          </p>
        </div>
      )}
    </div>
  );
}

interface MedicineRowProps {
  medicine: IMedicine;
  imageAlt: string;
  status: MedicineStatus;
  givenCount: number;
  totalCount: number;
  lastRecord?: IMedicineRecord;
  isLoading: boolean;
  onGive: () => void;
  order: number;
  disabledReason?: string;
}

function MedicineRow({
  medicine,
  imageAlt,
  status,
  givenCount,
  totalCount,
  lastRecord,
  isLoading,
  onGive,
  order,
  disabledReason,
}: MedicineRowProps) {
  const isDisabled = status === 'inactive' || status === 'done-today' || isLoading || !!disabledReason;
  const isDue = status === 'due';

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-4 mb-4">
        {/* Order badge */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
          {order}
        </div>
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
          <Image
            src={medicine.image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900">{medicine.nameEn}</h3>
          <p className="text-base text-slate-600">{medicine.nameBn}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">মাত্রা:</span>
            <span className="text-base font-semibold text-slate-800">{medicine.doseBn}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              আজ: {givenCount}/{totalCount}
            </Badge>
            {status === 'given' && (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 size={12} className="mr-1" aria-hidden="true" />
                দেওয়া হয়েছে
              </Badge>
            )}
            {isDue && (
              <Badge variant="warning" className="text-xs">
                <AlertCircle size={12} className="mr-1" aria-hidden="true" />
                দিন এখন
              </Badge>
            )}
          </div>

          {lastRecord && (
            <p className="text-xs text-slate-400 mt-1">
              শেষ দেওয়া: {formatDateTimeBengali(lastRecord.actualGivenTime)}
            </p>
          )}
        </div>
      </div>

      {disabledReason && (
        <p className="text-sm text-amber-600 font-medium mb-3 flex items-center gap-1">
          <Info size={14} aria-hidden="true" />
          {disabledReason}
        </p>
      )}

      <Button
        onClick={onGive}
        disabled={isDisabled}
        variant={isDue ? 'success' : 'outline'}
        className="w-full h-14 text-lg font-bold"
        aria-label={`${medicine.nameBn} দিয়েছি`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
            সংরক্ষণ হচ্ছে...
          </span>
        ) : status === 'given' ? (
          <>
            <CheckCircle2 size={20} aria-hidden="true" />
            দেওয়া হয়েছে ✓
          </>
        ) : status === 'done-today' ? (
          'আজকের সব ডোজ সম্পন্ন'
        ) : status === 'inactive' ? (
          '🌙 রাতের বিশ্রাম'
        ) : (
          <>
            <CheckCircle2 size={20} aria-hidden="true" />
            দিয়েছি
          </>
        )}
      </Button>
    </div>
  );
}
