/**
 * Simple merge: accept proposed content as the new content.
 * Conflict detection: if the essay's current content has changed since
 * the PR was created (i.e. base content differs), we could reject or
 * attempt a 3-way merge. For MVP we accept the proposed content on merge.
 */
export function mergeContent(
  _baseContent: string,
  proposedContent: string
): string {
  return proposedContent;
}
