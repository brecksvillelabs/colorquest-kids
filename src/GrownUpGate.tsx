import { useCallback, useState } from "react";
import {
  clearParentPin,
  hasParentPin,
  saveParentPin,
  validParentPin,
  verifyParentPin,
} from "./parent-pin";

/**
 * Grown-up boundary.
 *
 * New installs create a Parent PIN during first-profile setup. Existing installs
 * without a PIN use one randomized adult bootstrap challenge, then must create
 * a 4–6 digit PIN before the protected action opens. The same PIN is reused for
 * Parent Corner, external links, family file access, and supervised labs.
 *
 * This remains a local-device deterrent rather than an account-security system:
 * ColorQuest has no server identity or remote recovery service.
 */

export type GateChallenge = { left: number; right: number; answer: number };

export function makeGateChallenge(random: () => number = Math.random): GateChallenge {
  const left = 14 + Math.floor(random() * 6);
  const right = 6 + Math.floor(random() * 4);
  return { left, right, answer: left * right };
}

type GateMode = "pin" | "bootstrap" | "setup-pin" | "reset-bootstrap";

export function GrownUpGate({
  title = "Grown-ups only",
  intro,
  confirmLabel = "Continue",
  onPass,
  onCancel,
  cancelLabel = "Back to play",
  compact = false,
}: {
  title?: string;
  intro?: string;
  confirmLabel?: string;
  onPass: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<GateMode>(() => hasParentPin() ? "pin" : "bootstrap");
  const [challenge, setChallenge] = useState<GateChallenge>(() => makeGateChallenge());
  const [answer, setAnswer] = useState("");
  const [pin, setPin] = useState("");
  const [pinAgain, setPinAgain] = useState("");
  const [failed, setFailed] = useState("");
  const [showPin, setShowPin] = useState(false);

  const reroll = () => {
    setChallenge(makeGateChallenge());
    setAnswer("");
  };

  const checkChallenge = useCallback(() => {
    if (Number(answer.trim()) === challenge.answer) {
      setFailed("");
      setAnswer("");
      setMode("setup-pin");
      return;
    }
    reroll();
    setFailed("Not quite — here is a new question. Please ask a grown-up.");
  }, [answer, challenge.answer]);

  const checkPin = useCallback(() => {
    if (verifyParentPin(pin)) {
      setFailed("");
      onPass();
      return;
    }
    setPin("");
    setFailed("That PIN did not match. Ask the grown-up who set it.");
  }, [pin, onPass]);

  const setNewPin = useCallback(() => {
    if (!validParentPin(pin)) {
      setFailed("Use 4 to 6 digits for the Parent PIN.");
      return;
    }
    if (pin !== pinAgain) {
      setFailed("The two PIN entries do not match yet.");
      return;
    }
    saveParentPin(pin);
    setFailed("");
    onPass();
  }, [pin, pinAgain, onPass]);

  const keyAction = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    if (mode === "pin") checkPin();
    else if (mode === "bootstrap" || mode === "reset-bootstrap") checkChallenge();
    else setNewPin();
  };

  const bootstrapCopy = mode === "reset-bootstrap"
    ? "To reset a forgotten Parent PIN, a grown-up needs to pass one last check. Then ColorQuest will replace the old PIN on this device."
    : intro || "Please ask a grown-up to answer this. After the check, they will create a Parent PIN for this device.";

  return (
    <section className={`gate-card ${compact ? "compact" : ""}`.trim()}>
      <span className="gate-icon" aria-hidden="true">👋</span>
      <p className="eyebrow">{title}</p>

      {mode === "pin" ? (
        <>
          <h2>Parent PIN</h2>
          <p>{intro || "Please ask a grown-up to enter the Parent PIN for this device."}</p>
          <label className="gate-pin-field">
            <span>Parent PIN</span>
            <input
              autoFocus={!compact}
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(event) => { setPin(event.target.value.replace(/\D/g, "").slice(0, 6)); setFailed(""); }}
              onKeyDown={keyAction}
              aria-label="Parent PIN"
            />
          </label>
          <label className="gate-show-pin"><input type="checkbox" checked={showPin} onChange={(event) => setShowPin(event.target.checked)} /> Show PIN</label>
          <button className="primary-button" onClick={checkPin}>{confirmLabel}</button>
          <button className="text-button gate-forgot" onClick={() => {
            clearParentPin();
            setPin("");
            setPinAgain("");
            setFailed("");
            reroll();
            setMode("reset-bootstrap");
          }}>Forgot the PIN?</button>
        </>
      ) : mode === "setup-pin" ? (
        <>
          <h2>Create a Parent PIN</h2>
          <p>Choose 4–6 digits that the children using ColorQuest do not know. This PIN will protect grown-up actions on this device.</p>
          <label className="gate-pin-field">
            <span>New Parent PIN</span>
            <input
              autoFocus
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(event) => { setPin(event.target.value.replace(/\D/g, "").slice(0, 6)); setFailed(""); }}
              aria-label="New Parent PIN"
            />
          </label>
          <label className="gate-pin-field">
            <span>Enter it again</span>
            <input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={6}
              value={pinAgain}
              onChange={(event) => { setPinAgain(event.target.value.replace(/\D/g, "").slice(0, 6)); setFailed(""); }}
              onKeyDown={keyAction}
              aria-label="Confirm Parent PIN"
            />
          </label>
          <label className="gate-show-pin"><input type="checkbox" checked={showPin} onChange={(event) => setShowPin(event.target.checked)} /> Show PIN</label>
          <button className="primary-button" onClick={setNewPin}>{confirmLabel}</button>
        </>
      ) : (
        <>
          <h2>Quick grown-up check</h2>
          <p>{bootstrapCopy}</p>
          <p className="gate-sum" aria-hidden="true">{challenge.left} × {challenge.right} = ?</p>
          <input
            autoFocus={!compact}
            inputMode="numeric"
            value={answer}
            onChange={(event) => { setAnswer(event.target.value.replace(/\D/g, "")); setFailed(""); }}
            onKeyDown={keyAction}
            aria-label={`Answer to ${challenge.left} times ${challenge.right}`}
          />
          <button className="primary-button" onClick={checkChallenge}>Next</button>
        </>
      )}

      {failed && <small className="gate-error" role="status">{failed}</small>}
      {onCancel && <button className="text-button" onClick={onCancel}>{cancelLabel}</button>}
    </section>
  );
}
