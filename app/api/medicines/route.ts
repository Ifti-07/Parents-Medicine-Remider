import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Medicine from '@/lib/models/Medicine';

export async function GET() {
  try {
    await connectDB();
    const medicines = await Medicine.find({ isActive: true }).sort({ group: 1, order: 1 }).lean();
    return NextResponse.json({ success: true, data: medicines });
  } catch (error) {
    console.error('GET /api/medicines error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch medicines' }, { status: 500 });
  }
}
