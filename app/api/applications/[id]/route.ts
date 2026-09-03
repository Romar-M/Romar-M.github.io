import { NextResponse } from 'next/server';
import { applicationStatuses, updateApplication } from '../../../lib/store';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = String(body?.status ?? '');
  const managerNote = String(body?.managerNote ?? '').trim();

  if (!applicationStatuses.includes(status as (typeof applicationStatuses)[number])) {
    return NextResponse.json({ error: 'Неизвестный статус заявки.' }, { status: 422 });
  }

  const application = await updateApplication(
    id,
    status as (typeof applicationStatuses)[number],
    managerNote,
  );
  if (!application) return NextResponse.json({ error: 'Заявка не найдена.' }, { status: 404 });
  return NextResponse.json({ application });
}
