import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const essays = await prisma.essay.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      visibility: true,
      updatedAt: true,
      _count: { select: { pullRequests: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your essays</h1>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          New essay
        </Link>
      </div>

      {essays.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-500 dark:text-neutral-400">
            You haven&apos;t written any essays yet.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
          >
            Create your first essay
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {essays.map((essay) => (
            <li key={essay.id}>
              <Link
                href={`/essays/${essay.slug}`}
                className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {essay.title}
                    </h2>
                    {essay.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {essay.description}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {essay.visibility}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    {essay._count.pullRequests} PR
                    {essay._count.pullRequests !== 1 ? 's' : ''}
                  </span>
                  <span>
                    Updated{' '}
                    {new Date(essay.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
