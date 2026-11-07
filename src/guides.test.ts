import { describe, expect, it } from "vitest";
import { ACTIVITY_GUIDES, ALL_GUIDES, FIFI, SPROUT, guideFor } from "./guides";
import { ACTIVITY_KEYS } from "./profile-data";

describe("Helpers", () => {
  it("gives every activity its own helper", () => {
    for (const activity of ACTIVITY_KEYS) {
      const guide = guideFor(activity);
      expect(guide).toBeTruthy();
      expect(guide.name.length).toBeGreaterThan(0);
    }
  });

  it("never shows the same character on two different activities", () => {
    const ids = ACTIVITY_KEYS.map((activity) => guideFor(activity).id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = ACTIVITY_KEYS.map((activity) => guideFor(activity).name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("hands Stories over to Sprout once the child reads for themselves", () => {
    expect(guideFor("stories").id).toBe("willow");
    expect(guideFor("stories", { readingGarden: true }).id).toBe("sprout");
    // The switch only applies to Stories; nothing else changes character.
    expect(guideFor("math", { readingGarden: true }).id).toBe("tally");
  });

  it("keeps Fifi out of the activity roster, since she owns the whole app", () => {
    expect(Object.values(ACTIVITY_GUIDES).some((guide) => guide.id === FIFI.id)).toBe(false);
  });

  it("gives every character what the bubble needs to render", () => {
    for (const guide of ALL_GUIDES) {
      expect(guide.emoji.length).toBeGreaterThan(0);
      expect(guide.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(guide.tip.length).toBeGreaterThan(20);
      expect(guide.tipTitle.length).toBeGreaterThan(0);
      expect(guide.blurb.length).toBeGreaterThan(0);
    }
  });

  it("gives each character a tip in their own voice, not a shared one", () => {
    const tips = ALL_GUIDES.map((guide) => guide.tip);
    expect(new Set(tips).size).toBe(tips.length);
  });

  it("does not reuse Pip, who is already a storybook character", () => {
    for (const guide of ALL_GUIDES) {
      expect(guide.name.toLowerCase()).not.toBe("pip");
    }
  });

  it("keeps ids stable, because dismissed tips are remembered by id", () => {
    // Changing an id silently re-shows a tip a child already dismissed.
    expect(ALL_GUIDES.map((guide) => guide.id).sort()).toEqual([
      "bloom", "bolt", "clink", "compass", "fifi", "fizz", "scribble", "sprout", "tally", "willow",
    ]);
  });

  it("falls back to Fifi for anything unrecognised", () => {
    expect(guideFor("not-an-activity" as never).id).toBe(FIFI.id);
    expect(SPROUT.id).toBe("sprout");
  });
});
