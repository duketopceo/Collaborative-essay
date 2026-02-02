'use client';

import { useState } from 'react';

type AIAssistantPanelProps = {
  onExpand?: (section: string) => void;
  onImprove?: (content: string) => void;
  selectedText?: string;
  disabled?: boolean;
};

export function AIAssistantPanel({
  onExpand,
  onImprove,
  selectedText = '',
  disabled = false,
}: AIAssistantPanelProps) {
  const [loading, setLoading] = useState<'expand' | 'improve' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExpand() {
    if (!selectedText.trim()) return;
    setError(null);
    setLoading('expand');
    try {
      const res = await fetch('/api/ai/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: selectedText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      onExpand?.(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  async function handleImprove() {
    const text = selectedText.trim() || '';
    if (!text) return;
    setError(null);
    setLoading('improve');
    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      onImprove?.(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
      <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
        AI Assistant
      </p>
      {selectedText ? (
        <p className="mb-2 truncate text-xs text-neutral-500 dark:text-neutral-500">
          {selectedText.length} chars selected
        </p>
      ) : (
        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-500">
          Select text to expand or improve
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExpand}
          disabled={disabled || !selectedText.trim() || loading !== null}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {loading === 'expand' ? '...' : 'Expand'}
        </button>
        <button
          type="button"
          onClick={handleImprove}
          disabled={disabled || !selectedText.trim() || loading !== null}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {loading === 'improve' ? '...' : 'Improve'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
