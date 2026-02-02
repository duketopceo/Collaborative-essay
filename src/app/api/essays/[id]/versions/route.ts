import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEssayVersionHistory } from '@/lib/versioning/history';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: essayId } = await params;

    const { prisma } = await import('@/lib/db/prisma');
    const essay = await prisma.essay.findFirst({
      where: { id: essayId },
      select: { id: true, authorId: true, visibility: true },
    });
    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 });
    }
    const isPublic = essay.visibility === 'PUBLIC';
    const isAuthor = session?.user?.id === essay.authorId;
    if (!isPublic && !isAuthor) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 });
    }

    const versions = await getEssayVersionHistory(essayId);
    return NextResponse.json({ versions });
  } catch (e) {
    console.error('Versions list error:', e);
    return NextResponse.json(
      { error: 'Failed to list versions' },
      { status: 500 }
    );
  }
}
