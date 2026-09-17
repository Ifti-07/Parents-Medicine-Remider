import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicineRecord from '@/lib/models/MedicineRecord';
import { getDhakaDate } from '@/lib/scheduling';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getDhakaDate();
    const medicineId = searchParams.get('medicineId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = { date };
    if (medicineId) query.medicineId = medicineId;

    const records = await MedicineRecord.find(query)
      .sort({ actualGivenTime: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('GET /api/records error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      medicineId,
      medicineNameEn,
      medicineNameBn,
      scheduledTime,
      actualGivenTime,
      date,
      clientRecordId,
    } = body;

    // Validate required fields
    if (!medicineId || !clientRecordId || !actualGivenTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for duplicate using clientRecordId
    const existing = await MedicineRecord.findOne({ clientRecordId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Record already exists', data: existing },
        { status: 409 }
      );
    }

    const record = await MedicineRecord.create({
      medicineId,
      medicineNameEn,
      medicineNameBn,
      scheduledTime: new Date(scheduledTime),
      actualGivenTime: new Date(actualGivenTime),
      status: 'given',
      clientRecordId,
      date: date || getDhakaDate(),
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('POST /api/records error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save record' }, { status: 500 });
  }
}
