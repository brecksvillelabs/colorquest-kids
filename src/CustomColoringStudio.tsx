import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { ART_PAINTS, DEFAULT_PAINT, getArtPaint, paintCss } from "./art-palette";
import { GrownUpGate } from "./GrownUpGate";
import {
  addCustomColoringPage,
  deleteCustomColoringDraft,
  deleteCustomColoringPage,
  listCustomColoringPages,
  loadCustomColoringDraft,
  saveCustomColoringDraft,
  type CustomColoringPage,
} from "./custom-coloring-store";
import {
  CUSTOM_COLORING_MAX_FILE_BYTES,
  fitInside,
  floodFillPixels,
  isSupportedColoringFile,
  safeCustomColoringTitle,
} from "./custom-coloring-utils";

type CustomTool = "bucket" | "brush" | "crayon" | "eraser";
type GateAction = { type: "upload" } | { type: "delete"; page: CustomColoringPage } | null;

const MAX_HISTORY = 12;
const NAVY = [23, 59, 109] as const;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("ColorQuest could not open this image."));
    image.src = src;
  });
}

async function prepareLineArt(file: File) {
  if (!isSupportedColoringFile(file)) {
    const limit = Math.round(CUSTOM_COLORING_MAX_FILE_BYTES / (1024 * 1024));
    throw new Error(`Choose a PNG, JPG, WebP, or SVG smaller than ${limit} MB.`);
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  if (!naturalWidth || !naturalHeight) throw new Error("This image has no usable dimensions.");

  const size = fitInside(naturalWidth, naturalHeight, 1200);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = size.width;
  sourceCanvas.height = size.height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("This browser cannot prepare a coloring page.");

  sourceContext.fillStyle = "#ffffff";
  sourceContext.fillRect(0, 0, size.width, size.height);
  sourceContext.drawImage(image, 0, 0, size.width, size.height);

  const sourcePixels = sourceContext.getImageData(0, 0, size.width, size.height);
  const originalMask = new Uint8Array(size.width * size.height);
  for (let pixel = 0; pixel < originalMask.length; pixel += 1) {
    const offset = pixel * 4;
    const alpha = sourcePixels.data[offset + 3] / 255;
    const luminance = (
      sourcePixels.data[offset] * 0.2126
      + sourcePixels.data[offset + 1] * 0.7152
      + sourcePixels.data[offset + 2] * 0.0722
    );
    const composited = 255 - ((255 - luminance) * alpha);
    if (composited < 215) originalMask[pixel] = 1;
  }

  // A one-pixel dilation makes faint or slightly broken scans behave more like
  // closed coloring-book outlines without materially changing the drawing.
  const mask = originalMask.slice();
  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      const pixel = y * size.width + x;
      if (!originalMask[pixel]) continue;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < size.width && ny >= 0 && ny < size.height) {
            mask[ny * size.width + nx] = 1;
          }
        }
      }
    }
  }

  const lineCanvas = document.createElement("canvas");
  lineCanvas.width = size.width;
  lineCanvas.height = size.height;
  const lineContext = lineCanvas.getContext("2d");
  if (!lineContext) throw new Error("This browser cannot prepare a coloring page.");
  const linePixels = lineContext.createImageData(size.width, size.height);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (!mask[pixel]) continue;
    const offset = pixel * 4;
    linePixels.data[offset] = NAVY[0];
    linePixels.data[offset + 1] = NAVY[1];
    linePixels.data[offset + 2] = NAVY[2];
    linePixels.data[offset + 3] = 255;
  }
  lineContext.putImageData(linePixels, 0, 0);

  return {
    width: size.width,
    height: size.height,
    lineArtDataUrl: lineCanvas.toDataURL("image/png"),
  };
}

function pointOnCanvas(event: ReactPointerEvent<HTMLCanvasElement>) {
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / Math.max(1, rect.width)),
    y: (event.clientY - rect.top) * (canvas.height / Math.max(1, rect.height)),
  };
}

