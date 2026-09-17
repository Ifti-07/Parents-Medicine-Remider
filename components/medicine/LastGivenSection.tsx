'use client';

import { CheckCircle2 } from 'lucide-react';
import { IMedicineRecord } from '@/types';
import { formatDateTimeBengali, getDhakaDate, getRelativeDateBengali } from '@/lib/scheduling';

interface LastGivenSectionProps {
  records: IMedicineRecord[];
}

export default function LastGivenSection({ records }: LastGivenSectionProps) {
  const today = getDhakaDate();

  // Show last 6 records
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.actualGivenTime).getTime() - new Date(a.actualGivenTime).getTime())
    .slice(0, 6);

  if (recentRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-6 text-center">
        <h2 className="text-lg font-bold text-slate-700 mb-2">সর্বশেষ দেওয়া হয়েছে</h2>
        <p className="text-base text-slate-400">আজকে এখনো কোনো ওষুধ দেওয়া হয়নি।</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-3">সর্বশেষ দেওয়া হয়েছে</h2>
      <div className="space-y-3">
        {recentRecords.map((record) => (
          <div
            key={record._id}
            className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-green-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">
                {record.medicineNameBn}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {record.medicineNameEn}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base font-semibold text-slate-800">
                {formatDateTimeBengali(record.actualGivenTime)}
              </p>
              <p className="text-sm text-slate-500">
                {getRelativeDateBengali(record.date, today)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
