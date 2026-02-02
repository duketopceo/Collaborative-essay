'use client';

import { useState } from 'react';
import { MarkdownPreview } from './MarkdownPreview';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  showPreview?: boolean;
  className?: string;
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '# Start writing...',
  minRows = 14,
  showPreview: initialShowPreview = true,
  className = '',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(initialShowPreview);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`rounded-t px-3 py-2 text-sm font-medium ${
            !showPreview
              ? 'border border-b-0 border-neutral-300 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`rounded-t px-3 py-2 text-sm font-medium ${
            showPreview
              ? 'border border-b-0 border-neutral-300 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
          }`}
        >
          Preview
        </button>
      </div>
      {showPreview ? (
        <div className="min-h-[200px] rounded-md border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-800">
          <MarkdownPreview content={value} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          spellCheck="false"
        />
      )}
    </div>
  );
}
