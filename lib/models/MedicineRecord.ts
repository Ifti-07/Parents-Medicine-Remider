import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicineRecordDoc extends Document {
  medicineId: mongoose.Types.ObjectId;
  medicineNameEn: string;
  medicineNameBn: string;
  scheduledTime: Date;
  actualGivenTime: Date;
  status: 'given' | 'pending' | 'skipped';
  clientRecordId: string;
  date: string; // YYYY-MM-DD in Asia/Dhaka
}

const MedicineRecordSchema = new Schema<IMedicineRecordDoc>(
  {
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineNameEn: { type: String, required: true },
    medicineNameBn: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    actualGivenTime: { type: Date, required: true },
    status: { type: String, enum: ['given', 'pending', 'skipped'], default: 'given' },
    clientRecordId: { type: String, required: true, unique: true },
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

// Index for efficient queries
MedicineRecordSchema.index({ date: 1, medicineId: 1 });
MedicineRecordSchema.index({ clientRecordId: 1 }, { unique: true });

const MedicineRecord: Model<IMedicineRecordDoc> =
  mongoose.models.MedicineRecord ||
  mongoose.model<IMedicineRecordDoc>('MedicineRecord', MedicineRecordSchema);

export default MedicineRecord;
