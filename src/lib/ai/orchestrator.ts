import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PROMPTS } from './prompts';

const model = openai('gpt-4o-mini');

export async function expandSection(
  section: string,
  context?: string
): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: PROMPTS.expand(section, context),
    maxOutputTokens: 1024,
  });
  return text.trim();
}

export async function improveStyle(content: string): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: PROMPTS.improve(content),
    maxOutputTokens: 2048,
  });
  return text.trim();
}

export async function reviewPR(
  title: string,
  description: string | null,
  currentContent: string,
  proposedContent: string
): Promise<{ body: string; status: 'APPROVED' | 'CHANGES_REQUESTED' }> {
  const { text } = await generateText({
    model,
    prompt: PROMPTS.reviewPR(title, description ?? '', currentContent, proposedContent),
    maxOutputTokens: 512,
  });
  const recommendationMatch = text.match(/RECOMMENDATION:\s*(APPROVED|CHANGES_REQUESTED)/i);
  const status = recommendationMatch
    ? (recommendationMatch[1].toUpperCase() as 'APPROVED' | 'CHANGES_REQUESTED')
    : 'COMMENTED';
  const body = text.replace(/\n?RECOMMENDATION:\s*(APPROVED|CHANGES_REQUESTED).*$/i, '').trim();
  return {
    body: body || 'AI review completed.',
    status: status === 'COMMENTED' ? 'CHANGES_REQUESTED' : status,
  };
}

export async function summarizeEssay(content: string): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: PROMPTS.summarize(content),
    maxOutputTokens: 256,
  });
  return text.trim();
}

export async function suggestImprovement(
  title: string,
  content: string
): Promise<{ suggestion: string; content?: string } | null> {
  const { text } = await generateText({
    model,
    prompt: PROMPTS.suggestImprovement(title, content),
    maxOutputTokens: 1024,
  });
  if (text.includes('NO_SUGGESTION')) {
    return null;
  }
  const parts = text.split('---SUGGESTED CONTENT---');
  const suggestion = parts[0]?.trim() ?? text;
  const suggestedContent = parts[1]?.trim();
  return { suggestion, content: suggestedContent };
}
