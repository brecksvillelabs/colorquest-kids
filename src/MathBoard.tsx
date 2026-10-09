import { useEffect, useState } from "react";
import AbacusBoard from "./AbacusBoard";
import LearningBoard from "./LearningBoard";
import type { MathRepresentation } from "./adaptive-math";
import type { AbacusProgress, InterestKey, MathPracticeOutcome, MathPracticeState } from "./profile-data";

type MathMode = "trail" | "abacus";

function loadMathMode(profileId: string): MathMode {
  if (typeof window === "undefined") return "trail";
  try {
    return window.localStorage.getItem(`colorquest-math-mode-v1:${profileId}`) === "abacus" ? "abacus" : "trail";
  } catch {
    return "trail";
  }
}

function saveMathMode(profileId: string, mode: MathMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`colorquest-math-mode-v1:${profileId}`, mode);
  } catch {
    // The Math switch still works when storage is unavailable.
  }
}

export default function MathBoard({
  age,
  childAge,
  profileId,
  page,
  liked,
  mathPractice,
  mathJourney,
  abacusProgress,
  onComplete,
  onAttempt,
  onMathAnswer,
  onLike,
  onSelectLesson,
  onAbacusResult,
  onAbacusVisit,
  onAbacusModeChange,
}: {
  age: number;
  childAge: number;
  profileId: string;
  page: number;
  liked: boolean;
  mathPractice?: MathPracticeState;
  mathJourney: MathPracticeOutcome[];
  abacusProgress: AbacusProgress;
  onComplete: () => void;
  onAttempt: () => void;
  onMathAnswer: (result: {
    lessonId: string;
    questionId: string;
    correct: boolean;
    representation: MathRepresentation;
    sessionId: string;
  }) => void;
  onLike: (lessonId: string, interest: InterestKey) => void;
  onSelectLesson: (page: number) => void;
  onAbacusResult: (result: {
    stageId: string;
    mode: "learn" | "practice" | "free";
    correct: boolean;
    value: number;
  }) => void;
  onAbacusVisit: (visit: {
    stageId: string;
    mode: "learn" | "practice" | "free";
  }) => void;
  onAbacusModeChange?: (active: boolean) => void;
}) {
  const [mode, setMode] = useState<MathMode>(() => loadMathMode(profileId));

  useEffect(() => {
    saveMathMode(profileId, mode);
    onAbacusModeChange?.(mode === "abacus");
    return () => onAbacusModeChange?.(false);
  }, [profileId, mode, onAbacusModeChange]);

  return (
    <section className={`math-home ${mode === "abacus" ? "abacus-active" : "trail-active"}`} aria-label="Math">
      <div className="math-path-switch" aria-label="Choose a Math path">
        <button className={mode === "trail" ? "active" : ""} onClick={() => setMode("trail")} aria-pressed={mode === "trail"}>
          <span aria-hidden="true">🧠</span>
          <strong>{childAge <= 6 ? "Number Games" : "Math Trail"}</strong>
          <small>Ideas, stories, fresh questions</small>
        </button>
        <button className={mode === "abacus" ? "active" : ""} onClick={() => setMode("abacus")} aria-pressed={mode === "abacus"}>
          <span aria-hidden="true">🧮</span>
          <strong>{childAge <= 3 ? "Abacus Play" : "Abacus Lab"}</strong>
          <small>Learn and practice on a real soroban</small>
        </button>
      </div>

      {mode === "trail" ? (
        <LearningBoard
          subject="math"
          age={age}
          childAge={childAge}
          profileId={profileId}
          page={page}
          liked={liked}
          mathPractice={mathPractice}
          mathJourney={mathJourney}
          onComplete={onComplete}
          onAttempt={onAttempt}
          onMathAnswer={onMathAnswer}
          onLike={onLike}
          onSelectLesson={onSelectLesson}
        />
      ) : (
        <AbacusBoard
          childAge={childAge}
          profileId={profileId}
          progress={abacusProgress}
          onResult={onAbacusResult}
          onVisit={onAbacusVisit}
        />
      )}
    </section>
  );
}
