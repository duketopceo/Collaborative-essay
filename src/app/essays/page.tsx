import Link from 'next/link';

async function getEssays() {
  const base = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000';
  const url = typeof base === 'string' ? base : `https://${base}`;
  const res = await fetch(`${url}/api/essays?limit=20`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return { essays: [], nextCursor: null };
  return res.json();
}

export default async function ExplorePage() {
  const { essays } = await getEssays();

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
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
              Explore
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">Explore essays</h1>
        {essays.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            No public essays yet. Be the first to write one.
          </p>
        ) : (
          <ul className="space-y-4">
            {essays.map((essay: { id: string; slug: string; title: string; description: string | null; author: { name: string | null }; updatedAt: string; _count: { pullRequests: number } }) => (
              <li key={essay.id}>
                <Link
                  href={`/essays/${essay.slug}`}
                  className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {essay.title}
                  </h2>
                  {essay.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {essay.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    {'author' in essay && essay.author && 'id' in essay.author ? (
                      <Link
                        href={`/users/${essay.author.id}`}
                        className="hover:underline"
                      >
                        {essay.author.name ?? 'Anonymous'}
                      </Link>
                    ) : (
                      <span>{essay.author?.name ?? 'Anonymous'}</span>
                    )}
                    <span>{essay._count.pullRequests} PRs</span>
                    <span>
                      Updated {new Date(essay.updatedAt).toLocaleDateString()}
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
