import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { SpeakButton, useSpeech } from "./SpeechProvider";
import { FIFI, type Guide } from "./guides";
import "./FifiGuide.css";

type SharedGuideProps = {
  open: boolean;
  /**
   * Which helper is speaking. Defaults to Fifi, who owns the app-wide safety
   * dialogs; inside an activity the specialist for that activity is passed
   * in instead.
   */
  guide?: Guide;
  /** Overrides the guide's own artwork when a caller has a specific file. */
  mascotSrc?: string;
  childName?: string;
  className?: string;
  /** Speak the greeting automatically only when the parent's auto-read setting allows it. */
  autoGreet?: boolean;
};

export type FifiGuideProps = SharedGuideProps & (
  | {
    mode: "leave-drawing";
    onStay: () => void;
    onLeave: () => void;
    title?: string;
    message?: string;
  }
  | {
    mode: "start-over";
    onCancel: () => void;
    onStartOver: () => void;
    title?: string;
    message?: string;
  }
  | {
    mode: "tip";
    message: string;
    onDismiss: () => void;
    title?: string;
    actionLabel?: string;
    onAction?: () => void;
  }
);

type GuideCopy = {
  title: string;
  message: string;
  listenText: string;
};

function copyFor(props: FifiGuideProps, guide: Guide): GuideCopy {
  const hello = props.childName ? `, ${props.childName}` : "";

  if (props.mode === "leave-drawing") {
    const title = props.title || `Your picture is safe${hello}!`;
    const message = props.message
      || "I save a private draft on this device while you create. You can leave now and come back to finish it later.";
    return { title, message, listenText: `${title} ${message}` };
  }

  if (props.mode === "start-over") {
    const title = props.title || "Start a fresh page?";
    const message = props.message
      || "This will clear this drawing and cannot be undone. Save it to My Gallery first if you want to keep a copy.";
    return { title, message, listenText: `${title} ${message}` };
  }

  const title = props.title || `A bright idea from ${guide.name}${hello}`;
  return { title, message: props.message, listenText: `${title}. ${props.message}` };
}

function GuideMascot({ src, talking, guide }: { src?: string; talking: boolean; guide: Guide }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [src]);

  if (src && !imageFailed) {
    return <>
      <img
          className="fifi-mascot-image"
          src={src}
          alt={`${guide.name}, your ColorQuest guide`}
          onError={() => setImageFailed(true)}
        />
      <span className={`fifi-mouth ${talking ? "fifi-mouth-talking" : ""}`} aria-hidden="true" />
      <span className="fifi-sparkles" aria-hidden="true"><i /><i /><i /></span>
    </>;
  }

  // Most helpers have no artwork yet, so the emoji is the character rather
  // than a placeholder for one.
  return (
    <span className="fifi-mascot-placeholder" role="img" aria-label={`${guide.name}, your ColorQuest guide`}>
      {guide.emoji}
    </span>
  );
}

