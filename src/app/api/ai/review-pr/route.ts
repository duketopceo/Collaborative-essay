import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { reviewPR } from '@/lib/ai/orchestrator';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { prId } = body;
    if (!prId) {
      return NextResponse.json(
        { error: 'Pull request ID is required' },
        { status: 400 }
      );
    }

    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { essay: { select: { content: true } } },
    });
    if (!pr || pr.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Pull request not found or not open' },
        { status: 404 }
      );
    }

    const { body: reviewBody, status } = await reviewPR(
      pr.title,
      pr.description,
      pr.essay.content,
      pr.proposedContent
    );

    const existing = await prisma.review.findFirst({
      where: { pullRequestId: prId, reviewerId: session.user.id },
    });
    const review = existing
      ? await prisma.review.update({
          where: { id: existing.id },
          data: { status, body: reviewBody, isAIReview: true },
          include: { reviewer: { select: { id: true, name: true, image: true } } },
        })
      : await prisma.review.create({
          data: {
            pullRequestId: prId,
            reviewerId: session.user.id,
            status,
            body: reviewBody,
            isAIReview: true,
          },
          include: { reviewer: { select: { id: true, name: true, image: true } } },
        });

    return NextResponse.json({ review: { ...review, status, body: reviewBody } });
  } catch (e) {
    console.error('AI review PR error:', e);
    return NextResponse.json(
      { error: 'Failed to review pull request' },
      { status: 500 }
    );
  }
}
