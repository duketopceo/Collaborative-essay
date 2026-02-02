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
      select: { id: true },
    });
    if (!pr) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 });
    }

    const body = await request.json();
    const { body: commentBody, lineNumber, parentId } = body;
    if (!commentBody || typeof commentBody !== 'string' || !commentBody.trim()) {
      return NextResponse.json(
        { error: 'Comment body is required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        pullRequestId: prId,
        authorId: session.user.id,
        body: commentBody.trim(),
        lineNumber: typeof lineNumber === 'number' ? lineNumber : null,
        parentId: parentId ? String(parentId) : null,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(comment);
  } catch (e) {
    console.error('Comment create error:', e);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
