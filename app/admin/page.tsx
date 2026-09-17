import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/auth';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminPage() {
  const admin = await getAdminFromCookies();

  if (!admin) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient username={admin.username} />;
}
