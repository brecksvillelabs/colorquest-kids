export type SorobanDigit = {
  upperActive: boolean;
  lowerCount: number;
};

export function clampDigit(value: number) {
  return Math.max(0, Math.min(9, Math.round(Number.isFinite(value) ? value : 0)));
}

export function digitToSoroban(value: number): SorobanDigit {
  const digit = clampDigit(value);
  return {
    upperActive: digit >= 5,
    lowerCount: digit % 5,
  };
}

export function sorobanToDigit(state: SorobanDigit) {
  return (state.upperActive ? 5 : 0) + Math.max(0, Math.min(4, Math.round(state.lowerCount)));
}

export function maxValueForRods(rods: number) {
  return Math.pow(10, Math.max(1, Math.floor(rods))) - 1;
}

export function digitsFromValue(value: number, rods: number) {
  const safeRods = Math.max(1, Math.floor(rods));
  const max = maxValueForRods(safeRods);
  const safe = Math.max(0, Math.min(max, Math.round(Number.isFinite(value) ? value : 0)));
  return String(safe).padStart(safeRods, "0").slice(-safeRods).split("").map(Number);
}

export function valueFromDigits(digits: number[]) {
  return Number(digits.map(clampDigit).join("")) || 0;
}

export function setRodDigit(digits: number[], rodIndex: number, digit: number) {
  if (rodIndex < 0 || rodIndex >= digits.length) return [...digits];
  const next = [...digits];
  next[rodIndex] = clampDigit(digit);
  return next;
}

export function setUpperBead(digits: number[], rodIndex: number, active: boolean) {
  const current = digitToSoroban(digits[rodIndex] || 0);
  return setRodDigit(digits, rodIndex, sorobanToDigit({ ...current, upperActive: active }));
}

export function setLowerCount(digits: number[], rodIndex: number, lowerCount: number) {
  const current = digitToSoroban(digits[rodIndex] || 0);
  return setRodDigit(digits, rodIndex, sorobanToDigit({ ...current, lowerCount }));
}

export function lowerTapTarget(currentLowerCount: number, beadNumber: number) {
  const bead = Math.max(1, Math.min(4, Math.round(beadNumber)));
  const current = Math.max(0, Math.min(4, Math.round(currentLowerCount)));
  // Tapping an inactive bead brings it and the beads above it to the beam.
  // Tapping an active bead moves that bead and every bead below it away.
  return bead <= current ? bead - 1 : bead;
}

export function placeValueName(positionFromRight: number) {
  const names = [
    "ones",
    "tens",
    "hundreds",
    "thousands",
    "ten-thousands",
    "hundred-thousands",
    "millions",
    "ten-millions",
    "hundred-millions",
    "billions",
    "ten-billions",
    "hundred-billions",
    "trillions",
  ];
  return names[positionFromRight] || `10^${positionFromRight}`;
}

export function placeValueShort(positionFromRight: number) {
  const labels = ["1", "10", "100", "1K", "10K", "100K", "1M", "10M", "100M", "1B", "10B", "100B", "1T"];
  return labels[positionFromRight] || `10^${positionFromRight}`;
}

export function defaultRodCount(childAge: number) {
  if (childAge <= 3) return 3;
  if (childAge <= 6) return 5;
  if (childAge <= 9) return 7;
  return 9;
}

export function freeRodChoices(childAge: number) {
  if (childAge <= 3) return [3];
  if (childAge <= 6) return [3, 5];
  if (childAge <= 9) return [3, 5, 7, 9];
  return [3, 5, 7, 9, 13];
}

export function rodsNeeded(...values: number[]) {
  const width = Math.max(1, ...values.map((value) => String(Math.max(0, Math.round(value))).length));
  if (width <= 3) return 3;
  if (width <= 5) return 5;
  if (width <= 7) return 7;
  if (width <= 9) return 9;
  return 13;
}

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function seededRandom(seed: string | number) {
  let value = hash(String(seed)) || 1;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(random: () => number, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

export function formatNumber(value: number) {
  return Math.max(0, Math.round(value)).toLocaleString("en-US");
}
