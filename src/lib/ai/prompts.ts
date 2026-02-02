export const PROMPTS = {
  expand: (section: string, context?: string) =>
    `You are helping improve a collaborative essay. Expand the following section with more detail, examples, or clarity. Keep the same tone and style. Output only the expanded markdown text, no preamble.\n\nSection to expand:\n${section}\n${context ? `\nContext from the rest of the essay:\n${context.slice(0, 1500)}\n` : ''}`,

  improve: (content: string) =>
    `You are an editor. Improve the following essay text for grammar, clarity, and flow. Preserve the meaning and structure. Output only the improved markdown text, no preamble.\n\n---\n\n${content}`,

  reviewPR: (title: string, description: string, currentContent: string, proposedContent: string) =>
    `You are reviewing a pull request for a collaborative essay. Provide a brief review (2-4 sentences) covering: 1) Does it improve the essay? 2) Any issues with clarity or consistency? 3) Recommendation: APPROVED or CHANGES_REQUESTED. End with exactly one line: RECOMMENDATION: APPROVED or RECOMMENDATION: CHANGES_REQUESTED.\n\nPR title: ${title}\n${description ? `Description: ${description}\n` : ''}\nCurrent content (excerpt):\n${currentContent.slice(0, 2000)}\n\nProposed content (excerpt):\n${proposedContent.slice(0, 2000)}`,

  summarize: (content: string) =>
    `Summarize the following essay in 2-4 sentences. Output only the summary.\n\n---\n\n${content.slice(0, 4000)}`,

  suggestImprovement: (title: string, content: string) =>
    `You are helping improve a collaborative essay. Suggest a concrete improvement (e.g. add a paragraph, clarify a section, fix flow). Output a short paragraph describing the suggestion and then "---SUGGESTED CONTENT---" followed by the improved markdown for the relevant section only. If no change needed, output "NO_SUGGESTION" and a brief reason. Essay title: ${title}\n\nContent:\n${content.slice(0, 3000)}`,
} as const;
