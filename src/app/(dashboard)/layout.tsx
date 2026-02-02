import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { HeaderNav } from '@/components/layout/header-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto flex h-14 max-w-6xl flex-wrap items-center justify-between gap-2 px-4">
          <Link
            href="/"
            className="font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Collaborative Essay
          </Link>
          <HeaderNav user={session.user} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
