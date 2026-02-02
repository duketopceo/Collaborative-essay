import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

async function getEssay(slug: string) {
  const session = await auth();
  const essay = await prisma.essay.findFirst({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      authorId: true,
      visibility: true,
    },
  });
  if (!essay) return null;
  if (essay.visibility === 'PRIVATE' && essay.authorId !== session?.user?.id) {
    return null;
  }
  return essay;
}

async function getPRs(essayId: string) {
  return prisma.pullRequest.findMany({
    where: { essayId },
    orderBy: { number: 'desc' },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { reviews: true, comments: true } },
    },
  });
}

export default async function EssayPRsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

  const prs = await getPRs(essay.id);
  const session = await auth();
  const isAuthor = session?.user?.id === essay.authorId;

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
              href={`/essays/${essay.slug}`}
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {essay.title}
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href={`/essays/${essay.slug}`}
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              ← {essay.title}
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Pull requests
            </h1>
          </div>
          {session?.user && (
            <Link
              href={`/essays/${essay.slug}/prs/new`}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              New PR
            </Link>
          )}
        </div>

        {prs.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            No pull requests yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {prs.map((pr) => (
              <li key={pr.id}>
                <Link
                  href={`/essays/${essay.slug}/prs/${pr.id}`}
                  className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        #{pr.number} {pr.title}
                      </h2>
                      <div className="mt-1 flex gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>{pr.author?.name ?? 'Anonymous'}</span>
                        <span>{pr.status}</span>
                        <span>{pr._count.reviews} reviews</span>
                        <span>{pr._count.comments} comments</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        pr.status === 'OPEN'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : pr.status === 'MERGED'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
