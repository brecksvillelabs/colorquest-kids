import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildAbacusChallenge,
  recommendedStageId,
  stagesForAge,
  type AbacusMode,
  type AbacusStageId,
} from "./abacus-data";
import {
  defaultRodCount,
  digitToSoroban,
  digitsFromValue,
  formatNumber,
  freeRodChoices,
  lowerTapTarget,
  placeValueName,
  placeValueShort,
  setLowerCount,
  setUpperBead,
  valueFromDigits,
} from "./abacus-engine";
import type { AbacusProgress } from "./profile-data";
import { SpeakButton } from "./SpeechProvider";

type AbacusResult = {
  stageId: string;
  mode: AbacusMode;
  correct: boolean;
  value: number;
};

type AbacusVisit = {
  stageId: string;
  mode: AbacusMode;
};

type SavedUi = {
  mode?: AbacusMode;
  stageId?: string;
  freeRods?: number;
  freeValue?: number;
  showLabels?: boolean;
};

function loadUi(profileId: string): SavedUi {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(`colorquest-abacus-ui-v1:${profileId}`) || "{}") as SavedUi;
  } catch {
    return {};
  }
}

function saveUi(profileId: string, value: SavedUi) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`colorquest-abacus-ui-v1:${profileId}`, JSON.stringify(value));
  } catch {
    // Private browsing can block local storage. The abacus remains usable.
  }
}

function StageProgress({ count, complete }: { count: number; complete: boolean }) {
  const safe = Math.max(0, Math.min(3, count));
  return (
    <span className="abacus-stage-progress" aria-label={complete ? "Stage explored" : `${safe} of 3 successful builds`}>
      {[0, 1, 2].map((index) => <i key={index} className={index < safe ? "done" : ""} />)}
    </span>
  );
}

