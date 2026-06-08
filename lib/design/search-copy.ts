/** Search result count — mockup `.search-eyebrow` copy. */
export const searchResultsLabel = (count: number) =>
  `${count} result${count === 1 ? "" : "s"}`;

export const searchNoMatchesLead = (query: string) =>
  `Nothing matched "${query}".`;

export const searchNoMatchesHint =
  "Check the spelling or try a different word.";
