import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminDoc extends Document {
  username: string;
  passwordHash: string;
}

const AdminSchema = new Schema<IAdminDoc>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin: Model<IAdminDoc> =
  mongoose.models.Admin || mongoose.model<IAdminDoc>('Admin', AdminSchema);

export default Admin;
