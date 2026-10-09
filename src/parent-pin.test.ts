import { beforeEach, describe, expect, it } from "vitest";
import {
  PARENT_PIN_STORAGE_KEY,
  clearParentPin,
  hasParentPin,
  hashParentPin,
  saveParentPin,
  validParentPin,
  verifyParentPin,
} from "./parent-pin";

describe("local Parent PIN", () => {
  beforeEach(() => {
    window.localStorage.removeItem(PARENT_PIN_STORAGE_KEY);
  });

  it("accepts only a 4–6 digit PIN", () => {
    expect(validParentPin("4826")).toBe(true);
    expect(validParentPin("123456")).toBe(true);
    expect(validParentPin("123")).toBe(false);
    expect(validParentPin("1234567")).toBe(false);
    expect(validParentPin("12a4")).toBe(false);
  });

  it("stores a salted verifier rather than the plain PIN", () => {
    saveParentPin("4826");
    const raw = window.localStorage.getItem(PARENT_PIN_STORAGE_KEY) || "";
    expect(raw).not.toContain("4826");
    expect(hasParentPin()).toBe(true);
    expect(verifyParentPin("4826")).toBe(true);
    expect(verifyParentPin("4827")).toBe(false);
  });

  it("changes output when the salt changes", () => {
    expect(hashParentPin("4826", "one")).not.toBe(hashParentPin("4826", "two"));
  });

  it("can clear the local PIN record", () => {
    saveParentPin("4826");
    clearParentPin();
    expect(hasParentPin()).toBe(false);
    expect(verifyParentPin("4826")).toBe(false);
  });
});
