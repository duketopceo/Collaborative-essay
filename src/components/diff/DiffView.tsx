'use client';

type DiffViewProps = {
  diff: string;
  className?: string;
};

export function DiffView({ diff, className = '' }: DiffViewProps) {
  const lines = diff.split('\n');

  return (
    <div
      className={`overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
    >
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, i) => {
            const type = line.startsWith('+')
              ? 'add'
              : line.startsWith('-')
                ? 'remove'
                : line.startsWith('@@')
                  ? 'hunk'
                  : 'context';
            return (
              <tr key={i} className="border-b border-neutral-200 dark:border-neutral-700">
                <td className="w-8 select-none border-r border-neutral-200 bg-neutral-100 px-2 py-0.5 text-right text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500">
                  {i + 1}
                </td>
                <td
                  className={`whitespace-pre-wrap px-2 py-0.5 ${
                    type === 'add'
                      ? 'bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                      : type === 'remove'
                        ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                        : type === 'hunk'
                          ? 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {line}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
