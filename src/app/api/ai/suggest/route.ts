import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { suggestImprovement } from '@/lib/ai/orchestrator';
import { computeUnifiedDiff } from '@/lib/versioning/diff';

/**
 * AI suggests an improvement for an essay. If content is returned,
 * optionally create a draft PR with the suggestion (when createPR=true).
 */
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
    const { essayId, createPR } = body;
    if (!essayId) {
      return NextResponse.json(
        { error: 'Essay ID is required' },
        { status: 400 }
      );
    }

    const essay = await prisma.essay.findFirst({
      where: { id: essayId },
      select: { id: true, title: true, content: true, authorId: true },
    });
    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 });
    }

    const result = await suggestImprovement(essay.title, essay.content);
    if (!result) {
      return NextResponse.json({
        suggestion: 'No suggestion at this time.',
        createdPR: false,
      });
    }

    if (!createPR || !result.content) {
      return NextResponse.json({
        suggestion: result.suggestion,
        suggestedContent: result.content,
        createdPR: false,
      });
    }

    const nextNumber =
      (await prisma.pullRequest
        .aggregate({ where: { essayId }, _max: { number: true } })
        .then((r) => (r._max.number ?? 0) + 1));

    const diff = computeUnifiedDiff(essay.content, result.content, {
      oldLabel: 'current',
      newLabel: 'proposed',
    });

    const pr = await prisma.pullRequest.create({
      data: {
        essayId,
        number: nextNumber,
        title: `AI suggestion: ${result.suggestion.slice(0, 60)}...`,
        description: result.suggestion,
        proposedContent: result.content,
        diff,
        authorId: session.user.id,
        isAIGenerated: true,
        aiModel: 'gpt-4o-mini',
        aiPrompt: 'suggest-improvement',
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        essay: { select: { slug: true } },
      },
    });

    return NextResponse.json({
      suggestion: result.suggestion,
      createdPR: true,
      pr,
    });
  } catch (e) {
    console.error('AI suggest error:', e);
    return NextResponse.json(
      { error: 'Failed to get suggestion' },
      { status: 500 }
    );
  }
}
