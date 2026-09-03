import { AdminPanel } from '../components/admin-panel';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Админка | Твоя служба',
  description: 'Управление заявками и содержанием сайта.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
