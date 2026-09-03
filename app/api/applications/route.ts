import { NextResponse } from 'next/server';
import { createApplication, listApplications } from '../../lib/store';

function clean(value: unknown, limit = 500) {
  return String(value ?? '').trim().slice(0, limit);
}

export async function GET() {
  return NextResponse.json({ applications: await listApplications() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Не удалось прочитать анкету.' }, { status: 400 });

  const fullName = clean(body.fullName, 160);
  const birthDate = clean(body.birthDate, 10);
  const citizenship = clean(body.citizenship, 100);
  const phone = clean(body.phone, 40);
  const service = clean(body.service, 120);
  const phoneDigits = phone.replace(/\D/g, '');

  if (fullName.length < 5 || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || citizenship.length < 2 || phoneDigits.length < 10) {
    return NextResponse.json(
      { error: 'Проверьте обязательные поля: ФИО, дату рождения, гражданство и телефон.' },
      { status: 422 },
    );
  }

  const application = await createApplication({
    fullName,
    birthDate,
    citizenship,
    phone,
    service: service || 'Не выбрано',
    location: clean(body.location, 160),
    applicantNote: clean(body.applicantNote, 2000),
  });

  return NextResponse.json({ application }, { status: 201 });
}
