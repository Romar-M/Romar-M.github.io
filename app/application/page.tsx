import Link from 'next/link';
import { ApplicationForm } from '../components/application-form';
import { getAllPageContent } from '../lib/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Анкета кандидата | Твоя служба',
  description: 'Первичная заявка на консультацию по службе.',
};

export default async function ApplicationPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service }, pages] = await Promise.all([searchParams, getAllPageContent()]);
  return (
    <main className="form-page">
      <header className="form-page-header">
        <Link href="/">← Вернуться на сайт</Link>
        <span>Твоя служба / анкета</span>
      </header>
      <ApplicationForm pages={pages} initialService={service ?? ''} />
    </main>
  );
}
