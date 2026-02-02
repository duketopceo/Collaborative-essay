/**
 * Generates a unified diff between two strings (line-by-line).
 * Used for PR proposed content vs current essay content.
 */
export function computeUnifiedDiff(
  oldText: string,
  newText: string,
  options: { contextLines?: number; oldLabel?: string; newLabel?: string } = {}
): string {
  const { contextLines = 3, oldLabel = 'original', newLabel = 'proposed' } = options;
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const result: string[] = [
    `--- a/${oldLabel}`,
    `+++ b/${newLabel}`,
  ];

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push(' ' + (oldLines[i] ?? ''));
      i++;
      j++;
      continue;
    }

    const removalStart = i;
    while (i < oldLines.length && (j >= newLines.length || oldLines[i] !== newLines[j])) {
      i++;
    }
    const removalEnd = i;

    const additionStart = j;
    while (j < newLines.length && (i >= oldLines.length || oldLines[i] !== newLines[j])) {
      j++;
    }
    const additionEnd = j;

    if (removalStart < removalEnd || additionStart < additionEnd) {
      const oldStart = removalStart + 1;
      const oldCount = removalEnd - removalStart;
      const newStart = additionStart + 1;
      const newCount = additionEnd - additionStart;
      result.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);

      for (let k = removalStart; k < removalEnd; k++) {
        result.push('-' + (oldLines[k] ?? ''));
      }
      for (let k = additionStart; k < additionEnd; k++) {
        result.push('+' + (newLines[k] ?? ''));
      }
    }
  }

  return result.join('\n');
}

/**
 * Count additions and deletions from a unified diff string.
 */
export function countDiffStats(diff: string): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  }
  return { additions, deletions };
}
