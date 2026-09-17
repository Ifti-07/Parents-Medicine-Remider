'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Edit2, ToggleLeft, ToggleRight, Plus, Save, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IMedicine } from '@/types';

interface EditForm {
  nameEn: string;
  nameBn: string;
  doseBn: string;
  dose: string;
  instructionBn: string;
  scheduleHours: string;
  interval: string;
  order: string;
  group: 'cortisol' | 'four-hour';
}

export default function AdminMedicinesClient() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/medicines');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) setMedicines(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const startEdit = (med: IMedicine) => {
    setEditingId(med._id);
    setEditForm({
      nameEn: med.nameEn,
      nameBn: med.nameBn,
      doseBn: med.doseBn,
      dose: med.dose,
      instructionBn: med.instructionBn,
      scheduleHours: med.scheduleHours.join(', '),
      interval: String(med.interval),
      order: String(med.order),
      group: med.group,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (id: string) => {
    if (!editForm) return;
    setSaving(true);
    setMessage(null);

    try {
      const scheduleHours = editForm.scheduleHours
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 0 && n <= 23);

      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: editForm.nameEn,
          nameBn: editForm.nameBn,
          doseBn: editForm.doseBn,
          dose: editForm.dose,
          instructionBn: editForm.instructionBn,
          scheduleHours,
          interval: parseInt(editForm.interval, 10),
          order: parseInt(editForm.order, 10),
          group: editForm.group,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'সংরক্ষণ সফল হয়েছে।' });
        await fetchMedicines();
        cancelEdit();
      } else {
        setMessage({ type: 'error', text: data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।' });
      }
    } catch {
      setMessage({ type: 'error', text: 'সংযোগ সমস্যা।' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: current ? 'নিষ্ক্রিয় করা হয়েছে।' : 'সক্রিয় করা হয়েছে।' });
        await fetchMedicines();
      }
    } catch {
      setMessage({ type: 'error', text: 'পরিবর্তন সফল হয়নি।' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b-2 border-slate-100 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="পিছনে যান"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">ওষুধ পরিচালনা</h1>
            <p className="text-sm text-slate-500">Medicine Management</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {message && (
          <div
            className={`rounded-xl px-4 py-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
            role="alert"
            aria-live="polite"
          >
            <p className="text-base font-medium">{message.text}</p>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto" />
          </div>
        ) : (
          medicines.map((med) => {
            const isEditing = editingId === med._id;

            return (
              <div
                key={med._id}
                className={`bg-white rounded-2xl border-2 overflow-hidden ${
                  isEditing ? 'border-blue-400' : 'border-slate-200'
                }`}
              >
                {/* Medicine header */}
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                    <Image
                      src={med.image}
                      alt={med.nameBn}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{med.nameEn}</h2>
                        <p className="text-base text-slate-600">{med.nameBn}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant={med.group === 'cortisol' ? 'info' : 'warning'} className="text-xs">
                            {med.group === 'cortisol' ? '২ ঘণ্টা' : '৪ ঘণ্টা'}
                          </Badge>
                          <Badge variant={med.isActive ? 'success' : 'destructive'} className="text-xs">
                            {med.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            ক্রম: {med.order}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => isEditing ? cancelEdit() : startEdit(med)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          aria-label={isEditing ? 'বাতিল করুন' : 'সম্পাদনা করুন'}
                        >
                          {isEditing ? (
                            <X size={20} aria-hidden="true" />
                          ) : (
                            <Edit2 size={20} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleActive(med._id, med.isActive)}
                          className={`p-2 rounded-lg ${med.isActive ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                          aria-label={med.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                        >
                          {med.isActive ? (
                            <ToggleRight size={24} aria-hidden="true" />
                          ) : (
                            <ToggleLeft size={24} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="mt-2 text-sm text-slate-500">
                        <span>মাত্রা: {med.doseBn} • সময়: {med.scheduleHours.join(', ')}h</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && editForm && (
                  <div className="border-t-2 border-blue-100 px-5 py-5 bg-blue-50 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">English Name</label>
                        <Input
                          value={editForm.nameEn}
                          onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                          className="h-11 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">বাংলা নাম</label>
                        <Input
                          value={editForm.nameBn}
                          onChange={(e) => setEditForm({ ...editForm, nameBn: e.target.value })}
                          className="h-11 text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">মাত্রা (বাংলা)</label>
                        <Input
                          value={editForm.doseBn}
                          onChange={(e) => setEditForm({ ...editForm, doseBn: e.target.value })}
                          placeholder="১ ফোঁটা"
                          className="h-11 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">ক্রম</label>
                        <Input
                          type="number"
                          value={editForm.order}
                          onChange={(e) => setEditForm({ ...editForm, order: e.target.value })}
                          className="h-11 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        সময়সূচি (ঘণ্টা, কমা দিয়ে আলাদা)
                      </label>
                      <Input
                        value={editForm.scheduleHours}
                        onChange={(e) => setEditForm({ ...editForm, scheduleHours: e.target.value })}
                        placeholder="8, 10, 12, 14, 16, 18, 20, 22"
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-slate-500 mt-1">উদাহরণ: 8, 12, 16, 20</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">নির্দেশনা (বাংলা)</label>
                      <Input
                        value={editForm.instructionBn}
                        onChange={(e) => setEditForm({ ...editForm, instructionBn: e.target.value })}
                        className="h-11 text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">গ্রুপ</label>
                      <select
                        value={editForm.group}
                        onChange={(e) => setEditForm({ ...editForm, group: e.target.value as 'cortisol' | 'four-hour' })}
                        className="w-full h-11 rounded-xl border-2 border-slate-200 px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cortisol">কর্টিসল (২ ঘণ্টা)</option>
                        <option value="four-hour">৪ ঘণ্টার গ্রুপ</option>
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => saveEdit(med._id)}
                        disabled={saving}
                        variant="success"
                        className="flex-1 h-12"
                      >
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            সংরক্ষণ হচ্ছে...
                          </span>
                        ) : (
                          <>
                            <Save size={18} aria-hidden="true" />
                            সংরক্ষণ করুন
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        className="h-12 px-6"
                      >
                        <X size={18} aria-hidden="true" />
                        বাতিল
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add medicine placeholder */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 px-5 py-6 text-center">
          <Plus size={24} className="text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-base text-slate-500 font-medium">নতুন ওষুধ যোগ করতে seed API ব্যবহার করুন</p>
          <p className="text-sm text-slate-400 mt-1">বা DEVELOPMENT.md দেখুন</p>
        </div>
      </div>
    </div>
  );
}
