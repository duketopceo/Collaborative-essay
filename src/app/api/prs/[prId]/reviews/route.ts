import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(
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
      select: { id: true, status: true },
    });
    if (!pr || pr.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Pull request not found or not open' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status: reviewStatus, body: reviewBody } = body;
    const validStatuses = ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'];
    if (!reviewStatus || !validStatuses.includes(reviewStatus)) {
      return NextResponse.json(
        { error: 'Invalid review status' },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findFirst({
      where: { pullRequestId: prId, reviewerId: session.user.id },
    });
    const review = existing
      ? await prisma.review.update({
          where: { id: existing.id },
          data: { status: reviewStatus, body: reviewBody ? String(reviewBody).trim() || null : null },
          include: { reviewer: { select: { id: true, name: true, image: true } } },
        })
      : await prisma.review.create({
          data: {
            pullRequestId: prId,
            reviewerId: session.user.id,
            status: reviewStatus,
            body: reviewBody ? String(reviewBody).trim() || null : null,
          },
          include: { reviewer: { select: { id: true, name: true, image: true } } },
        });

    return NextResponse.json(review);
  } catch (e) {
    console.error('Review create error:', e);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
