import { NextResponse } from 'next/server';
import { isSiteSlug, type PageContent } from '../../data/site-content';
import { getAllPageContent, savePageContent } from '../../lib/store';

export async function GET() {
  return NextResponse.json({ pages: await getAllPageContent() });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null) as Partial<PageContent> | null;
  if (!body || !body.slug || !isSiteSlug(body.slug) || !Array.isArray(body.sections)) {
    return NextResponse.json({ error: 'Не удалось прочитать содержание страницы.' }, { status: 422 });
  }
  if (!body.navLabel?.trim() || !body.title?.trim() || !body.lead?.trim()) {
    return NextResponse.json({ error: 'Название вкладки, заголовок и вводный текст обязательны.' }, { status: 422 });
  }
  if (body.sections.some((section) => !section.title?.trim() || !section.body?.trim())) {
    return NextResponse.json({ error: 'Заполните заголовок и текст каждого раздела.' }, { status: 422 });
  }

  const page = await savePageContent(body as PageContent);
  return NextResponse.json({ page });
}
