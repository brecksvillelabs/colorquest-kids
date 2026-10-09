export const CUSTOM_COLORING_MAX_FILE_BYTES = 12 * 1024 * 1024;

export const CUSTOM_COLORING_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export type UploadLike = {
  name: string;
  type: string;
  size: number;
};

export function safeCustomColoringTitle(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
  return cleaned || "My coloring page";
}

export function isSupportedColoringFile(file: UploadLike) {
  if (file.size <= 0 || file.size > CUSTOM_COLORING_MAX_FILE_BYTES) return false;
  if (CUSTOM_COLORING_ACCEPTED_TYPES.includes(file.type as (typeof CUSTOM_COLORING_ACCEPTED_TYPES)[number])) return true;
  return /\.(png|jpe?g|webp|svg)$/i.test(file.name);
}

export function fitInside(width: number, height: number, maxDimension = 1200) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const scale = Math.min(1, maxDimension / Math.max(safeWidth, safeHeight));
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
}

export type FillRgba = readonly [number, number, number, number];

function samePixel(data: Uint8ClampedArray, offset: number, target: FillRgba) {
  return data[offset] === target[0]
    && data[offset + 1] === target[1]
    && data[offset + 2] === target[2]
    && data[offset + 3] === target[3];
}

/**
 * Scanline flood fill for an editable RGBA layer.
 *
 * Any nonzero boundary pixel is treated as an ink line and can never be crossed.
 * The function mutates data in place and returns true only when pixels changed.
 */
export function floodFillPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  boundary: Uint8Array,
  startX: number,
  startY: number,
  replacement: FillRgba,
) {
  const x0 = Math.max(0, Math.min(width - 1, Math.floor(startX)));
  const y0 = Math.max(0, Math.min(height - 1, Math.floor(startY)));
  const startPixel = y0 * width + x0;
  if (boundary[startPixel]) return false;

  const startOffset = startPixel * 4;
  const target: FillRgba = [
    data[startOffset],
    data[startOffset + 1],
    data[startOffset + 2],
    data[startOffset + 3],
  ];
  if (
    target[0] === replacement[0]
    && target[1] === replacement[1]
    && target[2] === replacement[2]
    && target[3] === replacement[3]
  ) return false;

  const matches = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const pixel = y * width + x;
    return !boundary[pixel] && samePixel(data, pixel * 4, target);
  };

  const paint = (x: number, y: number) => {
    const offset = (y * width + x) * 4;
    data[offset] = replacement[0];
    data[offset + 1] = replacement[1];
    data[offset + 2] = replacement[2];
    data[offset + 3] = replacement[3];
  };

  const stack: number[] = [x0, y0];
  while (stack.length) {
    const y = stack.pop()!;
    let x = stack.pop()!;

    while (x >= 0 && matches(x, y)) x -= 1;
    x += 1;

    let spanUp = false;
    let spanDown = false;
    for (; x < width && matches(x, y); x += 1) {
      paint(x, y);

      if (y > 0) {
        if (matches(x, y - 1)) {
          if (!spanUp) {
            stack.push(x, y - 1);
            spanUp = true;
          }
        } else {
          spanUp = false;
        }
      }

      if (y < height - 1) {
        if (matches(x, y + 1)) {
          if (!spanDown) {
            stack.push(x, y + 1);
            spanDown = true;
          }
        } else {
          spanDown = false;
        }
      }
    }
  }

  return true;
}
