import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      _count: {
        select: { essays: true, pullRequests: true },
      },
    },
  });
  return user;
}

async function getUserEssays(userId: string) {
  const essays = await prisma.essay.findMany({
    where: { authorId: userId, visibility: 'PUBLIC' },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      updatedAt: true,
      _count: { select: { pullRequests: true } },
    },
  });
  return essays;
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUser(userId);
  if (!user) notFound();

  const essays = await getUserEssays(userId);

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
            <Link
              href="/auth/signin"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {user.image && (
            <img
              src={user.image}
              alt=""
              className="h-20 w-20 rounded-full border-2 border-neutral-200 dark:border-neutral-700"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {user.name ?? 'Anonymous'}
            </h1>
            {user.bio && (
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                {user.bio}
              </p>
            )}
            <div className="mt-2 flex gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span>{user._count.essays} essays</span>
              <span>{user._count.pullRequests} PRs</span>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Public essays
        </h2>
        {essays.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            No public essays yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {essays.map((essay) => (
              <li key={essay.id}>
                <Link
                  href={`/essays/${essay.slug}`}
                  className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {essay.title}
                  </h3>
                  {essay.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {essay.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {essay._count.pullRequests} PRs · Updated{' '}
                    {new Date(essay.updatedAt).toLocaleDateString()}
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
