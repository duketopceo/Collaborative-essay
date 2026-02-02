'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export function HeaderNav({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <nav className="flex items-center gap-4">
      <Link
        href="/dashboard"
        className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        Dashboard
      </Link>
      <Link
        href="/essays"
        className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        Explore
      </Link>
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {user.name ?? user.email}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        Sign out
      </button>
    </nav>
  );
}
