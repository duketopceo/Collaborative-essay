'use client';

import { MarkdownPreview } from './MarkdownPreview';

type MarkdownEditorSplitProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
};

export function MarkdownEditorSplit({
  value,
  onChange,
  placeholder = '# Start writing...',
  minRows = 16,
  className = '',
}: MarkdownEditorSplitProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Edit (Markdown)
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          spellCheck="false"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Preview
        </label>
        <div className="min-h-[200px] rounded-md border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-800">
          <MarkdownPreview content={value} />
        </div>
      </div>
    </div>
  );
}
