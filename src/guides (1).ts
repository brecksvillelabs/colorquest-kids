import type { ActivityKey } from "./profile-data";

/**
 * The helpers.
 *
 * Fifi is the guide for the app as a whole: she greets a child at the door
 * and handles the safety dialogs ("your picture is safe", "start a fresh
 * page?") wherever they appear. Inside an activity, a specialist takes over,
 * so the voice offering a hint about mixing colors is not the same one
 * talking about place value.
 *
 * Everything a character is lives in this file. To rename one, change `name`
 * here and nothing else needs touching. To give one real artwork instead of
 * an emoji, drop the file in public/mascot/ and add `mascotFile`.
 */

export type Guide = {
  id: string;
  name: string;
  /** Stand-in face until hand-drawn art exists. */
  emoji: string;
  /** Filename inside public/mascot/. Falls back to the emoji when absent. */
  mascotFile?: string;
  /** Tints the speech bubble so each helper reads as a different character. */
  accent: string;
  /** Who they are, in one line, for a grown-up reading the settings page. */
  blurb: string;
  /** Heading above the hint. */
  tipTitle: string;
  /** The hint itself. */
  tip: string;
};

export const FIFI: Guide = {
  id: "fifi",
  name: "Fifi",
  emoji: "🦊",
  mascotFile: "fifi-color-spark.png",
  accent: "#7356cf",
  blurb: "Your guide to the whole app. She keeps your work safe and shows you around.",
  tipTitle: "Fifi's creative spark",
  tip: "Pick any door you like. You can always come back and try a different one.",
};

/** One specialist per activity. Keys match ActivityKey exactly. */
export const ACTIVITY_GUIDES: Record<ActivityKey, Guide> = {
  draw: {
    id: "scribble",
    name: "Scribble",
    emoji: "🦝",
    accent: "#e6524b",
    blurb: "A raccoon who believes first tries are supposed to be messy.",
    tipTitle: "Scribble's messy-first idea",
    tip: "Try one shape, one brush, and one color you have never combined before. New ideas often begin with a tiny experiment!",
  },
  color: {
    id: "bloom",
    name: "Bloom",
    emoji: "🦋",
    accent: "#a855c9",
    blurb: "A butterfly who has never once colored inside the lines on purpose.",
    tipTitle: "Bloom's color idea",
    tip: "Colors do not have to copy real life. A purple ocean or golden elephant can begin a wonderful story.",
  },
  puzzle: {
    id: "clink",
    name: "Clink",
    emoji: "🦉",
    accent: "#2f8f9d",
    blurb: "An owl who would rather think twice than move once.",
    tipTitle: "Clink's thinking trick",
    tip: "Slow thinking is strong thinking. Name the rule before you choose a piece.",
  },
  stories: {
    id: "willow",
    name: "Willow",
    emoji: "🦌",
    accent: "#4f7c41",
    blurb: "A deer who listens to a story twice before saying a word about it.",
    tipTitle: "Willow's story idea",
    tip: "Listen first if a story is new, then try reading it yourself. Tap any word you are unsure of.",
  },
  math: {
    id: "tally",
    name: "Tally",
    emoji: "🐿️",
    accent: "#e8a93a",
    blurb: "A squirrel who counts absolutely everything, twice.",
    tipTitle: "Tally's number idea",
    tip: "If a number feels tricky, draw it, build it, or tell a small story about it.",
  },
  science: {
    id: "fizz",
    name: "Fizz",
    emoji: "🐸",
    accent: "#36a37a",
    blurb: "A frog whose favourite question is always the next one.",
    tipTitle: "Fizz wonders",
    tip: "Scientists are allowed to change their minds when new evidence appears. That is how learning grows.",
  },
  lab: {
    id: "bolt",
    name: "Bolt",
    emoji: "🦎",
    accent: "#dd7230",
    blurb: "A gecko who guesses out loud before every experiment.",
    tipTitle: "Bolt's experiment rule",
    tip: "Make a prediction first. A surprising result is useful evidence, not a mistake.",
  },
  discover: {
    id: "compass",
    name: "Compass",
    emoji: "🦅",
    accent: "#3f6fb5",
    blurb: "An eagle who looks at the real place before imagining a new one.",
    tipTitle: "Compass points out",
    tip: "Look closely at the real place, then imagine one new detail that could still follow its science.",
  },
};

/**
 * The Reading Garden has its own coach, because "Stories" holds two very
 * different jobs: being read to, and learning to read. Willow handles the
 * first; Sprout handles the second.
 */
export const SPROUT: Guide = {
  id: "sprout",
  name: "Sprout",
  emoji: "🌱",
  accent: "#6fa85c",
  blurb: "A seedling who is in no hurry at all, and grows a flower for every story you finish.",
  tipTitle: "Sprout's reading tip",
  tip: "Tap any word you are unsure of. Hearing a word and seeing it at the same time is how it sticks.",
};

/** Which helper is on duty, given where the child is standing. */
export function guideFor(activity: ActivityKey, options: { readingGarden?: boolean } = {}): Guide {
  if (activity === "stories" && options.readingGarden) return SPROUT;
  return ACTIVITY_GUIDES[activity] || FIFI;
}

/** Every character, for a grown-up who wants to see who their child meets. */
export const ALL_GUIDES: Guide[] = [FIFI, ...Object.values(ACTIVITY_GUIDES), SPROUT];
