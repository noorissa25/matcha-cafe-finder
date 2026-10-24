// Small text utilities for the recommender. Deliberately simple: lowercase word
// tokens, a short stopword list, and tags kept as single multi-word terms.

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has",
  "have", "i", "in", "is", "it", "its", "of", "on", "or", "so", "that", "the",
  "this", "to", "too", "very", "was", "were", "with", "really", "bit", "quite",
  "just", "not", "more", "less", "than", "there", "they", "we", "you", "my",
  "our", "also", "some", "would", "will", "again", "here", "had", "one",
  // Words every cafe and tasting shares; they say nothing about taste.
  "matcha", "coffee", "latte", "lattes", "tea", "cafe", "drink", "drinks",
  "cup", "cups", "menu", "shop", "serving", "serves",
]);

export type TermVector = Map<string, number>;

/** Lowercase word tokens with stopwords and very short words removed. */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [])
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Parse the comma-separated tag column into clean, unique tags. */
export function parseTags(tags: string): string[] {
  const seen = new Set<string>();
  for (const raw of tags.split(",")) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (tag) seen.add(tag);
  }
  return [...seen];
}

/** Term counts for free text plus tags. Tags count as whole terms with extra weight. */
export function termCounts(text: string, tags: string[] = [], tagWeight = 2): TermVector {
  const counts: TermVector = new Map();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  for (const tag of tags) {
    const term = `#${tag}`;
    counts.set(term, (counts.get(term) ?? 0) + tagWeight);
    // Also credit the tag's words so "ceremonial grade" matches notes that say "ceremonial".
    for (const token of tokenize(tag)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return counts;
}

/** Smoothed inverse document frequency over a set of documents. */
export function inverseDocumentFrequency(docs: TermVector[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const term of doc.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const n = docs.length;
  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((1 + n) / (1 + count)) + 1);
  }
  return idf;
}

export function weight(vector: TermVector, idf: Map<string, number>): TermVector {
  const out: TermVector = new Map();
  for (const [term, value] of vector) {
    out.set(term, value * (idf.get(term) ?? 1));
  }
  return out;
}

export function norm(vector: TermVector): number {
  let sum = 0;
  for (const value of vector.values()) sum += value * value;
  return Math.sqrt(sum);
}

/** Display form of a term: tags lose their "#" marker. */
export function displayTerm(term: string): string {
  return term.startsWith("#") ? term.slice(1) : term;
}
