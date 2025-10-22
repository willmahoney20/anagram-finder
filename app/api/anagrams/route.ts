import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const input = searchParams
    .get("search")
    ?.toLowerCase()
    ?.replace(/[^a-z0-9]/g, "");

  if (!input) return Response.json({ anagrams: [] });

  const wordList = await fetch(
    "https://raw.githubusercontent.com/dwyl/english-words/master/words.txt"
  )
    .then((res) => res.text())
    .then((text) => text.split("\n").map((w) => w.trim()));

  const sorted = input.split("").sort().join("");

  const anagrams = wordList.filter(
    (word) =>
      word
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .split("")
        .sort()
        .join("") === sorted
  );

  return Response.json({ anagrams });
}
