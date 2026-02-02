import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { DiffView } from '@/components/diff/DiffView';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { ReviewPRButton } from '@/components/ai/ReviewPRButton';
import { PRActions } from './pr-actions';

async function getPR(prId: string, slug: string) {
  const session = await auth();
  const essay = await prisma.essay.findFirst({
    where: { slug },
    select: { id: true, slug: true, title: true, authorId: true, visibility: true },
  });
  if (!essay) return null;
  if (essay.visibility === 'PRIVATE' && essay.authorId !== session?.user?.id) {
    return null;
  }
  const pr = await prisma.pullRequest.findFirst({
    where: { id: prId, essayId: essay.id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      essay: { select: { id: true, slug: true, title: true, authorId: true } },
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
  return pr;
}

export default async function PRPage({
  params,
}: {
  params: Promise<{ slug: string; prId: string }>;
}) {
  const { slug, prId } = await params;
  const pr = await getPR(prId, slug);
  if (!pr) notFound();

  const session = await auth();
  const isAuthor = session?.user?.id === pr.essay.authorId;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Collaborative Essay
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href={`/essays/${pr.essay.slug}`}
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {pr.essay.title}
            </Link>
            <Link
              href={`/essays/${pr.essay.slug}/prs`}
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              PRs
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/essays/${pr.essay.slug}/prs`}
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            ← Pull requests
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                #{pr.number} {pr.title}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                <span>{pr.author?.name ?? 'Anonymous'}</span>
                <span>{pr.status}</span>
                {pr.isAIGenerated && (
                  <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs dark:bg-neutral-700">
                    AI
                  </span>
                )}
              </div>
            </div>
            {pr.status === 'OPEN' && session?.user && (
              <div className="flex flex-wrap items-center gap-2">
                <PRActions prId={pr.id} isEssayAuthor={isAuthor} />
                <ReviewPRButton prId={pr.id} />
              </div>
            )}
          </div>

          {pr.description && (
            <div className="mt-4 prose prose-neutral dark:prose-invert max-w-none">
              <MarkdownPreview content={pr.description} />
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Changes (diff)
            </h2>
            <DiffView diff={pr.diff} />
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Proposed content
            </h2>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <MarkdownPreview content={pr.proposedContent} />
            </div>
          </div>

          {pr.reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Reviews
              </h2>
              <ul className="space-y-3">
                {pr.reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{r.reviewer?.name ?? 'Anonymous'}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          r.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : r.status === 'CHANGES_REQUESTED'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                              : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    {r.body && (
                      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        {r.body}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pr.comments.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Comments
              </h2>
              <ul className="space-y-3">
                {pr.comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {c.author?.name ?? 'Anonymous'}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {c.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
