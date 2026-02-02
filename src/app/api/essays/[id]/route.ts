import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const byId = await prisma.essay.findFirst({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { pullRequests: true } },
      },
    });
    const bySlug = !byId
      ? await prisma.essay.findFirst({
          where: { slug: id },
          include: {
            author: { select: { id: true, name: true, image: true } },
            _count: { select: { pullRequests: true } },
          },
        })
      : null;

    const essay = byId ?? bySlug;
    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 });
    }

    const isPublic = essay.visibility === 'PUBLIC';
    const isAuthor = session?.user?.id === essay.authorId;
    if (!isPublic && !isAuthor) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 });
    }

    await prisma.essay.update({
      where: { id: essay.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      ...essay,
      viewCount: essay.viewCount + 1,
    });
  } catch (e) {
    console.error('Essay get error:', e);
    return NextResponse.json(
      { error: 'Failed to fetch essay' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const essay = await prisma.essay.findUnique({
      where: { id },
      select: { authorId: true, currentVersion: true },
    });
    if (!essay || essay.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, content, visibility } = body;
    const update: Record<string, unknown> = {};
    if (typeof title === 'string' && title.trim()) update.title = title.trim();
    if (description !== undefined) update.description = description ? String(description).trim() || null : null;
    if (typeof content === 'string') update.content = content;
    if (visibility === 'PRIVATE' || visibility === 'PUBLIC' || visibility === 'UNLISTED') update.visibility = visibility;

    const updated = await prisma.essay.update({
      where: { id },
      data: update,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    if (typeof content === 'string') {
      await prisma.version.create({
        data: {
          essayId: id,
          versionNumber: essay.currentVersion + 1,
          content: updated.content,
          message: title ? `Update: ${title}` : 'Content update',
          source: 'DIRECT_EDIT',
        },
      });
      await prisma.essay.update({
        where: { id },
        data: { currentVersion: essay.currentVersion + 1 },
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Essay update error:', e);
    return NextResponse.json(
      { error: 'Failed to update essay' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const essay = await prisma.essay.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!essay || essay.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await prisma.essay.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Essay delete error:', e);
    return NextResponse.json(
      { error: 'Failed to delete essay' },
      { status: 500 }
    );
  }
}
