import { describe, expect, it } from "vitest";
import {
  FLOWER_DESIGNS,
  PETAL_PATHS,
  PHONICS,
  READING_BANDS,
  READING_BAND_ORDER,
  READING_STORIES,
  SIGHT_WORDS,
  WORD_MEANINGS,
  bandForAge,
  buildWordCheck,
  cleanWord,
  findStory,
  flowerForStory,
  isSightWord,
  pagesInBand,
  storiesInBand,
  wordMeaning,
  wordSpansOf,
} from "./reading-data";

/** Deterministic stand-in for Math.random, so shuffles are reproducible. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

describe("Reading content", () => {
  it("defines every word a child can tap", () => {
    const missing: string[] = [];
    for (const story of READING_STORIES) {
      for (const page of story.pages) {
        for (const span of wordSpansOf(page)) {
          const word = cleanWord(span.text);
          if (!WORD_MEANINGS[word]) missing.push(`${story.id}: ${word}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("defines every word the end-of-story check can ask about", () => {
    const missing: string[] = [];
    for (const story of READING_STORIES) {
      for (const word of story.featured) {
        if (!WORD_MEANINGS[cleanWord(word)]) missing.push(`${story.id}: ${word}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("keeps story ids unique", () => {
    expect(new Set(READING_STORIES.map((story) => story.id)).size).toBe(READING_STORIES.length);
  });

  it("puts every story on a real shelf, and stocks every shelf", () => {
    for (const story of READING_STORIES) {
      expect(READING_BAND_ORDER).toContain(story.band);
    }
    for (const band of READING_BAND_ORDER) {
      expect(storiesInBand(band).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("gives a page picture for every page when a story supplies them", () => {
    for (const story of READING_STORIES) {
      if (story.pageEmoji) expect(story.pageEmoji).toHaveLength(story.pages.length);
    }
  });
});

describe("Reading difficulty", () => {
  const wordsPerPage = (storyId: string) => {
    const story = findStory(storyId)!;
    return story.pages.reduce((total, page) => total + wordSpansOf(page).length, 0) / story.pages.length;
  };
  const bandAverage = (band: Parameters<typeof storiesInBand>[0]) => {
    const stories = storiesInBand(band);
    return stories.reduce((total, story) => total + wordsPerPage(story.id), 0) / stories.length;
  };

  it("climbs from shelf to shelf", () => {
    const seedling = bandAverage("seedling");
    const sprout = bandAverage("sprout");
    const sapling = bandAverage("sapling");
    const bloomer = bandAverage("bloomer");
    expect(sprout).toBeGreaterThan(seedling);
    expect(sapling).toBeGreaterThan(sprout);
    expect(bloomer).toBeGreaterThan(sapling);
    // A six-year-old should not be handed a board book.
    expect(bloomer).toBeGreaterThan(seedling * 3);
  });

  it("gives the top shelf real stories, not four-line ones", () => {
    for (const story of storiesInBand("bloomer")) {
      expect(story.pages.length).toBeGreaterThanOrEqual(10);
      expect(story.featured.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("starts a child on the shelf that matches their age", () => {
    expect(bandForAge(2)).toBe("seedling");
    expect(bandForAge(3)).toBe("seedling");
    expect(bandForAge(4)).toBe("sprout");
    expect(bandForAge(5)).toBe("sapling");
    expect(bandForAge(7)).toBe("bloomer");
    expect(bandForAge(11)).toBe("bloomer");
  });

  it("counts the pages on a shelf", () => {
    for (const band of READING_BAND_ORDER) {
      expect(pagesInBand(band)).toBe(
        storiesInBand(band).reduce((total, story) => total + story.pages.length, 0),
      );
    }
  });
});

describe("End-of-story check", () => {
  it("skips the quiz for the youngest shelf", () => {
    expect(READING_BANDS.seedling.check).toBe(false);
    for (const story of storiesInBand("seedling")) {
      expect(buildWordCheck(story, seeded(1))).toEqual([]);
    }
  });

  it("always offers a real choice that contains the answer", () => {
    for (const story of READING_STORIES) {
      if (!READING_BANDS[story.band].check) continue;
      for (let seed = 1; seed <= 25; seed += 1) {
        const questions = buildWordCheck(story, seeded(seed));
        expect(questions.length).toBeGreaterThanOrEqual(1);
        for (const question of questions) {
          expect(question.choices.length).toBeGreaterThanOrEqual(2);
          expect(question.choices).toContain(question.answer);
          expect(new Set(question.choices).size).toBe(question.choices.length);
          expect(question.prompt).toBe(WORD_MEANINGS[question.answer]);
        }
      }
    }
  });

  it("asks the top shelf more than the middle shelves", () => {
    expect(READING_BANDS.bloomer.checkQuestions).toBe(3);
    const bloomer = storiesInBand("bloomer")[0];
    expect(buildWordCheck(bloomer, seeded(7))).toHaveLength(3);
  });
});

describe("Letter sounds", () => {
  it("covers a to z in order", () => {
    expect(PHONICS).toHaveLength(26);
    expect(PHONICS.map((entry) => entry.letter).join("")).toBe("abcdefghijklmnopqrstuvwxyz");
  });

  it("uses keywords and examples that actually contain the letter", () => {
    for (const entry of PHONICS) {
      expect(entry.keyword).toContain(entry.letter);
      expect(entry.examples).toHaveLength(3);
      for (const example of entry.examples) expect(example).toContain(entry.letter);
    }
  });

  it("gives every letter something for the voice to say", () => {
    for (const entry of PHONICS) {
      expect(entry.nameSay.length).toBeGreaterThan(0);
      expect(entry.soundSay.length).toBeGreaterThan(0);
    }
  });
});

describe("Words", () => {
  it("keeps punctuation out and combining marks in", () => {
    expect(cleanWord("up,")).toBe("up");
    expect(cleanWord("flower!")).toBe("flower");
    expect(cleanWord("didn't")).toBe("didn't");
    expect(cleanWord("café")).toBe("café");
  });

  it("knows which words are already familiar", () => {
    expect(isSightWord("The")).toBe(true);
    expect(isSightWord("rainbow")).toBe(false);
    expect(SIGHT_WORDS.size).toBeGreaterThan(20);
  });

  it("answers for a word it has never seen rather than showing nothing", () => {
    expect(wordMeaning("zzzz")).toBe("A word from your story.");
    expect(wordMeaning("Mango!")).toBe(WORD_MEANINGS.mango);
  });

  it("maps every span back to its place in the page", () => {
    const page = "Look! A big flower!";
    for (const span of wordSpansOf(page)) {
      expect(page.slice(span.start, span.end)).toBe(span.text);
    }
  });
});

describe("Flowers", () => {
  it("has more designs than stories, so no two stories share a bloom", () => {
    expect(FLOWER_DESIGNS.length).toBeGreaterThanOrEqual(READING_STORIES.length);
    const used = READING_STORIES.map((story) => flowerForStory(story.id).id);
    expect(new Set(used).size).toBe(READING_STORIES.length);
  });

  it("gives every design a drawable shape", () => {
    for (const design of FLOWER_DESIGNS) {
      expect(PETAL_PATHS[design.shape]).toBeTruthy();
      expect(design.petals).toBeGreaterThanOrEqual(5);
    }
  });

  it("keeps a story's flower stable", () => {
    expect(flowerForStory("seed").id).toBe(flowerForStory("seed").id);
    expect(flowerForStory("seed").id).not.toBe(flowerForStory("sam-ball").id);
  });
});
