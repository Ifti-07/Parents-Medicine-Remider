'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { IMedicineRecord } from '@/types';
import { formatDateTimeBengali, formatDateBengali, getDhakaDate } from '@/lib/scheduling';

interface GroupedRecords {
  date: string;
  dateBengali: string;
  isToday: boolean;
  records: IMedicineRecord[];
}

export default function HistoryPage() {
  const [records, setRecords] = useState<IMedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      // Fetch last 7 days of records
      const today = getDhakaDate();
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }

      const allRecords: IMedicineRecord[] = [];
      for (const date of dates) {
        const res = await fetch(`/api/records?date=${date}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) allRecords.push(...data.data);
        }
      }

      setRecords(allRecords.sort((a, b) =>
        new Date(b.actualGivenTime).getTime() - new Date(a.actualGivenTime).getTime()
      ));
      setError(null);
    } catch {
      setError('ইতিহাস লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Group records by date
  const today = getDhakaDate();
  const groupedRecords: GroupedRecords[] = [];
  const dateMap = new Map<string, IMedicineRecord[]>();

  for (const record of records) {
    if (!dateMap.has(record.date)) {
      dateMap.set(record.date, []);
    }
    dateMap.get(record.date)!.push(record);
  }

  // Sort dates descending
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));
  for (const date of sortedDates) {
    groupedRecords.push({
      date,
      dateBengali: formatDateBengali(date),
      isToday: date === today,
      records: dateMap.get(date)!,
    });
  }

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-100 px-4 py-5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">ওষুধের ইতিহাস</h1>
          <p className="text-base text-slate-500 mt-0.5">গত ৭ দিনের রেকর্ড</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3" />
              <p className="text-base text-slate-500">লোড হচ্ছে...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-4" role="alert">
            <p className="text-base font-semibold text-red-700">{error}</p>
            <button onClick={fetchRecords} className="mt-2 text-base text-red-600 underline">
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : groupedRecords.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={48} className="text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-xl font-semibold text-slate-500">কোনো রেকর্ড নেই</p>
            <p className="text-base text-slate-400 mt-2">ওষুধ দেওয়ার পর এখানে দেখা যাবে।</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedRecords.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                    group.isToday
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {group.isToday ? 'আজ' : group.dateBengali}
                  </div>
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-sm text-slate-400">{group.records.length} টি ডোজ</span>
                </div>

                {/* Records */}
                <div className="space-y-3">
                  {group.records.map((record) => (
                    <div
                      key={record._id}
                      className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={20} className="text-green-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-slate-900 truncate">
                          {record.medicineNameBn}
                        </p>
                        <p className="text-sm text-slate-500">
                          {record.medicineNameEn}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-slate-900">
                          {formatDateTimeBengali(record.actualGivenTime)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <CheckCircle2 size={14} className="text-green-500" aria-hidden="true" />
                          <span className="text-sm text-green-600 font-medium">দেওয়া হয়েছে</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
