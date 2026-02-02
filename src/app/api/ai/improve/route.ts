import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { improveStyle } from '@/lib/ai/orchestrator';

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
    const { content } = body;
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const improved = await improveStyle(content);
    return NextResponse.json({ content: improved });
  } catch (e) {
    console.error('AI improve error:', e);
    return NextResponse.json(
      { error: 'Failed to improve content' },
      { status: 500 }
    );
  }
}