function Soroban({
  digits,
  onChange,
  showLabels,
}: {
  digits: number[];
  onChange: (next: number[]) => void;
  showLabels: boolean;
}) {
  const pointer = useRef<{ key: string; y: number } | null>(null);
  const rodWidth = 84;
  const margin = 34;
  const beamY = 132;
  const width = margin * 2 + digits.length * rodWidth;
  const height = showLabels ? 398 : 362;

  const finishPointer = (
    key: string,
    y: number,
    tap: () => void,
    swipeUp: () => void,
    swipeDown: () => void,
  ) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.key !== key) {
      tap();
      return;
    }
    const delta = y - start.y;
    if (delta < -10) swipeUp();
    else if (delta > 10) swipeDown();
    else tap();
  };

  return (
    <div className="soroban-scroll" aria-label={`Interactive soroban showing ${formatNumber(valueFromDigits(digits))}`}>
      <svg
        className="soroban"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: `${Math.max(360, width)}px` }}
        role="group"
        aria-label="Interactive Japanese soroban"
      >
        <rect className="soroban-frame" x="10" y="10" width={width - 20} height="338" rx="22" />
        <rect className="soroban-inner" x="23" y="24" width={width - 46} height="310" rx="14" />
        <rect className="soroban-beam" x="20" y={beamY - 8} width={width - 40} height="16" rx="8" />

        {digits.map((digit, index) => {
          const state = digitToSoroban(digit);
          const x = margin + rodWidth * index + rodWidth / 2;
          const positionFromRight = digits.length - index - 1;
          const rodName = placeValueName(positionFromRight);
          const upperY = state.upperActive ? 101 : 53;
          return (
            <g key={`rod-${index}`} className="soroban-rod">
              <line className="soroban-rod-line" x1={x} x2={x} y1="30" y2="330" />
              <circle className="soroban-dot" cx={x} cy={beamY} r="4.5" />

              <g
                role="button"
                tabIndex={0}
                aria-pressed={state.upperActive}
                aria-label={`${rodName} 5-bead, ${state.upperActive ? "counting" : "not counting"}. Tap or swipe down to count it.`}
                className={`soroban-bead heaven ${state.upperActive ? "active" : "inactive"}`}
                onPointerDown={(event) => {
                  pointer.current = { key: `u-${index}`, y: event.clientY };
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                }}
                onPointerUp={(event) => finishPointer(
                  `u-${index}`,
                  event.clientY,
                  () => onChange(setUpperBead(digits, index, !state.upperActive)),
                  () => onChange(setUpperBead(digits, index, false)),
                  () => onChange(setUpperBead(digits, index, true)),
                )}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChange(setUpperBead(digits, index, !state.upperActive));
                  }
                  if (event.key === "ArrowDown") onChange(setUpperBead(digits, index, true));
                  if (event.key === "ArrowUp") onChange(setUpperBead(digits, index, false));
                }}
              >
                <rect className="soroban-hit" x={x - 36} y={upperY - 22} width="72" height="44" rx="18" />
                <rect className="soroban-bead-shape" x={x - 31} y={upperY - 14} width="62" height="28" rx="14" />
                <path d={`M ${x - 19} ${upperY} H ${x + 19}`} />
              </g>

              {[1, 2, 3, 4].map((beadNumber) => {
                const active = beadNumber <= state.lowerCount;
                const y = active
                  ? 168 + (beadNumber - 1) * 30
                  : 318 - (4 - beadNumber) * 30;
                const key = `l-${index}-${beadNumber}`;
                return (
                  <g
                    key={key}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    aria-label={`${rodName} lower bead ${beadNumber}, ${active ? "counting" : "not counting"}. Tap or swipe toward the beam.`}
                    className={`soroban-bead earth ${active ? "active" : "inactive"}`}
                    onPointerDown={(event) => {
                      pointer.current = { key, y: event.clientY };
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                    }}
                    onPointerUp={(event) => finishPointer(
                      key,
                      event.clientY,
                      () => onChange(setLowerCount(digits, index, lowerTapTarget(state.lowerCount, beadNumber))),
                      () => onChange(setLowerCount(digits, index, beadNumber)),
                      () => onChange(setLowerCount(digits, index, beadNumber - 1)),
                    )}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onChange(setLowerCount(digits, index, lowerTapTarget(state.lowerCount, beadNumber)));
                      }
                      if (event.key === "ArrowUp") onChange(setLowerCount(digits, index, beadNumber));
                      if (event.key === "ArrowDown") onChange(setLowerCount(digits, index, beadNumber - 1));
                    }}
                  >
                    <rect className="soroban-hit" x={x - 36} y={y - 22} width="72" height="44" rx="18" />
                    <rect className="soroban-bead-shape" x={x - 31} y={y - 13} width="62" height="26" rx="13" />
                    <path d={`M ${x - 19} ${y} H ${x + 19}`} />
                  </g>
                );
              })}

              {showLabels && (
                <g className="soroban-place-label" aria-hidden="true">
                  <text x={x} y="374">{placeValueShort(positionFromRight)}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AbacusBoard({
  childAge,
  profileId,
  progress,
  onResult,
  onVisit,
}: {
  childAge: number;
  profileId: string;
  progress: AbacusProgress;
  onResult: (result: AbacusResult) => void;
  onVisit: (visit: AbacusVisit) => void;
}) {
  const availableStages = useMemo(() => stagesForAge(childAge), [childAge]);
  const saved = useMemo(() => loadUi(profileId), [profileId]);
  const defaultStage = recommendedStageId(childAge, progress.completedStages);
  const savedStage = availableStages.some((stage) => stage.id === saved.stageId)
    ? saved.stageId as AbacusStageId
    : (progress.hasVisited && progress.lastStageId && availableStages.some((stage) => stage.id === progress.lastStageId)
      ? progress.lastStageId as AbacusStageId
      : defaultStage);
  const savedMode = saved.mode || progress.lastMode || "learn";
  const initialRods = freeRodChoices(childAge).includes(saved.freeRods || 0)
    ? saved.freeRods!
    : defaultRodCount(childAge);

  const [mode, setMode] = useState<AbacusMode>(savedMode);
  const [stageId, setStageId] = useState<AbacusStageId>(savedStage);
  const [sequence, setSequence] = useState(Math.max(0, progress.attempts));
  const [freeRods, setFreeRods] = useState(initialRods);
  const [freeValue, setFreeValue] = useState(Math.max(0, saved.freeValue ?? progress.lastValue ?? 0));
  const [showLabels, setShowLabels] = useState(saved.showLabels ?? true);
  const [digits, setDigits] = useState(() => digitsFromValue(0, 3));
  const [history, setHistory] = useState<number[][]>([]);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  const stage = availableStages.find((item) => item.id === stageId) || availableStages[0];
  const challenge = useMemo(
    () => buildAbacusChallenge(stage.id, childAge, sequence, profileId),
    [stage.id, childAge, sequence, profileId],
  );
  const guidedRods = challenge.rods;
  const activeRods = mode === "free" ? freeRods : guidedRods;
  const currentValue = valueFromDigits(digits);
  const recommended = recommendedStageId(childAge, progress.completedStages);

  useEffect(() => {
    onVisit({ stageId: stage.id, mode });
    // onVisit is intentionally not a dependency: App recreates callbacks when
    // family state changes, and this effect should represent navigation only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.id, mode]);

  useEffect(() => {
    saveUi(profileId, {
      mode,
      stageId: stage.id,
      freeRods,
      freeValue,
      showLabels,
    });
  }, [profileId, mode, stage.id, freeRods, freeValue, showLabels]);

  useEffect(() => {
    const value = mode === "free" ? freeValue : challenge.startValue;
    const rods = mode === "free" ? freeRods : guidedRods;
    const next = digitsFromValue(value, rods);
    setDigits(next);
    setHistory([]);
    setFeedback("");
    setShowHint(false);
    setSolved(false);
  }, [mode, challenge.id, freeRods, guidedRods]);

  const changeDigits = (next: number[]) => {
    setHistory((current) => [...current.slice(-11), digits]);
    setDigits(next);
    setFeedback("");
    if (mode === "free") setFreeValue(valueFromDigits(next));
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    setDigits(previous);
    setFeedback("");
    if (mode === "free") setFreeValue(valueFromDigits(previous));
  };

  const reset = () => {
    const value = mode === "free" ? 0 : challenge.startValue;
    const next = digitsFromValue(value, activeRods);
    setHistory((current) => [...current.slice(-11), digits]);
    setDigits(next);
    if (mode === "free") setFreeValue(0);
    setFeedback("");
    setShowHint(false);
    setSolved(false);
  };

  const check = () => {
    const correct = currentValue === challenge.targetValue;
    onResult({ stageId: stage.id, mode, correct, value: currentValue });
    setSolved(correct);
    if (correct) {
      setFeedback(childAge <= 5 ? "You made it! ✨" : "Correct. Read the rods once more and notice how you built it.");
    } else {
      setFeedback(currentValue < challenge.targetValue
        ? "Not there yet. Read the rods again—your value is smaller than the target."
        : "Not there yet. Read the rods again—your value is larger than the target.");
      setShowHint(true);
    }
  };

  const nextChallenge = () => {
    setSequence((value) => value + 1);
  };

  const chooseStage = (next: AbacusStageId) => {
    setStageId(next);
    setSequence((value) => value + 1);
  };

  const correctHere = Math.min(3, progress.stageCorrect[stage.id] || 0);
  const completeHere = progress.completedStages.includes(stage.id);

  return (
    <section className="abacus-lab" aria-label="Abacus Lab">
      <div className="abacus-lab-heading">
        <div>
          <p className="eyebrow">{childAge <= 3 ? "Abacus Play" : "Abacus Lab"}</p>
          <h3>{childAge <= 3 ? "Move, notice, count" : "A real soroban you can practice anywhere"}</h3>
          <p>{childAge <= 3
            ? "For little learners this is gentle bead exploration with a grown-up—not formal arithmetic."
            : "Learn the bead values, build place value, then grow into addition, subtraction, complements, multiplication, and division."}</p>
        </div>
        <div className="abacus-value-card" aria-live="polite">
          <span>Current value</span>
          <strong>{formatNumber(currentValue)}</strong>
          <SpeakButton id={`abacus-value-${currentValue}`} label="Hear value" text={`The abacus shows ${formatNumber(currentValue)}.`} />
        </div>
      </div>

      <div className="abacus-mode-switch" aria-label="Abacus mode">
        {([
          ["learn", "🧭", "Learn", "Short lessons + guided moves"],
          ["practice", "🎯", "Practice", "Fresh problems at your stage"],
          ["free", "🧮", "Free Abacus", "Use it like a real soroban"],
        ] as const).map(([id, icon, title, copy]) => (
          <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)} aria-pressed={mode === id}>
            <span aria-hidden="true">{icon}</span><strong>{title}</strong><small>{copy}</small>
          </button>
        ))}
      </div>

      {mode !== "free" && (
        <nav className="abacus-stage-rail" aria-label="Abacus learning stages">
          {availableStages.map((item) => {
            const count = Math.min(3, progress.stageCorrect[item.id] || 0);
            const complete = progress.completedStages.includes(item.id);
            return (
              <button
                key={item.id}
                className={`${item.id === stage.id ? "active" : ""} ${item.id === recommended ? "recommended" : ""}`}
                onClick={() => chooseStage(item.id)}
                aria-pressed={item.id === stage.id}
              >
                <span aria-hidden="true">{item.icon}</span>
                <strong>{item.shortTitle}</strong>
                <StageProgress count={count} complete={complete} />
                {item.id === recommended && <small>Try next</small>}
              </button>
            );
          })}
        </nav>
      )}

      {mode === "learn" && (
        <article className="abacus-lesson-card">
          <div className="abacus-lesson-main">
            <span className="abacus-stage-icon" aria-hidden="true">{stage.icon}</span>
            <div>
              <p className="eyebrow">{stage.order === 0 ? "Explore" : `Stage ${stage.order}`}</p>
              <h4>{stage.title}</h4>
              <p>{stage.description}</p>
              <strong>{stage.bigIdea}</strong>
            </div>
          </div>
          <ol>{stage.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          {stage.id !== "bead-play" && (
            <div className="abacus-stage-meter">
              <StageProgress count={correctHere} complete={completeHere} />
              <span>{completeHere ? "Stage explored ✓" : `${correctHere} of 3 successful builds · no speed requirement`}</span>
            </div>
          )}
        </article>
      )}

      {mode === "free" ? (
        <div className="abacus-free-tools">
          <div>
            <strong>Free Abacus</strong>
            <small>Nothing to solve. Move the beads, build a number, or follow homework beside the screen.</small>
          </div>
          <label>
            Rods
            <select value={freeRods} onChange={(event) => {
              const nextRods = Number(event.target.value);
              setFreeRods(nextRods);
              const nextValue = Math.min(freeValue, Math.pow(10, nextRods) - 1);
              setFreeValue(nextValue);
              setDigits(digitsFromValue(nextValue, nextRods));
              setHistory([]);
            }}>
              {freeRodChoices(childAge).map((rods) => <option key={rods} value={rods}>{rods} rods</option>)}
            </select>
          </label>
          <label className="abacus-label-toggle">
            <input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} />
            Show place-value labels
          </label>
        </div>
      ) : (
        <article className="abacus-challenge">
          <div>
            <p className="eyebrow">{mode === "learn" ? "Guided build" : "Practice challenge"}</p>
            <h4>{challenge.prompt}</h4>
            <p>{challenge.strategy}</p>
          </div>
          <SpeakButton id={`abacus-challenge-${challenge.id}`} label="Hear challenge" text={challenge.speakText} />
        </article>
      )}

      <div className="abacus-workbench">
        <div className="abacus-board-wrap">
          <div className="abacus-board-topline">
            <span>{mode === "free" ? "Move any beads" : `Start: ${formatNumber(challenge.startValue)}`}</span>
            <div>
              <button onClick={undo} disabled={history.length === 0}>↶ Undo</button>
              <button onClick={reset}>↺ {mode === "free" ? "Clear" : "Reset"}</button>
            </div>
          </div>
          <Soroban digits={digits} onChange={changeDigits} showLabels={showLabels || mode === "learn"} />
          <div className="abacus-touch-help">
            <span>Tap a bead</span><span>or swipe toward / away from the beam</span><span>beads snap to legal soroban positions</span>
          </div>
        </div>

        {mode !== "free" && (
          <aside className="abacus-coach-card">
            <p className="eyebrow">Fifi's abacus coach</p>
            <h4>{solved ? "Nice work." : "Build it with the beads."}</h4>
            {showHint ? <p className="abacus-hint">{challenge.hint}</p> : <p>Read the value at the top before you check. Accuracy comes before speed.</p>}
            {feedback && <div className={`abacus-feedback ${solved ? "correct" : "try"}`} role="status">{feedback}</div>}
            <div className="abacus-coach-actions">
              {!solved && <button className="text-button" onClick={() => setShowHint(true)}>Show a hint</button>}
              {!solved && <button className="primary-button" onClick={check}>Check my abacus</button>}
              {solved && <button className="primary-button" onClick={nextChallenge}>Another challenge →</button>}
            </div>
            <small>No timer. No leaderboard. Explain the move before trying to go faster.</small>
          </aside>
        )}
      </div>

      {mode === "free" && (
        <div className="abacus-free-footer">
          <p><strong>Try it beside homework.</strong> Build any whole number, practice a teacher's problem, or use it when a physical abacus is not available.</p>
          <button onClick={() => setMode("practice")}>Give me a practice problem →</button>
        </div>
      )}
    </section>
  );
}
