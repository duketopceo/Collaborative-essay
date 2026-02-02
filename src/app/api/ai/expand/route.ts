import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { expandSection } from '@/lib/ai/orchestrator';

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
    const { section, context } = body;
    if (!section || typeof section !== 'string') {
      return NextResponse.json(
        { error: 'Section text is required' },
        { status: 400 }
      );
    }

    const expanded = await expandSection(section, context);
    return NextResponse.json({ content: expanded });
  } catch (e) {
    console.error('AI expand error:', e);
    return NextResponse.json(
      { error: 'Failed to expand section' },
      { status: 500 }
    );
  }
}
