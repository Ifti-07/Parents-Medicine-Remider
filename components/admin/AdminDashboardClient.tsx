'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, LogOut, Pill, History, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IMedicine, IMedicineRecord } from '@/types';
import { getDhakaDate, formatDateTimeBengali, formatDateBengali } from '@/lib/scheduling';

interface AdminDashboardClientProps {
  username: string;
}

export default function AdminDashboardClient({ username }: AdminDashboardClientProps) {
  const router = useRouter();
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [todayRecords, setTodayRecords] = useState<IMedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const today = getDhakaDate();

  const fetchData = useCallback(async () => {
    try {
      const [medRes, recRes] = await Promise.all([
        fetch('/api/admin/medicines'),
        fetch(`/api/admin/records?date=${today}`),
      ]);

      if (medRes.ok) {
        const data = await medRes.json();
        if (data.success) setMedicines(data.data);
      }

      if (recRes.ok) {
        const data = await recRes.json();
        if (data.success) setTodayRecords(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  // Stats
  const totalExpectedToday = medicines
    .filter((m) => m.isActive)
    .reduce((acc, m) => acc + m.scheduleHours.length, 0);
  const givenToday = todayRecords.length;

  // Recent records
  const recentRecords = [...todayRecords]
    .sort((a, b) => new Date(b.actualGivenTime).getTime() - new Date(a.actualGivenTime).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b-2 border-slate-100 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">স্বাগতম, {username}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="h-10"
            aria-label="লগআউট"
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden sm:inline ml-1">লগআউট</span>
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/admin"
            className="bg-blue-600 text-white rounded-xl px-4 py-4 text-center flex flex-col items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <History size={22} aria-hidden="true" />
            <span className="text-sm font-semibold">ড্যাশবোর্ড</span>
          </Link>
          <Link
            href="/admin/medicines"
            className="bg-white border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-4 text-center flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Pill size={22} aria-hidden="true" />
            <span className="text-sm font-semibold">ওষুধ</span>
          </Link>
          <Link
            href="/"
            className="bg-white border-2 border-slate-200 text-slate-700 rounded-xl px-4 py-4 text-center flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Settings size={22} aria-hidden="true" />
            <span className="text-sm font-semibold">হোমে যান</span>
          </Link>
        </div>

        {/* Today's stats */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            আজকের অবস্থা — {formatDateBengali(today)}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={20} className="text-green-500" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-600">দেওয়া হয়েছে</span>
              </div>
              <p className="text-4xl font-bold text-green-600">{givenToday}</p>
              <p className="text-sm text-slate-500 mt-1">ডোজ</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-amber-500" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-600">মোট প্রত্যাশিত</span>
              </div>
              <p className="text-4xl font-bold text-slate-800">{totalExpectedToday}</p>
              <p className="text-sm text-slate-500 mt-1">ডোজ (সব)</p>
            </div>
          </div>
        </div>

        {/* Medicine status */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">ওষুধের অবস্থা</h2>
            <Link href="/admin/medicines" className="text-sm text-blue-600 font-medium hover:underline">
              পরিচালনা →
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {medicines.map((med) => {
                const medRecords = todayRecords.filter((r) => r.medicineId === med._id);
                const given = medRecords.length;
                const total = med.scheduleHours.length;

                return (
                  <div key={med._id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{med.nameEn}</p>
                      <p className="text-sm text-slate-500">{med.nameBn}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={given === total ? 'success' : given > 0 ? 'warning' : 'secondary'}
                      >
                        {given}/{total}
                      </Badge>
                      {!med.isActive && (
                        <Badge variant="destructive">নিষ্ক্রিয়</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent records */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">সাম্প্রতিক রেকর্ড (আজকের)</h2>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto" />
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-slate-400 text-base">আজকে কোনো রেকর্ড নেই।</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRecords.map((record) => (
                <div key={record._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{record.medicineNameEn}</p>
                    <p className="text-sm text-slate-500">{record.medicineNameBn}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-800">
                      {formatDateTimeBengali(record.actualGivenTime)}
                    </p>
                    <Badge variant="success" className="text-xs mt-1">
                      <CheckCircle2 size={10} className="mr-1" aria-hidden="true" />
                      দেওয়া হয়েছে
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
