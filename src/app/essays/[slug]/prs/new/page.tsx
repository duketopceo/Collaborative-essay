import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { NewPRForm } from './new-pr-form';

async function getEssay(slug: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const essay = await prisma.essay.findFirst({
    where: { slug },
    select: { id: true, slug: true, title: true, content: true },
  });
  return essay;
}

export default async function NewPRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <a href="/" className="font-semibold text-neutral-900 dark:text-neutral-100">
            Collaborative Essay
          </a>
          <a
            href={`/essays/${essay.slug}/prs`}
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            ← PRs
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">
          New pull request: {essay.title}
        </h1>
        <NewPRForm essay={essay} />
      </main>
    </div>
  );
}