export default function CustomColoringStudio({
  profileId,
  profileName,
  onSaveArtwork,
}: {
  profileId: string;
  profileName: string;
  onSaveArtwork: (dataUrl: string, title: string) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineImageRef = useRef<HTMLImageElement | null>(null);
  const boundaryRef = useRef<Uint8Array>(new Uint8Array());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);
  const previousPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);

  const [pages, setPages] = useState<CustomColoringPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPaint, setSelectedPaint] = useState(DEFAULT_PAINT);
  const [tool, setTool] = useState<CustomTool>("bucket");
  const [brushSize, setBrushSize] = useState(18);
  const [zoom, setZoom] = useState(1);
  const [gateAction, setGateAction] = useState<GateAction>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [, setHistoryRevision] = useState(0);

  const selectedPage = pages.find((page) => page.id === selectedPageId) || null;
  const paints = ART_PAINTS.filter((paint) => paint.colors.length === 1);

  const refreshPages = async (preferredId?: string) => {
    try {
      const next = await listCustomColoringPages();
      setPages(next);
      setSelectedPageId((current) => {
        if (preferredId && next.some((page) => page.id === preferredId)) return preferredId;
        if (current && next.some((page) => page.id === current)) return current;
        return next[0]?.id || null;
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Custom pages could not be opened on this device.");
    }
  };

  useEffect(() => {
    void refreshPages();
  }, []);

  const renderComposite = () => {
    const canvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    const lineImage = lineImageRef.current;
    if (!canvas || !colorCanvas || !lineImage) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fffef9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(colorCanvas, 0, 0);
    context.drawImage(lineImage, 0, 0, canvas.width, canvas.height);
  };

  const restoreColorLayer = async (dataUrl: string) => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return;
    const context = colorCanvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    if (dataUrl) {
      const image = await loadImage(dataUrl);
      context.drawImage(image, 0, 0, colorCanvas.width, colorCanvas.height);
    }
    renderComposite();
  };

  const pushHistory = (dataUrl: string) => {
    const previous = historyRef.current[historyRef.current.length - 1];
    if (previous === dataUrl) return;
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), dataUrl];
    redoRef.current = [];
    setHistoryRevision((value) => value + 1);
  };

  const capture = async () => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas || !selectedPage) return;
    const dataUrl = colorCanvas.toDataURL("image/png");
    pushHistory(dataUrl);
    try {
      await saveCustomColoringDraft(profileId, selectedPage.id, dataUrl);
    } catch {
      setMessage("Your coloring is still on screen, but ColorQuest could not autosave it.");
    }
  };

  useEffect(() => {
    if (!selectedPage) {
      setReady(false);
      return;
    }

    let cancelled = false;
    setReady(false);
    setMessage("");
    setZoom(1);

    (async () => {
      try {
        const lineImage = await loadImage(selectedPage.lineArtDataUrl);
        if (cancelled) return;
        lineImageRef.current = lineImage;

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = selectedPage.width;
        canvas.height = selectedPage.height;

        const colorCanvas = document.createElement("canvas");
        colorCanvas.width = selectedPage.width;
        colorCanvas.height = selectedPage.height;
        colorCanvasRef.current = colorCanvas;

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = selectedPage.width;
        maskCanvas.height = selectedPage.height;
        const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
        if (!maskContext) throw new Error("ColorQuest could not prepare the paint boundaries.");
        maskContext.drawImage(lineImage, 0, 0, selectedPage.width, selectedPage.height);
        const linePixels = maskContext.getImageData(0, 0, selectedPage.width, selectedPage.height);
        const boundary = new Uint8Array(selectedPage.width * selectedPage.height);
        for (let pixel = 0; pixel < boundary.length; pixel += 1) {
          boundary[pixel] = linePixels.data[pixel * 4 + 3] > 24 ? 1 : 0;
        }
        boundaryRef.current = boundary;

        const draft = await loadCustomColoringDraft(profileId, selectedPage.id);
        if (cancelled) return;
        if (draft?.colorDataUrl) await restoreColorLayer(draft.colorDataUrl);
        else renderComposite();

        const initial = colorCanvas.toDataURL("image/png");
        historyRef.current = [initial];
        redoRef.current = [];
        setHistoryRevision((value) => value + 1);
        setReady(true);
        if (draft?.colorDataUrl) setMessage("Your recent coloring is ready to continue.");
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "This coloring page could not be opened.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPageId, profileId]);

  const selectedColor = getArtPaint(selectedPaint).colors[0];

  const bucket = async (x: number, y: number) => {
    const page = selectedPage;
    const colorCanvas = colorCanvasRef.current;
    if (!page || !colorCanvas) return;
    const context = colorCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const layer = context.getImageData(0, 0, page.width, page.height);
    const rgb = selectedColor.match(/[a-f\d]{2}/gi)?.map((value) => parseInt(value, 16)) || [255, 96, 79];
    const changed = floodFillPixels(
      layer.data,
      page.width,
      page.height,
      boundaryRef.current,
      x,
      y,
      [rgb[0], rgb[1], rgb[2], 255],
    );
    if (!changed) {
      setMessage("Try tapping inside an open white area.");
      return;
    }
    context.putImageData(layer, 0, 0);
    renderComposite();
    await capture();
  };

  const drawSegment = (
    context: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = selectedColor;
    context.lineWidth = tool === "eraser" ? brushSize * 1.5 : brushSize;
    context.globalAlpha = tool === "crayon" ? 0.5 : 1;

    const stroke = (offsetX = 0, offsetY = 0) => {
      context.beginPath();
      context.moveTo(from.x + offsetX, from.y + offsetY);
      context.lineTo(to.x + offsetX, to.y + offsetY);
      context.stroke();
    };

    if (tool === "crayon") {
      stroke();
      stroke(brushSize * 0.12, -brushSize * 0.08);
      stroke(-brushSize * 0.1, brushSize * 0.1);
    } else {
      stroke();
    }
    context.restore();
  };

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    event.preventDefault();
    const point = pointOnCanvas(event);
    if (tool === "bucket") {
      void bucket(point.x, point.y);
      return;
    }
    drawingRef.current = true;
    previousPointRef.current = point;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !previousPointRef.current) return;
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return;
    const context = colorCanvas.getContext("2d");
    if (!context) return;
    const next = pointOnCanvas(event);
    drawSegment(context, previousPointRef.current, next);
    previousPointRef.current = next;
    renderComposite();
  };

  const stop = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    previousPointRef.current = null;
    void capture();
  };

  const undo = async () => {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop()!;
    redoRef.current.push(current);
    await restoreColorLayer(historyRef.current[historyRef.current.length - 1]);
    if (selectedPage) {
      await saveCustomColoringDraft(profileId, selectedPage.id, historyRef.current[historyRef.current.length - 1]);
    }
    setHistoryRevision((value) => value + 1);
  };

  const redo = async () => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    await restoreColorLayer(next);
    if (selectedPage) await saveCustomColoringDraft(profileId, selectedPage.id, next);
    setHistoryRevision((value) => value + 1);
  };

  const startOver = async () => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas || !selectedPage) return;
    colorCanvas.getContext("2d")?.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    renderComposite();
    const blank = colorCanvas.toDataURL("image/png");
    historyRef.current = [blank];
    redoRef.current = [];
    setHistoryRevision((value) => value + 1);
    await deleteCustomColoringDraft(profileId, selectedPage.id).catch(() => undefined);
    setMessage("Fresh coloring page ready!");
  };

  const saveFinished = async () => {
    if (!selectedPage || !canvasRef.current) return;
    await onSaveArtwork(
      canvasRef.current.toDataURL("image/png"),
      `${profileName}'s ${selectedPage.title}`,
    );
    setMessage("Saved to the family gallery! ⭐");
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setMessage("Preparing your coloring page…");
    try {
      const prepared = await prepareLineArt(file);
      const saved = await addCustomColoringPage({
        title: safeCustomColoringTitle(file.name),
        ...prepared,
      });
      await refreshPages(saved.id);
      setMessage("Coloring page added. Pick a color and start!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ColorQuest could not add this page.");
    } finally {
      setBusy(false);
    }
  };

  const passGate = async () => {
    const action = gateAction;
    setGateAction(null);
    if (!action) return;
    if (action.type === "upload") {
      window.setTimeout(() => fileInputRef.current?.click(), 0);
      return;
    }

    setBusy(true);
    try {
      await deleteCustomColoringPage(action.page.id);
      await refreshPages();
      setMessage("The page and its saved coloring drafts were removed from this device.");
    } catch {
      setMessage("ColorQuest could not remove that page.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="custom-coloring-studio" aria-label="My coloring pages">
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          void handleUpload(file);
        }}
      />

      <div className="custom-coloring-heading">
        <div>
          <p className="eyebrow">Family coloring shelf</p>
          <h3>My coloring pages</h3>
          <p>Grown-ups can add line-art pictures from this device. They stay private on this device.</p>
        </div>
        <button className="primary-button" disabled={busy} onClick={() => setGateAction({ type: "upload" })}>
          + Add a coloring page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="custom-coloring-empty">
          <span aria-hidden="true">🖍️</span>
          <strong>No family pages yet</strong>
          <p>Add a clean black-and-white PNG, JPG, WebP, or SVG. Closed outlines work best with the paint bucket.</p>
          <button className="primary-button" disabled={busy} onClick={() => setGateAction({ type: "upload" })}>Ask a grown-up to add one</button>
        </div>
      ) : (
        <>
          <nav className="custom-coloring-shelf" aria-label="Uploaded coloring pages">
            {pages.map((page) => (
              <article key={page.id} className={page.id === selectedPageId ? "active" : ""}>
                <button className="custom-page-card" onClick={() => setSelectedPageId(page.id)} aria-pressed={page.id === selectedPageId}>
                  <img src={page.lineArtDataUrl} alt="" />
                  <span><strong>{page.title}</strong><small>Tap to color</small></span>
                </button>
                <button className="custom-page-delete" aria-label={`Remove ${page.title}`} onClick={() => setGateAction({ type: "delete", page })}>×</button>
              </article>
            ))}
          </nav>

          {selectedPage && (
            <div className="custom-coloring-workbench">
              <div className="custom-coloring-toolbar">
                <div className="custom-tool-row" aria-label="Coloring tools">
                  {([
                    ["bucket", "🪣", "Fill"],
                    ["brush", "🖌️", "Brush"],
                    ["crayon", "🖍️", "Crayon"],
                    ["eraser", "🧽", "Eraser"],
                  ] as const).map(([id, icon, label]) => (
                    <button key={id} className={tool === id ? "active" : ""} onClick={() => setTool(id)} aria-pressed={tool === id}>
                      <span aria-hidden="true">{icon}</span>{label}
                    </button>
                  ))}
                </div>

                {tool !== "bucket" && (
                  <label className="custom-brush-size">
                    <span>Size</span>
                    <input type="range" min="5" max="52" step="1" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
                  </label>
                )}

                <div className="custom-color-palette" aria-label="Paint colors">
                  {paints.map((paint) => (
                    <button
                      key={paint.id}
                      className={selectedPaint === paint.id ? "active" : ""}
                      style={{ background: paintCss(paint.id) }}
                      title={paint.label}
                      aria-label={`Choose ${paint.label}`}
                      onClick={() => setSelectedPaint(paint.id)}
                    />
                  ))}
                </div>

                <div className="custom-history-actions">
                  <button disabled={historyRef.current.length <= 1} onClick={() => void undo()}>↶ Undo</button>
                  <button disabled={redoRef.current.length === 0} onClick={() => void redo()}>↷ Redo</button>
                  <button onClick={() => void startOver()}>Start over</button>
                </div>
              </div>

              <div className="custom-canvas-column">
                <div className="custom-page-title"><strong>{selectedPage.title}</strong><small>{tool === "bucket" ? "Tap inside a closed area to fill it." : "Draw on the page with your finger, mouse, or stylus."}</small></div>
                <div className="custom-canvas-viewport">
                  <canvas
                    ref={canvasRef}
                    className={`custom-coloring-canvas tool-${tool}`}
                    style={{ transform: `scale(${zoom})` }}
                    onPointerDown={start}
                    onPointerMove={move}
                    onPointerUp={stop}
                    onPointerCancel={stop}
                    onPointerLeave={stop}
                    aria-label={`Color ${selectedPage.title}`}
                  />
                </div>
                <div className="custom-zoom-row">
                  <span>Zoom</span>
                  {[0.75, 1, 1.25, 1.5].map((value) => <button key={value} className={zoom === value ? "active" : ""} onClick={() => setZoom(value)}>{Math.round(value * 100)}%</button>)}
                </div>
                <div className="custom-save-row">
                  <p>✓ Progress autosaves separately for each child profile.</p>
                  <button className="save-button" disabled={!ready} onClick={() => void saveFinished()}>Save to gallery</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {message && <p className="gallery-message" role="status">{message}</p>}
      <p className="gallery-privacy">🔒 Imported pages and coloring progress stay on this device unless a grown-up chooses to export finished artwork.</p>

      {gateAction && (
        <div className="custom-coloring-gate-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGateAction(null); }}>
          <div className="custom-coloring-gate-dialog" role="dialog" aria-modal="true" aria-label="Grown-up check">
            <GrownUpGate
              title="Grown-ups only"
              intro={gateAction.type === "upload" ? "A grown-up can choose a coloring-page image from this device." : "A grown-up can remove this family coloring page and its saved drafts."}
              confirmLabel={gateAction.type === "upload" ? "Choose an image" : "Remove page"}
              onPass={() => void passGate()}
              onCancel={() => setGateAction(null)}
              cancelLabel="Cancel"
              compact
            />
          </div>
        </div>
      )}
    </section>
  );
}
