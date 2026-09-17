import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Medicine from '@/lib/models/Medicine';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const medicines = await Medicine.find({}).sort({ group: 1, order: 1 }).lean();
    return NextResponse.json({ success: true, data: medicines });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const medicine = await Medicine.create(body);
    return NextResponse.json({ success: true, data: medicine }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}
