import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicineDoc extends Document {
  nameEn: string;
  nameBn: string;
  image: string;
  dose: string;
  doseBn: string;
  interval: number;
  scheduleHours: number[];
  group: 'cortisol' | 'four-hour';
  order: number;
  instructionBn: string;
  isActive: boolean;
}

const MedicineSchema = new Schema<IMedicineDoc>(
  {
    nameEn: { type: String, required: true },
    nameBn: { type: String, required: true },
    image: { type: String, required: true },
    dose: { type: String, required: true },
    doseBn: { type: String, required: true },
    interval: { type: Number, required: true },
    scheduleHours: { type: [Number], required: true },
    group: { type: String, enum: ['cortisol', 'four-hour'], required: true },
    order: { type: Number, default: 0 },
    instructionBn: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Medicine: Model<IMedicineDoc> =
  mongoose.models.Medicine || mongoose.model<IMedicineDoc>('Medicine', MedicineSchema);

export default Medicine;
