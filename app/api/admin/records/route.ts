import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicineRecord from '@/lib/models/MedicineRecord';
import { getAdminFromRequest } from '@/lib/auth';
import { getDhakaDate } from '@/lib/scheduling';

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getDhakaDate();
    const limit = parseInt(searchParams.get('limit') || '100');
    const allDays = searchParams.get('all') === 'true';

    const query: Record<string, unknown> = allDays ? {} : { date };

    const records = await MedicineRecord.find(query)
      .sort({ actualGivenTime: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch records' }, { status: 500 });
  }
}
