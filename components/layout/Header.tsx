'use client';

import { useEffect, useState } from 'react';
import { formatTimeBengali, getDhakaDateParts, formatDateBengali } from '@/lib/scheduling';

export default function Header() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const parts = getDhakaDateParts();
      setTime(formatTimeBengali(parts.hour, parts.minute));
      setDate(formatDateBengali(parts.dateString));
    };

    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b-2 border-slate-100 px-4 pt-4 pb-4 sticky top-0 z-40">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" aria-label="আমার ওষুধ">
              আমার ওষুধ
            </h1>
            <p className="text-base text-slate-500 mt-0.5" aria-label={`তারিখ: ${date}`}>
              {date}
            </p>
          </div>
          <div
            className="text-right"
            aria-label={`বর্তমান সময়: ${time}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-2xl font-bold text-blue-600 tabular-nums">
              {time}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">এশিয়া/ঢাকা</p>
          </div>
        </div>
      </div>
    </header>
  );
}
