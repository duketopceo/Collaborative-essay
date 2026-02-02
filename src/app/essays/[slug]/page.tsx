import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';

async function getEssay(slug: string) {
  const session = await auth();
  const essay = await prisma.essay.findFirst({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { pullRequests: true } },
    },
  });
  if (!essay) return null;
  if (essay.visibility === 'PRIVATE' && essay.authorId !== session?.user?.id) {
    return null;
  }
  return essay;
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

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
              href="/essays"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Explore
            </Link>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <article className="rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {essay.title}
              </h1>
              {essay.description && (
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {essay.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                <Link
                  href={`/users/${essay.author?.id}`}
                  className="hover:text-neutral-900 hover:underline dark:hover:text-neutral-100"
                >
                  {essay.author?.name ?? 'Anonymous'}
                </Link>
                <span>·</span>
                <span>{essay.viewCount} views</span>
                <span>·</span>
                <Link
                  href={`/essays/${essay.slug}/prs`}
                  className="hover:underline"
                >
                  {essay._count.pullRequests} PR
                  {essay._count.pullRequests !== 1 ? 's' : ''}
                </Link>
              </div>
            </div>
            {isAuthor && (
              <Link
                href={`/essays/${essay.slug}/edit`}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Edit
              </Link>
            )}
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <MarkdownPreview content={essay.content || ''} />
          </div>
        </article>
      </main>
    </div>
  );
}
