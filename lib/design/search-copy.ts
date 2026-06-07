/** Search result count — mockup `.search-eyebrow` copy. */
export const searchResultsLabel = (count: number) =>
  `${count} result${count === 1 ? "" : "s"}`;

export const searchNoMatchesBody = (query: string) =>
  `Nothing matched "${query}". Check the spelling or try a different word.`;
