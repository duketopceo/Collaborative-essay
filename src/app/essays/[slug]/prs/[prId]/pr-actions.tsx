'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PRActions({
  prId,
  isEssayAuthor,
}: {
  prId: string;
  isEssayAuthor: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'merge' | 'close' | null>(null);

  async function handleMerge() {
    setLoading(true);
    setAction('merge');
    try {
      const res = await fetch(`/api/prs/${prId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge' }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/essays/${data.essay?.slug ?? ''}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
      setAction(null);
    }
  }

  async function handleClose() {
    setLoading(true);
    setAction('close');
    try {
      const res = await fetch(`/api/prs/${prId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setAction(null);
    }
  }

  return (
    <div className="flex gap-2">
      {isEssayAuthor && (
        <button
          type="button"
          onClick={handleMerge}
          disabled={loading}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {action === 'merge' && loading ? 'Merging...' : 'Merge'}
        </button>
      )}
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {action === 'close' && loading ? 'Closing...' : 'Close'}
      </button>
    </div>
  );
}
