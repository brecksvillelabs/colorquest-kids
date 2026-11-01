import { useMemo, useState } from "react";
import ReadingFlower from "./ReadingFlower";
import StoryReader from "./StoryReader";
import { SpeakButton, useSpeech } from "./SpeechProvider";
import {
  PHONICS,
  READING_BANDS,
  READING_BAND_ORDER,
  bandForAge,
  findStory,
  pagesInBand,
  storiesInBand,
  type ReadingBand,
} from "./reading-data";
import type { ReadingProgress } from "./profile-data";

type View = "shelf" | "reading" | "phonics" | "notebook";

export default function ReadingBoard({
  childAge,
  reading,
  onComplete,
  onPageRead,
  onFinishStory,
  onToggleWord,
  onLetterHeard,
  onBandChange,
}: {
  childAge: number;
  reading: ReadingProgress;
  onComplete: () => void;
  onPageRead: (entry: { storyId: string; pageIndex: number; pageCount: number; newWords: string[] }) => void;
  onFinishStory: (entry: { storyId: string; pageKeys: string[]; newWords: string[] }) => void;
  onToggleWord: (entry: { word: string; meaning: string }) => void;
  onLetterHeard: (letter: string) => void;
  onBandChange: (band: ReadingBand) => void;
}) {
  const band = reading.band || bandForAge(childAge);
  const shelf = useMemo(() => storiesInBand(band), [band]);
  const [view, setView] = useState<View>("shelf");
  const [storyIndex, setStoryIndex] = useState(0);
  const [letter, setLetter] = useState<string | null>(null);
  const { say } = useSpeech();

  const story = shelf[Math.min(storyIndex, shelf.length - 1)] || shelf[0];
  const planted = reading.completedStories.map((id) => findStory(id)).filter(Boolean);

  const openStory = (index: number) => {
    setStoryIndex(index);
    setView("reading");
  };

  if (view === "reading" && story) {
    return (
      <StoryReader
        key={story.id}
        story={story}
        startPage={reading.bookmarks[story.id] || 0}
        savedWords={reading.savedWords}
        alreadyGrown={reading.completedStories.includes(story.id)}
        onPageRead={({ pageIndex, newWords }) =>
          onPageRead({ storyId: story.id, pageIndex, pageCount: story.pages.length, newWords })
        }
        onFinish={({ pageKeys, newWords }) => {
          onFinishStory({ storyId: story.id, pageKeys, newWords });
          onComplete();
        }}
        onToggleWord={onToggleWord}
        onBackToShelf={() => setView("shelf")}
      />
    );
  }

  if (view === "phonics") {
    const current = PHONICS.find((entry) => entry.letter === letter);
    if (current) {
      const position = PHONICS.indexOf(current);
      const previous = PHONICS[position - 1];
      const next = PHONICS[position + 1];
      return (
        <div className="creative-board reading-letter">
          <button type="button" className="reading-shelf-link" onClick={() => setLetter(null)}>
            ← All letters
          </button>
          <div className="reading-letter-card">
            <div className="reading-letter-big" aria-hidden="true">
              {current.letter.toUpperCase()}
              {current.letter}
            </div>
            <div className="reading-letter-keyword">
              <span aria-hidden="true">{current.emoji}</span>
              <div>
                <strong>{current.sound}</strong>
                <small>as in {current.keyword}</small>
              </div>
            </div>
            <div className="reading-letter-sounds">
              <SpeakButton id={`letter-name-${current.letter}`} label="Its name" text={current.nameSay} />
              <SpeakButton id={`letter-sound-${current.letter}`} label="Its sound" text={current.soundSay} />
              <SpeakButton id={`letter-word-${current.letter}`} label={current.keyword} text={current.keyword} />
            </div>
          </div>
          <h4>Words with this sound</h4>
          <div className="reading-examples">
            {current.examples.map((word) => (
              <button
                key={word}
                type="button"
                className="reading-example"
                onClick={() => say(word, { id: `example-${word}` })}
                aria-label={`Hear the word ${word}`}
              >
                {word.split("").map((character, index) =>
                  character === current.letter ? (
                    <strong key={index}>{character}</strong>
                  ) : (
                    <span key={index}>{character}</span>
                  ),
                )}
              </button>
            ))}
          </div>
          {current.note && <p className="reading-letter-note">{current.note}</p>}
          <div className="reading-controls">
            <button
              type="button"
              className="reading-secondary"
              disabled={!previous}
              onClick={() => previous && openLetter(previous.letter)}
            >
              ← {previous ? previous.letter.toUpperCase() : ""}
            </button>
            <button
              type="button"
              className="reading-primary"
              disabled={!next}
              onClick={() => next && openLetter(next.letter)}
            >
              {next ? next.letter.toUpperCase() : ""} →
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="creative-board reading-phonics">
        <button type="button" className="reading-shelf-link" onClick={() => setView("shelf")}>
          ← Garden
        </button>
        <h3>Letter sounds</h3>
        <p>Tap a letter to hear its name, its sound, and a word that starts with it.</p>
        <small className="reading-explored">
          {reading.lettersHeard.length} of {PHONICS.length} explored
        </small>
        <div className="reading-alphabet">
          {PHONICS.map((entry) => (
            <button
              key={entry.letter}
              type="button"
              className={`reading-tile ${reading.lettersHeard.includes(entry.letter) ? "heard" : ""}`.trim()}
              onClick={() => openLetter(entry.letter)}
              aria-label={`${entry.letter.toUpperCase()}, as in ${entry.keyword}`}
            >
              <strong>
                {entry.letter.toUpperCase()}
                {entry.letter}
              </strong>
              <span aria-hidden="true">{entry.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "notebook") {
    return (
      <div className="creative-board reading-notebook">
        <button type="button" className="reading-shelf-link" onClick={() => setView("shelf")}>
          ← Garden
        </button>
        <h3>My word notebook</h3>
        <p>Words you saved, and what they mean.</p>
        {reading.savedWords.length === 0 ? (
          <div className="reading-empty">
            <span aria-hidden="true">🌱</span>
            Nothing saved yet. While you read, tap a word and choose “Save word”.
          </div>
        ) : (
          <ul className="reading-notebook-list">
            {reading.savedWords.map((entry) => (
              <li key={entry.word}>
                <div>
                  <strong>{entry.word}</strong>
                  <small>{entry.meaning}</small>
                </div>
                <div className="reading-notebook-actions">
                  <SpeakButton id={`notebook-${entry.word}`} label="Word" text={entry.word} />
                  <button
                    type="button"
                    className="reading-remove"
                    onClick={() => onToggleWord(entry)}
                    aria-label={`Remove ${entry.word} from the notebook`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="creative-board reading-shelf">
      <div className="reading-garden" aria-label={`Your garden: ${planted.length} flowers`}>
        <div className="reading-sun" aria-hidden="true" />
        {planted.length === 0 ? (
          <p className="reading-garden-empty">
            <span aria-hidden="true">🌱</span>
            Nothing planted yet. Finish a story to grow your first flower.
          </p>
        ) : (
          <div className="reading-garden-row">
            {planted.map((item) => (
              <ReadingFlower
                key={item!.id}
                storyId={item!.id}
                title={item!.title}
                size={planted.length <= 6 ? 34 : planted.length <= 12 ? 27 : 20}
              />
            ))}
          </div>
        )}
      </div>

      <div className="reading-stats">
        <div>
          <strong>{reading.completedStories.length}</strong>
          <small>Stories finished</small>
        </div>
        <div>
          <strong>{reading.pagesSeen.length}</strong>
          <small>Pages read</small>
        </div>
        <div>
          <strong>{reading.wordsMet.length}</strong>
          <small>New words met</small>
        </div>
      </div>

      <div className="reading-band-row">
        <h4>
          {READING_BANDS[band].emoji} {READING_BANDS[band].name}
        </h4>
        <small>
          ages {READING_BANDS[band].ages} · {shelf.length} stories, {pagesInBand(band)} pages
        </small>
        <p>{READING_BANDS[band].blurb}</p>
      </div>

      <ul className="reading-story-list">
        {shelf.map((item, index) => {
          const done = reading.completedStories.includes(item.id);
          const resumeAt = reading.bookmarks[item.id] || 0;
          return (
            <li key={item.id}>
              <button type="button" className="reading-story" onClick={() => openStory(index)}>
                <span className="reading-cover" style={{ background: item.bg }} aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="reading-story-info">
                  <strong>{item.title}</strong>
                  <small>{item.pages.length} pages</small>
                </span>
                <span className="reading-story-flag">
                  {done ? (
                    <span className="reading-done" aria-label="Finished">
                      ✓
                    </span>
                  ) : resumeAt > 0 ? (
                    <span className="reading-resume">page {resumeAt + 1}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="reading-extras">
        <button type="button" className="reading-secondary" onClick={() => setView("phonics")}>
          🔤 Letter sounds
          {reading.lettersHeard.length > 0 ? ` (${reading.lettersHeard.length}/${PHONICS.length})` : ""}
        </button>
        <button type="button" className="reading-secondary" onClick={() => setView("notebook")}>
          📓 Word notebook
          {reading.savedWords.length > 0 ? ` (${reading.savedWords.length})` : ""}
        </button>
      </div>

      <details className="reading-shelf-switch">
        <summary>Change shelf</summary>
        <p>
          A shelf is a starting point, not a limit. Nothing is locked, so a child who is ready can read up and a
          child who wants an easier story can read down.
        </p>
        <div className="reading-band-chips">
          {READING_BAND_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`reading-chip ${key === band ? "active" : ""}`.trim()}
              aria-pressed={key === band}
              onClick={() => {
                onBandChange(key);
                setStoryIndex(0);
              }}
            >
              <span aria-hidden="true">{READING_BANDS[key].emoji}</span> {READING_BANDS[key].name}
              <small>ages {READING_BANDS[key].ages}</small>
            </button>
          ))}
        </div>
      </details>
    </div>
  );

  function openLetter(next: string) {
    setLetter(next);
    setView("phonics");
    onLetterHeard(next);
  }
}
