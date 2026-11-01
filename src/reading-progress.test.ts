import { describe, expect, it } from "vitest";
import {
  PROFILE_STORAGE_KEY,
  emptyFamilyData,
  emptyProgress,
  loadFamilyData,
  recordLetterHeard,
  recordReadingBand,
  recordReadingFinish,
  recordReadingPage,
  toggleSavedWord,
  type FamilyData,
} from "./profile-data";

function family(): FamilyData {
  const data = emptyFamilyData();
  return {
    ...data,
    profiles: [{ id: "kid", name: "Kid", age: 6, avatar: "🦊", createdAt: "2026-10-09T00:00:00.000Z" }],
    activeProfileId: "kid",
    progress: { kid: emptyProgress() },
  };
}

const reading = (data: FamilyData) => data.progress.kid.learning.reading;

describe("Reading Garden progress", () => {
  it("counts a page once, however often it is re-read", () => {
    let data = family();
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 0, pageCount: 4, newWords: ["seed"] });
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 1, pageCount: 4, newWords: ["dirt"] });
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 0, pageCount: 4, newWords: ["seed"] });
    expect(reading(data).pagesSeen).toEqual(["seed:0", "seed:1"]);
    expect(reading(data).wordsMet.sort()).toEqual(["dirt", "seed"]);
    // The Reading Garden lives inside Stories, so that is what resumes.
    expect(data.progress.kid.lastActivity).toBe("stories");
  });

  it("keeps the furthest page, so going back to re-read costs nothing", () => {
    let data = family();
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 0, pageCount: 4, newWords: [] });
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 2, pageCount: 4, newWords: [] });
    expect(reading(data).bookmarks.seed).toBe(3);
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 0, pageCount: 4, newWords: [] });
    expect(reading(data).bookmarks.seed).toBe(3);
  });

  it("never parks a bookmark past the last page", () => {
    let data = family();
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 3, pageCount: 4, newWords: [] });
    expect(reading(data).bookmarks.seed).toBe(3);
  });

  it("plants one flower per story and retires the bookmark", () => {
    let data = family();
    data = recordReadingPage(data, "kid", { storyId: "seed", pageIndex: 0, pageCount: 4, newWords: [] });
    const finish = { storyId: "seed", pageKeys: ["seed:0", "seed:1", "seed:2", "seed:3"], newWords: ["grow"] };
    data = recordReadingFinish(data, "kid", finish);
    expect(reading(data).completedStories).toEqual(["seed"]);
    expect(reading(data).pagesSeen).toHaveLength(4);
    expect(reading(data).bookmarks.seed).toBeUndefined();

    data = recordReadingFinish(data, "kid", finish);
    expect(reading(data).completedStories).toEqual(["seed"]);
    expect(reading(data).pagesSeen).toHaveLength(4);
  });

  it("treats saving a word as a toggle", () => {
    let data = family();
    data = toggleSavedWord(data, "kid", { word: "mango", meaning: "A sweet orange fruit." });
    expect(reading(data).savedWords).toEqual([{ word: "mango", meaning: "A sweet orange fruit." }]);
    data = toggleSavedWord(data, "kid", { word: "mango", meaning: "A sweet orange fruit." });
    expect(reading(data).savedWords).toEqual([]);
  });

  it("remembers a shelf a grown-up chose, and letters explored", () => {
    let data = recordReadingBand(family(), "kid", "bloomer");
    expect(reading(data).band).toBe("bloomer");
    data = recordLetterHeard(data, "kid", "m");
    data = recordLetterHeard(data, "kid", "m");
    expect(reading(data).lettersHeard).toEqual(["m"]);
  });
});

describe("Existing profiles", () => {
  it("gain reading without losing anything they already had", () => {
    // A profile saved before the Reading Garden existed: no "read" activity,
    // no reading signals. It must survive the upgrade intact.
    const legacy = {
      version: 3,
      profiles: [{ id: "kid", name: "Kid", age: 6, avatar: "🦊", createdAt: "2026-01-01T00:00:00.000Z" }],
      activeProfileId: "kid",
      progress: {
        kid: {
          activities: {
            draw: { completed: ["a"], lastPage: 4 },
            color: { completed: [], lastPage: 1 },
            puzzle: { completed: [], lastPage: 1 },
            stories: { completed: [], lastPage: 1 },
            math: { completed: ["m1"], lastPage: 3 },
            science: { completed: [], lastPage: 1 },
            lab: { completed: [], lastPage: 1 },
            discover: { completed: [], lastPage: 1 },
          },
          lastActivity: "math",
          legacyCompleted: 2,
          learning: { likedLessons: ["m1"] },
        },
      },
    };
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(legacy));

    const loaded = loadFamilyData();
    const progress = loaded.progress.kid;

    expect(progress.learning.reading).toEqual({
      band: null,
      completedStories: [],
      pagesSeen: [],
      wordsMet: [],
      savedWords: [],
      bookmarks: {},
      lettersHeard: [],
    });

    // Everything that was already there is untouched.
    expect(progress.activities.draw).toEqual({ completed: ["a"], lastPage: 4 });
    expect(progress.activities.math).toEqual({ completed: ["m1"], lastPage: 3 });
    expect(progress.legacyCompleted).toBe(2);
    expect(progress.learning.likedLessons).toEqual(["m1"]);
    expect(progress.learning.abacus.hasVisited).toBe(false);
  });
});

describe("Which shelf a child lands on", () => {
  it("follows the child's age until a grown-up chooses", () => {
    // A six-year-old should not be handed the four-year-old shelf just
    // because that was the stored default.
    const fresh = family();
    expect(fresh.progress.kid.learning.reading.band).toBeNull();

    const chosen = recordReadingBand(fresh, "kid", "sapling");
    expect(chosen.progress.kid.learning.reading.band).toBe("sapling");
  });
});
