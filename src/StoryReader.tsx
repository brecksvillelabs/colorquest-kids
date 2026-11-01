import { useEffect, useMemo, useState } from "react";
import ReadingFlower from "./ReadingFlower";
import { SpeakButton, useSpeech } from "./SpeechProvider";
import {
  READING_BANDS,
  buildWordCheck,
  cleanWord,
  isSightWord,
  pageKey,
  wordMeaning,
  wordSpansOf,
  type ReadingStory,
  type WordCheckQuestion,
} from "./reading-data";

type Phase = "reading" | "check" | "finished";

/** Non-sight words on a page: what "new words met" actually counts. */
function newWordsOn(text: string): string[] {
  return [
    ...new Set(
      wordSpansOf(text)
        .map((span) => cleanWord(span.text))
        .filter((word) => word && !isSightWord(word)),
    ),
  ];
}

export default function StoryReader({
  story,
  startPage,
  savedWords,
  alreadyGrown,
  onPageRead,
  onFinish,
  onToggleWord,
  onBackToShelf,
}: {
  story: ReadingStory;
  startPage: number;
  savedWords: Array<{ word: string; meaning: string }>;
  alreadyGrown: boolean;
  onPageRead: (page: { pageIndex: number; newWords: string[] }) => void;
  onFinish: (story: { pageKeys: string[]; newWords: string[] }) => void;
  onToggleWord: (entry: { word: string; meaning: string }) => void;
  onBackToShelf: () => void;
}) {
  const [pageIndex, setPageIndex] = useState(() => Math.min(Math.max(startPage, 0), story.pages.length - 1));
  // Snapshot on open: by the time the finish screen renders, this story has
  // already been recorded, so reading the live value would always say "again".
  const [wasAlreadyGrown] = useState(alreadyGrown);
  const [phase, setPhase] = useState<Phase>("reading");
  const [chosenWord, setChosenWord] = useState<string | null>(null);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const { say, stop, available } = useSpeech();

  const text = story.pages[pageIndex];
  const spans = useMemo(() => wordSpansOf(text), [text]);
  const isLastPage = pageIndex === story.pages.length - 1;
  const band = READING_BANDS[story.band];

  // A page change is a fresh start: nothing tapped, nothing selected, and
  // any half-spoken word from the previous page stopped.
  useEffect(() => {
    setTapped(new Set());
    setChosenWord(null);
    stop();
  }, [pageIndex, stop]);

  const [questions, setQuestions] = useState<WordCheckQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  const finishStory = () => {
    onFinish({
      pageKeys: story.pages.map((_, index) => pageKey(story.id, index)),
      newWords: [...new Set(story.pages.flatMap(newWordsOn))],
    });
    setPhase("finished");
  };

  const leavePage = () => {
    stop();
    onPageRead({ pageIndex, newWords: newWordsOn(text) });
    if (!isLastPage) {
      setPageIndex(pageIndex + 1);
      return;
    }
    const built = buildWordCheck(story);
    if (!built.length) {
      finishStory();
      return;
    }
    setQuestions(built);
    setQuestionIndex(0);
    setAnswered(false);
    setWrongChoices([]);
    setFeedback("");
    setPhase("check");
  };

  const tapWord = (index: number, raw: string) => {
    const word = cleanWord(raw);
    setTapped((previous) => new Set(previous).add(index));
    setChosenWord(word);
    say(raw, { id: `reading-word-${story.id}-${pageIndex}-${index}` });
  };

  if (phase === "finished") {
    return (
      <div className="creative-board reading-finish">
        <ReadingFlower storyId={story.id} size={120} title={story.title} />
        <h3>{wasAlreadyGrown ? "You read it again!" : "You grew a new flower!"}</h3>
        <p>
          {wasAlreadyGrown
            ? `“${story.title}” was already in your garden. Reading it twice makes it easier every time.`
            : `“${story.title}” is planted in your garden now.`}
        </p>
        <button type="button" className="reading-primary" onClick={onBackToShelf}>
          See my garden
        </button>
      </div>
    );
  }

  if (phase === "check") {
    const question = questions[questionIndex];
    const nextQuestion = () => {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        setAnswered(false);
        setWrongChoices([]);
        setFeedback("");
      } else {
        finishStory();
      }
    };

    return (
      <div className="creative-board reading-check">
        <header className="reading-check-header">
          <h3>One quick check</h3>
          <small>
            Question {questionIndex + 1} of {questions.length}
          </small>
        </header>
        <p className="reading-check-prompt">Which word means this?</p>
        <div className="reading-check-meaning">
          <SpeakButton id={`reading-check-${story.id}-${questionIndex}`} label="Read it to me" text={question.prompt} />
          <span>{question.prompt}</span>
        </div>
        <div className="reading-check-choices">
          {question.choices.map((choice) => {
            const wrong = wrongChoices.includes(choice);
            const right = answered && choice === question.answer;
            return (
              <button
                key={choice}
                type="button"
                className={`reading-choice ${right ? "right" : ""} ${wrong ? "wrong" : ""}`.trim()}
                disabled={wrong || answered}
                onClick={() => {
                  if (answered) return;
                  say(choice, { id: `reading-choice-${choice}` });
                  if (choice === question.answer) {
                    setAnswered(true);
                    setFeedback("Yes. That one.");
                    window.setTimeout(nextQuestion, 1100);
                  } else {
                    // A wrong answer is not a failure: the question stays open.
                    setWrongChoices((previous) => [...previous, choice]);
                    setFeedback("Not that one. Try another.");
                  }
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>
        <p className="reading-check-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
        <button type="button" className="reading-secondary" onClick={nextQuestion}>
          Skip this
        </button>
      </div>
    );
  }

  const saved = chosenWord ? savedWords.some((entry) => entry.word === chosenWord) : false;
  const meaning = chosenWord ? wordMeaning(chosenWord) : "";
  const longPage = spans.length >= 20 ? "dense" : spans.length >= 12 ? "long" : "";

  return (
    <div className="creative-board reading-reader">
      <header className="reading-reader-header">
        <button type="button" className="reading-shelf-link" onClick={onBackToShelf}>
          ← Shelf
        </button>
        <div>
          <h3>{story.title}</h3>
          <small>
            {band.name} · Page {pageIndex + 1} of {story.pages.length}
          </small>
        </div>
      </header>

      <div className="reading-scene" style={{ background: story.bg }} aria-hidden="true">
        <span>{story.pageEmoji?.[pageIndex] || story.emoji}</span>
      </div>

      <p className={`reading-page-text ${longPage}`.trim()}>
        {spans.map((span, index) => (
          <span key={index}>
            {index > 0 && text.slice(spans[index - 1].end, span.start)}
            <button
              type="button"
              className={`reading-word ${tapped.has(index) ? "tapped" : ""}`.trim()}
              onClick={() => tapWord(index, span.text)}
              aria-label={`Hear the word ${cleanWord(span.text)}`}
            >
              {span.text}
            </button>
          </span>
        ))}
      </p>

      <p className="reading-hint">Tap any word to hear it and find out what it means.</p>

      <div className={`reading-word-panel ${chosenWord ? "" : "empty"}`.trim()} role="region" aria-live="polite">
        {chosenWord ? (
          <>
            <div className="reading-word-head">
              <strong>{chosenWord}</strong>
              <button
                type="button"
                className={`reading-save ${saved ? "saved" : ""}`.trim()}
                onClick={() => onToggleWord({ word: chosenWord, meaning })}
              >
                {saved ? "★ Saved" : "☆ Save word"}
              </button>
            </div>
            <div className="reading-word-meaning">
              <SpeakButton id={`reading-meaning-${chosenWord}`} label="Meaning" text={meaning} />
              <span>{meaning}</span>
            </div>
          </>
        ) : (
          "Tap a word above to see what it means."
        )}
      </div>

      <div className="reading-controls">
        {available && (
          <SpeakButton
            id={`reading-page-${story.id}-${pageIndex}`}
            label="Read to me"
            text={text}
            className="reading-read-aloud"
          />
        )}
        <button type="button" className="reading-primary" onClick={leavePage}>
          {isLastPage ? "Finish story" : "Next page"}
        </button>
      </div>

      <div className="reading-dots" aria-hidden="true">
        {story.pages.map((_, index) => (
          <span key={index} className={index === pageIndex ? "active" : index < pageIndex ? "seen" : ""} />
        ))}
      </div>
    </div>
  );
}
