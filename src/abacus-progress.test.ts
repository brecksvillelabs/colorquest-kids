import { describe, expect, it } from "vitest";
import {
  emptyFamilyData,
  emptyProgress,
  recordAbacusResult,
  recordAbacusVisit,
  type FamilyData,
} from "./profile-data";

function family(): FamilyData {
  const data = emptyFamilyData();
  return {
    ...data,
    profiles: [{ id: "kid", name: "Kid", age: 7, avatar: "🦊", createdAt: "2026-10-09T00:00:00.000Z" }],
    activeProfileId: "kid",
    progress: { kid: emptyProgress() },
  };
}

describe("Abacus Lab progress", () => {
  it("remembers a visit without pretending a stage was completed", () => {
    const next = recordAbacusVisit(family(), "kid", { stageId: "digits", mode: "learn" });
    expect(next.progress.kid.lastActivity).toBe("math");
    expect(next.progress.kid.learning.abacus.hasVisited).toBe(true);
    expect(next.progress.kid.learning.abacus.lastStageId).toBe("digits");
    expect(next.progress.kid.learning.abacus.attempts).toBe(0);
  });

  it("marks a stage explored after three successful builds, not one tap", () => {
    let data = family();
    for (let index = 0; index < 3; index += 1) {
      data = recordAbacusResult(data, "kid", {
        stageId: "digits",
        mode: "learn",
        correct: true,
        value: 7,
      });
    }
    expect(data.progress.kid.learning.abacus.stageCorrect.digits).toBe(3);
    expect(data.progress.kid.learning.abacus.completedStages).toContain("digits");
    expect(data.progress.kid.learning.abacus.correct).toBe(3);
  });

  it("does not count free-abacus exploration as scored practice", () => {
    const next = recordAbacusResult(family(), "kid", {
      stageId: "digits",
      mode: "free",
      correct: true,
      value: 123,
    });
    expect(next.progress.kid.learning.abacus.hasVisited).toBe(true);
    expect(next.progress.kid.learning.abacus.attempts).toBe(0);
    expect(next.progress.kid.learning.abacus.correct).toBe(0);
  });
});
