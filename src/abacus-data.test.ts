import { describe, expect, it } from "vitest";
import { ABACUS_STAGES, buildAbacusChallenge, recommendedStageId, stagesForAge } from "./abacus-data";
import { maxValueForRods } from "./abacus-engine";

describe("Abacus Lab curriculum", () => {
  it("keeps toddler use exploratory and unlocks formal stages with age", () => {
    expect(stagesForAge(2).map((stage) => stage.id)).toEqual(["bead-play"]);
    expect(stagesForAge(4).map((stage) => stage.id)).toContain("digits");
    expect(stagesForAge(6).map((stage) => stage.id)).toContain("friends-ten");
    expect(stagesForAge(8).map((stage) => stage.id)).toContain("multiply-divide");
    expect(stagesForAge(10).map((stage) => stage.id)).toContain("advanced-mixed");
  });

  it("keeps every stage distinct and ordered", () => {
    expect(new Set(ABACUS_STAGES.map((stage) => stage.id)).size).toBe(ABACUS_STAGES.length);
    expect(ABACUS_STAGES.map((stage) => stage.order)).toEqual([...ABACUS_STAGES.keys()]);
  });

  it("generates stable, representable challenges", () => {
    for (const stage of ABACUS_STAGES) {
      const childAge = Math.max(stage.minAge, 10);
      for (let sequence = 0; sequence < 12; sequence += 1) {
        const first = buildAbacusChallenge(stage.id, childAge, sequence, "test");
        const second = buildAbacusChallenge(stage.id, childAge, sequence, "test");
        expect(first).toEqual(second);
        expect(first.startValue).toBeGreaterThanOrEqual(0);
        expect(first.targetValue).toBeGreaterThanOrEqual(0);
        expect(first.startValue).toBeLessThanOrEqual(maxValueForRods(first.rods));
        expect(first.targetValue).toBeLessThanOrEqual(maxValueForRods(first.rods));
        expect(first.prompt).toBeTruthy();
        expect(first.hint).toBeTruthy();
      }
    }
  });

  it("recommends the first unexplored stage without locking later stages", () => {
    expect(recommendedStageId(8, [])).toBe("bead-play");
    expect(recommendedStageId(8, ["bead-play", "digits"])).toBe("place-value");
    expect(stagesForAge(8).some((stage) => stage.id === "multiply-divide")).toBe(true);
  });
});
