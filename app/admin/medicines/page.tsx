import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/auth';
import AdminMedicinesClient from '@/components/admin/AdminMedicinesClient';

export default async function AdminMedicinesPage() {
  const admin = await getAdminFromCookies();

  if (!admin) {
    redirect('/admin/login');
  }

  return <AdminMedicinesClient />;
}
