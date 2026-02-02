import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { generateUniqueSlug } from '@/lib/utils/slug';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get('visibility') ?? 'PUBLIC';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
    const cursor = searchParams.get('cursor') ?? undefined;

    const essays = await prisma.essay.findMany({
      where: { visibility: 'PUBLIC' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        visibility: true,
        viewCount: true,
        starCount: true,
        forkCount: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, image: true },
        },
        _count: { select: { pullRequests: true } },
      },
    });

    const nextCursor = essays.length > limit ? essays[limit - 1]?.id : null;
    const items = essays.slice(0, limit);

    return NextResponse.json({
      essays: items,
      nextCursor,
    });
  } catch (e) {
    console.error('Essays list error:', e);
    return NextResponse.json(
      { error: 'Failed to list essays' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, visibility } = body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const existingSlugs = await prisma.essay
      .findMany({ select: { slug: true } })
      .then((rows) => rows.map((r) => r.slug));
    const slug = generateUniqueSlug(title, existingSlugs);

    const essay = await prisma.essay.create({
      data: {
        slug,
        title: title.trim(),
        description: description ? String(description).trim() || null : null,
        content: content ? String(content).trim() : '',
        visibility: visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    await prisma.version.create({
      data: {
        essayId: essay.id,
        versionNumber: 1,
        content: essay.content,
        message: 'Initial version',
        source: 'DIRECT_EDIT',
      },
    });

    return NextResponse.json(essay);
  } catch (e) {
    console.error('Essay create error:', e);
    return NextResponse.json(
      { error: 'Failed to create essay' },
      { status: 500 }
    );
  }
}
