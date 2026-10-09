export const PARENT_PIN_STORAGE_KEY = "colorquest-parent-pin-v1";

type ParentPinRecord = {
  version: 1;
  salt: string;
  hash: string;
};

export function validParentPin(pin: string) {
  return /^\d{4,6}$/.test(pin.trim());
}

function randomSalt() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint32Array(2);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(36)).join("-");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * A small salted one-way hash avoids storing the parent's PIN as plain text.
 * This is a local parental-control deterrent, not a cryptographic account
 * boundary: a determined user with device/developer access can still alter
 * local browser storage. ColorQuest has no server account or recovery service.
 */
export function hashParentPin(pin: string, salt: string) {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  const input = `${salt}:${pin.trim()}`;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ (code + index), 0x85ebca6b) >>> 0;
    first ^= second >>> 13;
    second ^= first << 7;
  }
  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
}

export function hasParentPin() {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PARENT_PIN_STORAGE_KEY) || "null") as ParentPinRecord | null;
    return parsed?.version === 1 && typeof parsed.salt === "string" && typeof parsed.hash === "string";
  } catch {
    return false;
  }
}

export function saveParentPin(pin: string) {
  if (!validParentPin(pin)) throw new Error("Parent PIN must be 4 to 6 digits.");
  if (typeof window === "undefined") return;
  const salt = randomSalt();
  const record: ParentPinRecord = { version: 1, salt, hash: hashParentPin(pin, salt) };
  window.localStorage.setItem(PARENT_PIN_STORAGE_KEY, JSON.stringify(record));
}

export function verifyParentPin(pin: string) {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PARENT_PIN_STORAGE_KEY) || "null") as ParentPinRecord | null;
    if (!parsed || parsed.version !== 1) return false;
    return hashParentPin(pin, parsed.salt) === parsed.hash;
  } catch {
    return false;
  }
}

export function clearParentPin() {
  if (typeof window !== "undefined") window.localStorage.removeItem(PARENT_PIN_STORAGE_KEY);
}
