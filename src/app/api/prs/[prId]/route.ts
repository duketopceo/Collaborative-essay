import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { mergeContent } from '@/lib/versioning/merge';
import { computeUnifiedDiff } from '@/lib/versioning/diff';
import { countDiffStats } from '@/lib/versioning/diff';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const session = await auth();
    const { prId } = await params;

    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        essay: {
          select: { id: true, slug: true, title: true, authorId: true, visibility: true },
        },
        author: { select: { id: true, name: true, image: true } },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, image: true } } },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, image: true } },
            replies: {
              include: { author: { select: { id: true, name: true, image: true } } },
            },
          },
        },
      },
    });
    if (!pr) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 });
    }
    const essay = pr.essay;
    const isPublic = essay.visibility === 'PUBLIC';
    const isAuthor = session?.user?.id === essay.authorId;
    if (!isPublic && !isAuthor) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(pr);
  } catch (e) {
    console.error('PR get error:', e);
    return NextResponse.json(
      { error: 'Failed to fetch pull request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { prId } = await params;

    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { essay: true },
    });
    if (!pr) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 });
    }
    if (pr.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Pull request is not open' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'merge') {
      if (pr.essay.authorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Only the essay author can merge' },
          { status: 403 }
        );
      }

      const newContent = mergeContent(pr.essay.content, pr.proposedContent);

      await prisma.$transaction([
        prisma.essay.update({
          where: { id: pr.essayId },
          data: {
            content: newContent,
            currentVersion: pr.essay.currentVersion + 1,
          },
        }),
        prisma.version.create({
          data: {
            essayId: pr.essayId,
            versionNumber: pr.essay.currentVersion + 1,
            content: newContent,
            message: `Merge PR #${pr.number}: ${pr.title}`,
            source: 'PR_MERGE',
            pullRequestId: prId,
          },
        }),
        prisma.pullRequest.update({
          where: { id: prId },
          data: {
            status: 'MERGED',
            mergedAt: new Date(),
            mergedBy: session.user.id,
          },
        }),
      ]);

      const { additions, deletions } = countDiffStats(pr.diff);
      await prisma.contribution.upsert({
        where: {
          userId_essayId: { userId: pr.authorId, essayId: pr.essayId },
        },
        create: {
          userId: pr.authorId,
          essayId: pr.essayId,
          additions,
          deletions,
          prCount: 1,
        },
        update: {
          additions: { increment: additions },
          deletions: { increment: deletions },
          prCount: { increment: 1 },
        },
      });

      const updated = await prisma.pullRequest.findUnique({
        where: { id: prId },
        include: {
          author: { select: { id: true, name: true, image: true } },
          essay: { select: { slug: true } },
        },
      });
      return NextResponse.json(updated);
    }

    if (action === 'close') {
      await prisma.pullRequest.update({
        where: { id: prId },
        data: { status: 'CLOSED' },
      });
      const updated = await prisma.pullRequest.findUnique({
        where: { id: prId },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error('PR update error:', e);
    return NextResponse.json(
      { error: 'Failed to update pull request' },
      { status: 500 }
    );
  }
}
