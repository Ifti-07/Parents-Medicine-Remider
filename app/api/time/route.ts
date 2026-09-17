import { NextResponse } from 'next/server';
import { getDhakaDateParts, formatTimeBengali, formatDateBengali } from '@/lib/scheduling';

export async function GET() {
  const parts = getDhakaDateParts();
  const { year, month, day, hour, minute, second, dateString } = parts;

  return NextResponse.json({
    success: true,
    data: {
      iso: new Date().toISOString(),
      dateString, // YYYY-MM-DD in Asia/Dhaka
      year,
      month,
      day,
      hour,
      minute,
      second,
      timeBengali: formatTimeBengali(hour, minute),
      dateBengali: formatDateBengali(dateString),
      timezone: 'Asia/Dhaka',
    },
  });
}
