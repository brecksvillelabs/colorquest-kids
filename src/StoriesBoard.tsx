import { useEffect, useState } from "react";
import ReadingBoard from "./ReadingBoard";
import StorybookBoard from "./StorybookBoard";
import type { ReadingProgress } from "./profile-data";
import type { ReadingBand } from "./reading-data";

/**
 * The two halves of reading, behind one button.
 *
 * "Read to me" is the picture storybooks: a grown-up or the app reads, the
 * child listens and looks. "I'll read it" is the Reading Garden, where the
 * child does the decoding. Same split as Math → Number Games / Abacus Lab.
 *
 * Picture books only exist for the youngest two age worlds, so an older
 * child gets the Reading Garden with no switch at all rather than a toggle
 * with nothing behind one side of it.
 */

type StoriesMode = "listen" | "read";

function storageKey(profileId: string) {
  return `colorquest-stories-mode-v1:${profileId}`;
}

function loadMode(profileId: string, canListen: boolean): StoriesMode {
  if (!canListen) return "read";
  if (typeof window === "undefined") return "listen";
  try {
    return window.localStorage.getItem(storageKey(profileId)) === "read" ? "read" : "listen";
  } catch {
    return "listen";
  }
}

function saveMode(profileId: string, mode: StoriesMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(profileId), mode);
  } catch {
    // The switch still works for this session when storage is unavailable.
  }
}

export default function StoriesBoard({
  age,
  childAge,
  profileId,
  page,
  reading,
  onComplete,
  onSelectBook,
  onReadingModeChange,
  readingActions,
}: {
  age: number;
  childAge: number;
  profileId: string;
  page: number;
  reading: ReadingProgress;
  onComplete: () => void;
  onSelectBook: (page: number) => void;
  /** True while the Reading Garden is showing, so page chrome steps aside. */
  onReadingModeChange?: (active: boolean) => void;
  readingActions: {
    onPageRead: (entry: { storyId: string; pageIndex: number; pageCount: number; newWords: string[] }) => void;
    onFinishStory: (entry: { storyId: string; pageKeys: string[]; newWords: string[] }) => void;
    onToggleWord: (entry: { word: string; meaning: string }) => void;
    onLetterHeard: (letter: string) => void;
    onBandChange: (band: ReadingBand) => void;
  };
}) {
  // ColorQuest retired the picture storybooks at age seven long before the
  // Reading Garden existed, and getStoryBooks still hands back the
  // early-reader set at any age, so the age world decides rather than the
  // content. Older children get the Reading Garden and no switch.
  const canListen = age < 2;
  const [mode, setMode] = useState<StoriesMode>(() => loadMode(profileId, canListen));
  const active: StoriesMode = canListen ? mode : "read";

  useEffect(() => {
    if (canListen) saveMode(profileId, mode);
    onReadingModeChange?.(active === "read");
    return () => onReadingModeChange?.(false);
  }, [profileId, mode, active, canListen, onReadingModeChange]);

  return (
    <section className={`stories-home ${active === "read" ? "reading-active" : "listen-active"}`} aria-label="Stories">
      {canListen && (
        <div className="stories-path-switch" aria-label="Choose how to read">
          <button
            className={active === "listen" ? "active" : ""}
            onClick={() => setMode("listen")}
            aria-pressed={active === "listen"}
          >
            <span aria-hidden="true">📚</span>
            <strong>Read to me</strong>
            <small>Picture stories, read aloud</small>
          </button>
          <button
            className={active === "read" ? "active" : ""}
            onClick={() => setMode("read")}
            aria-pressed={active === "read"}
          >
            <span aria-hidden="true">🌱</span>
            <strong>I'll read it</strong>
            <small>Grow a garden as you learn</small>
          </button>
        </div>
      )}

      {active === "listen" ? (
        <StorybookBoard page={page} age={age} onSelectBook={onSelectBook} onComplete={onComplete} />
      ) : (
        <ReadingBoard
          childAge={childAge}
          reading={reading}
          onComplete={onComplete}
          {...readingActions}
        />
      )}
    </section>
  );
}
