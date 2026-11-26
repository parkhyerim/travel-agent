import { placeDocs } from "../data/placeDocs";

function scoreDoc(query: string, text: string) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();

  return queryWords.reduce((score, word) => {
    if (textLower.includes(word)) {
      return score + 1;
    }
    return score;
  }, 0);
}

export async function searchPlaceInfo(input: string) {
  const scoredDocs = placeDocs
    .map((doc) => {
      const searchableText = `${doc.title} ${doc.location} ${doc.content}`;

      return {
        doc,
        score: scoreDoc(input, searchableText),
      };
    })
    .sort((a, b) => b.score - a.score);

  const topDocs = scoredDocs.filter((item) => item.score > 0).slice(0, 3);

  if (topDocs.length === 0) {
    return "관련 문서를 찾지 못했습니다.";
  }

  return topDocs
    .map(
      ({ doc }) => `
Title: ${doc.title}
Location: ${doc.location}
Content: ${doc.content}
`
    )
    .join("\n---\n");
}