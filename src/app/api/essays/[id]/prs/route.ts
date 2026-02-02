import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { computeUnifiedDiff } from '@/lib/versioning/diff';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: essayId } = await params;

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

    const prs = await prisma.pullRequest.findMany({
      where: { essayId },
      orderBy: { number: 'desc' },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { reviews: true, comments: true } },
      },
    });
    return NextResponse.json({ pullRequests: prs });
  } catch (e) {
    console.error('PRs list error:', e);
    return NextResponse.json(
      { error: 'Failed to list pull requests' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: essayId } = await params;

    const essay = await prisma.essay.findUnique({
      where: { id: essayId },
      select: { id: true, content: true, authorId: true },
    });
    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, proposedContent, isAIGenerated, aiModel, aiPrompt } = body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    const content = typeof proposedContent === 'string' ? proposedContent : essay.content;

    const nextNumber =
      (await prisma.pullRequest
        .aggregate({ where: { essayId }, _max: { number: true } })
        .then((r) => (r._max.number ?? 0) + 1));

    const diff = computeUnifiedDiff(essay.content, content, {
      oldLabel: 'current',
      newLabel: 'proposed',
    });

    const pr = await prisma.pullRequest.create({
      data: {
        essayId,
        number: nextNumber,
        title: title.trim(),
        description: description ? String(description).trim() || null : null,
        proposedContent: content,
        diff,
        authorId: session.user.id,
        isAIGenerated: Boolean(isAIGenerated),
        aiModel: aiModel ? String(aiModel) : null,
        aiPrompt: aiPrompt ? String(aiPrompt) : null,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(pr);
  } catch (e) {
    console.error('PR create error:', e);
    return NextResponse.json(
      { error: 'Failed to create pull request' },
      { status: 500 }
    );
  }
}
