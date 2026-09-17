import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import Medicine from '@/lib/models/Medicine';

// This endpoint seeds the database with initial data
// It should only be called once, or it will fail if admin already exists
export async function POST(request: NextRequest) {
  // Require a seed secret to prevent unauthorized seeding
  const { seedSecret } = await request.json();
  
  if (seedSecret !== process.env.SEED_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    // Create admin if not exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(
        process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
        12
      );
      await Admin.create({ username: 'admin', passwordHash });
    }

    // Seed medicines if none exist
    const existingMedicines = await Medicine.countDocuments();
    if (existingMedicines === 0) {
      await Medicine.insertMany([
        {
          nameEn: 'Cortisol',
          nameBn: 'কর্টিসল',
          image: '/images/Cortisol.jpeg',
          dose: '1 drop',
          doseBn: '১ ফোঁটা',
          interval: 2,
          scheduleHours: [8, 10, 12, 14, 16, 18, 20, 22],
          group: 'cortisol',
          order: 1,
          instructionBn: 'প্রতি ২ ঘণ্টায় ১ ফোঁটা',
          isActive: true,
        },
        {
          nameEn: 'NCL',
          nameBn: 'এনসিএল',
          image: '/images/NCL.jpeg',
          dose: '1 drop',
          doseBn: '১ ফোঁটা',
          interval: 4,
          scheduleHours: [8, 12, 16, 20],
          group: 'four-hour',
          order: 1,
          instructionBn: 'NCL দেওয়া হয়েছে। ২ মিনিট অপেক্ষা করে Moxibac দিন।',
          isActive: true,
        },
        {
          nameEn: 'Moxibac',
          nameBn: 'মক্সিব্যাক',
          image: '/images/Moxibac.jpeg',
          dose: '1 drop',
          doseBn: '১ ফোঁটা',
          interval: 4,
          scheduleHours: [8, 12, 16, 20],
          group: 'four-hour',
          order: 2,
          instructionBn: '',
          isActive: true,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}