function GuideButton({
  children,
  className = "",
  onClick,
  buttonRef,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button ref={buttonRef} type="button" className={`fifi-button ${className}`.trim()} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * Fifi's reusable coaching surface.
 *
 * Leave and start-over modes are accessible blocking dialogs. Their Escape,
 * backdrop and initial-focus actions always choose the safe, non-destructive
 * path. Tip mode is a non-blocking status card: the child can keep creating
 * without first dismissing it.
 */
export default function FifiGuide(props: FifiGuideProps) {
  const { open, mascotSrc, className = "", autoGreet = false } = props;
  const guide = props.guide || FIFI;
  const copy = copyFor(props, guide);
  const rawId = useId();
  const stableId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `fifi-title-${stableId}`;
  const descriptionId = `fifi-description-${stableId}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const safeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const safeCloseRef = useRef<() => void>(() => undefined);
  const blocking = props.mode !== "tip";
  const speechId = `guide-${guide.id}-${props.mode}-${stableId}`;
  const { autoRead, say, speakingId, stop } = useSpeech();
  const talking = speakingId === speechId;

  safeCloseRef.current = props.mode === "leave-drawing"
    ? props.onStay
    : props.mode === "start-over"
      ? props.onCancel
      : props.onDismiss;

  useEffect(() => {
    if (!open || !blocking) return undefined;

    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => safeButtonRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        safeCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || []).filter((element) => !element.hasAttribute("hidden"));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [blocking, open]);

  // Fifi gives one short spoken greeting when a parent's auto-read setting is
  // active. The same speech id drives the mouth pose and the manual Listen
  // button, so both paths stay visually synchronized.
  useEffect(() => {
    if (!open || !autoGreet || !autoRead) return undefined;
    const timer = window.setTimeout(() => say(copy.listenText, { id: speechId, style: "fifi" }), 700);
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [open, autoGreet, autoRead, copy.listenText, say, speechId, stop]);

  if (!open || typeof document === "undefined") return null;

  const mascot = <GuideMascot src={mascotSrc} talking={talking} guide={guide} />;
  const listen = (
    <SpeakButton
      id={speechId}
      text={copy.listenText}
      label={`Hear ${guide.name}`}
      className="fifi-listen"
      voiceStyle="fifi"
    />
  );

  if (props.mode === "tip") {
    return createPortal(
      <aside
        className={`fifi-tip-wrap ${className}`.trim()}
        style={{ "--guide-accent": guide.accent } as CSSProperties}
        role="note"
        aria-label={`${guide.name}'s tip`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="fifi-tip">
          <div className={`fifi-mascot fifi-mascot-small ${talking ? "fifi-is-talking" : ""}`}>{mascot}</div>
          <div className="fifi-tip-copy fifi-speech-bubble">
            <strong>{copy.title}</strong>
            <p>{copy.message}</p>
            <div className="fifi-tip-actions">
              {listen}
              {props.actionLabel && props.onAction && (
                <GuideButton className="fifi-button-small" onClick={props.onAction}>
                  {props.actionLabel}
                </GuideButton>
              )}
            </div>
          </div>
          <button type="button" className="fifi-tip-close" onClick={props.onDismiss} aria-label={`Dismiss ${guide.name}'s tip`}>
            ×
          </button>
        </div>
      </aside>,
      document.body,
    );
  }

  const safeAction = props.mode === "leave-drawing" ? props.onStay : props.onCancel;
  const safeLabel = props.mode === "leave-drawing" ? "Stay & draw" : "Keep my picture";
  const confirmAction = props.mode === "leave-drawing" ? props.onLeave : props.onStartOver;
  const confirmLabel = props.mode === "leave-drawing" ? "Keep it safe and leave" : "Start a fresh page";
  const destructive = props.mode === "start-over";

  const closeFromBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) safeAction();
  };

  return createPortal(
    <div className="fifi-layer" onMouseDown={closeFromBackdrop}>
      <div
        ref={dialogRef}
        style={{ "--guide-accent": guide.accent } as CSSProperties}
        className={`fifi-dialog ${destructive ? "fifi-dialog-warning" : ""} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className={`fifi-mascot ${talking ? "fifi-is-talking" : ""}`} aria-hidden="true">{mascot}</div>
        <div className="fifi-dialog-copy fifi-speech-bubble">
          <p className="fifi-kicker">{guide.name} says</p>
          <h2 id={titleId}>{copy.title}</h2>
          <p id={descriptionId}>{copy.message}</p>
          {listen}
          <div className="fifi-actions">
            <GuideButton buttonRef={safeButtonRef} className="fifi-button-safe" onClick={safeAction}>
              {safeLabel}
            </GuideButton>
            <GuideButton className={destructive ? "fifi-button-danger" : "fifi-button-primary"} onClick={confirmAction}>
              {confirmLabel}
            </GuideButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
