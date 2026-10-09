import { describe, expect, it } from "vitest";
import {
  defaultRodCount,
  digitToSoroban,
  digitsFromValue,
  freeRodChoices,
  lowerTapTarget,
  maxValueForRods,
  placeValueName,
  setLowerCount,
  setUpperBead,
  sorobanToDigit,
  valueFromDigits,
} from "./abacus-engine";

describe("soroban engine", () => {
  it("maps every decimal digit to one legal soroban state and back", () => {
    for (let digit = 0; digit <= 9; digit += 1) {
      const state = digitToSoroban(digit);
      expect(state.lowerCount).toBeGreaterThanOrEqual(0);
      expect(state.lowerCount).toBeLessThanOrEqual(4);
      expect(sorobanToDigit(state)).toBe(digit);
    }
  });

  it("converts between whole numbers and fixed rod arrays", () => {
    expect(digitsFromValue(2348, 5)).toEqual([0, 2, 3, 4, 8]);
    expect(valueFromDigits([0, 2, 3, 4, 8])).toBe(2348);
    expect(digitsFromValue(99999, 3)).toEqual([9, 9, 9]);
    expect(maxValueForRods(3)).toBe(999);
  });

  it("changes upper and lower bead groups without illegal states", () => {
    let digits = digitsFromValue(2, 3);
    digits = setUpperBead(digits, 2, true);
    expect(valueFromDigits(digits)).toBe(7);
    digits = setLowerCount(digits, 2, 4);
    expect(valueFromDigits(digits)).toBe(9);
    digits = setUpperBead(digits, 2, false);
    expect(valueFromDigits(digits)).toBe(4);
  });

  it("uses grouped lower-bead taps like a physical soroban", () => {
    expect(lowerTapTarget(0, 3)).toBe(3);
    expect(lowerTapTarget(3, 2)).toBe(1);
    expect(lowerTapTarget(4, 4)).toBe(3);
  });

  it("grows rod choices with the child while keeping place value explicit", () => {
    expect(defaultRodCount(3)).toBe(3);
    expect(defaultRodCount(6)).toBe(5);
    expect(defaultRodCount(9)).toBe(7);
    expect(defaultRodCount(12)).toBe(9);
    expect(freeRodChoices(3)).toEqual([3]);
    expect(freeRodChoices(12)).toContain(13);
    expect(placeValueName(0)).toBe("ones");
    expect(placeValueName(3)).toBe("thousands");
  });
});
