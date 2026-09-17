export interface IMedicine {
  _id: string;
  nameEn: string;
  nameBn: string;
  image: string;
  dose: string;
  doseBn: string;
  interval: number; // hours between doses
  scheduleHours: number[]; // e.g. [8, 10, 12, 14, 16, 18, 20, 22]
  group: 'cortisol' | 'four-hour';
  order: number; // display order within group
  instructionBn: string; // instruction text
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMedicineRecord {
  _id: string;
  medicineId: string;
  medicineNameEn: string;
  medicineNameBn: string;
  scheduledTime: string; // ISO string
  actualGivenTime: string; // ISO string
  status: 'given' | 'pending' | 'skipped';
  clientRecordId: string; // UUID for offline dedup
  date: string; // YYYY-MM-DD in Asia/Dhaka
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdmin {
  _id: string;
  username: string;
  createdAt?: string;
}

// Scheduling types
export interface ScheduledDose {
  medicineId: string;
  medicineNameEn: string;
  medicineNameBn: string;
  scheduledHour: number; // 0-23
  scheduledTime: Date;
  status: 'upcoming' | 'current' | 'past' | 'given';
  recordId?: string;
  actualGivenTime?: string;
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  doses: ScheduledDose[];
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Offline queue
export interface OfflineRecord {
  id: string; // clientRecordId
  medicineId: string;
  medicineNameEn: string;
  medicineNameBn: string;
  scheduledTime: string;
  actualGivenTime: string;
  date: string;
  synced: boolean;
  createdAt: string;
}
