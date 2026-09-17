'use client';

import { Clock, ArrowRight } from 'lucide-react';
import { formatTimeBengali, CORTISOL_SCHEDULE, FOUR_HOUR_SCHEDULE } from '@/lib/scheduling';
import { IMedicine, IMedicineRecord } from '@/types';

interface NextMedicineSectionProps {
  medicines: IMedicine[];
  todayRecords: IMedicineRecord[];
  currentHour: number;
  currentMinute: number;
  isActiveWindow: boolean;
}

interface NextDose {
  medicine: IMedicine;
  hour: number;
}

export default function NextMedicineSection({
  medicines,
  todayRecords,
  currentHour,
  currentMinute,
  isActiveWindow,
}: NextMedicineSectionProps) {

  if (!isActiveWindow) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-5">
        <h2 className="text-lg font-bold text-slate-700 mb-1">পরবর্তী ওষুধ</h2>
        <div className="flex items-center gap-3">
          <Clock size={22} className="text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold text-slate-700">কাল সকাল ৮:০০ AM থেকে শুরু</p>
            <p className="text-sm text-slate-500">এখন রাতের বিশ্রাম</p>
          </div>
        </div>
      </div>
    );
  }

  // Get given hours for each medicine
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

  const getNextDose = (medicine: IMedicine, schedule: number[]): NextDose | null => {
    const givenHours = getGivenHours(medicine._id);
    for (const h of schedule) {
      if (!givenHours.has(h)) {
        if (h > currentHour || (h === currentHour && currentMinute <= 30)) {
          return { medicine, hour: h };
        }
      }
    }
    return null;
  };

  const cortisolMed = medicines.find((m) => m.group === 'cortisol');
  const nclMed = medicines.find((m) => m.group === 'four-hour' && m.order === 1);

  const nextDoses: NextDose[] = [];

  if (cortisolMed) {
    const next = getNextDose(cortisolMed, CORTISOL_SCHEDULE);
    if (next) nextDoses.push(next);
  }

  if (nclMed) {
    const next = getNextDose(nclMed, FOUR_HOUR_SCHEDULE);
    if (next) nextDoses.push(next);
  }

  // Sort by hour
  nextDoses.sort((a, b) => a.hour - b.hour);

  const upcoming = nextDoses[0];

  if (!upcoming) {
    return (
      <div className="bg-green-50 rounded-2xl border-2 border-green-200 px-5 py-5">
        <h2 className="text-lg font-bold text-green-800 mb-1">পরবর্তী ওষুধ</h2>
        <p className="text-base text-green-700 font-semibold">🎉 আজকের সব ওষুধ দেওয়া সম্পন্ন!</p>
      </div>
    );
  }

  const isCurrentDue = upcoming.hour <= currentHour && (currentHour - upcoming.hour) < 2;

  return (
    <div className={`rounded-2xl border-2 px-5 py-5 ${isCurrentDue ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
      <h2 className={`text-lg font-bold mb-3 ${isCurrentDue ? 'text-amber-800' : 'text-blue-800'}`}>
        পরবর্তী ওষুধ
      </h2>

      <div className="flex items-center gap-4">
        <Clock
          size={28}
          className={isCurrentDue ? 'text-amber-600' : 'text-blue-600'}
          aria-hidden="true"
        />
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {formatTimeBengali(upcoming.hour)}
          </p>
          <p className="text-lg text-slate-700 font-semibold">
            {upcoming.medicine.nameBn}
          </p>
          <p className="text-base text-slate-500">
            {upcoming.medicine.nameEn}
          </p>
        </div>

        {nextDoses.length > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
            <div className="text-right">
              <p className="text-sm text-slate-500">এরপর</p>
              <p className="text-base font-semibold text-slate-700">
                {formatTimeBengali(nextDoses[1].hour)}
              </p>
              <p className="text-sm text-slate-600">{nextDoses[1].medicine.nameBn}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
