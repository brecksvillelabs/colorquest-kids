import { describe, expect, it } from "vitest";
import {
  CUSTOM_COLORING_MAX_FILE_BYTES,
  fitInside,
  floodFillPixels,
  isSupportedColoringFile,
  safeCustomColoringTitle,
} from "./custom-coloring-utils";

describe("custom coloring page utilities", () => {
  it("accepts supported image formats within the size limit", () => {
    expect(isSupportedColoringFile({ name: "owl.png", type: "image/png", size: 1000 })).toBe(true);
    expect(isSupportedColoringFile({ name: "page.svg", type: "", size: 1000 })).toBe(true);
    expect(isSupportedColoringFile({ name: "notes.pdf", type: "application/pdf", size: 1000 })).toBe(false);
    expect(isSupportedColoringFile({ name: "huge.jpg", type: "image/jpeg", size: CUSTOM_COLORING_MAX_FILE_BYTES + 1 })).toBe(false);
  });

  it("creates a friendly title from an uploaded filename", () => {
    expect(safeCustomColoringTitle("my_dinosaur-page.PNG")).toBe("my dinosaur page");
    expect(safeCustomColoringTitle(".png")).toBe("My coloring page");
  });

  it("keeps imported pages inside the rasterization ceiling", () => {
    expect(fitInside(2400, 1200)).toEqual({ width: 1200, height: 600 });
    expect(fitInside(600, 800)).toEqual({ width: 600, height: 800 });
  });

  it("fills one enclosed side without crossing an ink boundary", () => {
    const width = 5;
    const height = 3;
    const data = new Uint8ClampedArray(width * height * 4);
    const boundary = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) boundary[y * width + 2] = 1;

    expect(floodFillPixels(data, width, height, boundary, 0, 1, [255, 0, 0, 255])).toBe(true);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        if (x < 2) expect(Array.from(data.slice(offset, offset + 4))).toEqual([255, 0, 0, 255]);
        if (x >= 2) expect(Array.from(data.slice(offset, offset + 4))).toEqual([0, 0, 0, 0]);
      }
    }
  });
});
