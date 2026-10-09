import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
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
  clampPdfPage,
  fitInside,
  floodFillPixels,
  isPdfColoringFile,
  isSupportedColoringFile,
  safeCustomColoringTitle,
} from "./custom-coloring-utils";

type CustomTool = "bucket" | "brush" | "crayon" | "eraser";
type GateAction =
  | { type: "upload-photo" }
  | { type: "upload-file" }
  | { type: "delete"; page: CustomColoringPage }
  | null;

type PdfImportState = {
  document: PDFDocumentProxy;
  fileName: string;
  pageCount: number;
  pageNumber: number;
  previewDataUrl: string;
};

type FilePickerHandle = { getFile: () => Promise<File> };
type FilePickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FilePickerHandle[]>;
};

const MAX_HISTORY = 12;
const NAVY = [23, 59, 109] as const;
let pdfWorkerConfigured = false;

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

function displayPageTitle(title: string) {
  return /^\d+$/.test(title.trim()) ? "My coloring page" : title;
}

function pdfPageTitle(fileName: string, pageNumber: number, pageCount: number) {
  const title = safeCustomColoringTitle(fileName);
  return pageCount > 1 ? \`${title} · page ${pageNumber}\` : title;
}

async function prepareLineArtFromCanvas(sourceCanvas: HTMLCanvasElement) {
  const size = fitInside(sourceCanvas.width, sourceCanvas.height, 1200);
  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = size.width;
  workingCanvas.height = size.height;
  const sourceContext = workingCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("This browser cannot prepare a coloring page.");

  sourceContext.fillStyle = "#ffffff";
  sourceContext.fillRect(0, 0, size.width, size.height);
  sourceContext.drawImage(sourceCanvas, 0, 0, size.width, size.height);

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

async function prepareImageLineArt(file: File) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  if (!naturalWidth || !naturalHeight) throw new Error("This image has no usable dimensions.");

  const size = fitInside(naturalWidth, naturalHeight, 1200);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = size.width;
  sourceCanvas.height = size.height;
  const context = sourceCanvas.getContext("2d");
  if (!context) throw new Error("This browser cannot prepare a coloring page.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(image, 0, 0, size.width, size.height);

  return prepareLineArtFromCanvas(sourceCanvas);
}

async function loadPdfDocument(file: File) {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfWorkerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    pdfWorkerConfigured = true;
  }
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data, isEvalSupported: false }).promise;
}

async function renderPdfPageCanvas(document: PDFDocumentProxy, pageNumber: number, maxDimension: number) {
  const page = await document.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.max(0.25, Math.min(2.5, maxDimension / Math.max(base.width, base.height)));
  const viewport = page.getViewport({ scale });
  const canvas = document.ownerDocument?.createElement?.("canvas") || window.document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot render the PDF page.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({
    canvasContext: context,
    viewport,
    background: "#ffffff",
  }).promise;
  page.cleanup();
  return canvas;
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
  onFocusChange,
}: {
  profileId: string;
  profileName: string;
  onSaveArtwork: (dataUrl: string, title: string) => Promise<void>;
  onFocusChange?: (focused: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineImageRef = useRef<HTMLImageElement | null>(null);
  const boundaryRef = useRef<Uint8Array>(new Uint8Array());
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPdfRef = useRef<PDFDocumentProxy | null>(null);
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
  const [pdfImport, setPdfImport] = useState<PdfImportState | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
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
        return null;
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Custom pages could not be opened on this device.");
    }
  };

  useEffect(() => {
    void refreshPages();
  }, []);

  useEffect(() => {
    onFocusChange?.(Boolean(selectedPage));
  }, [selectedPage, onFocusChange]);

  useEffect(() => () => {
    onFocusChange?.(false);
    void pendingPdfRef.current?.destroy();
    pendingPdfRef.current = null;
  }, [onFocusChange]);

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
      colorCanvasRef.current = null;
      lineImageRef.current = null;
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

        const colorCanvas = window.document.createElement("canvas");
        colorCanvas.width = selectedPage.width;
        colorCanvas.height = selectedPage.height;
        colorCanvasRef.current = colorCanvas;

        const maskCanvas = window.document.createElement("canvas");
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
      \`${profileName}'s ${displayPageTitle(selectedPage.title)}\`,
    );
    setMessage("Saved to the family gallery! ⭐");
  };

  const savePreparedPage = async (
    title: string,
    prepared: Awaited<ReturnType<typeof prepareLineArtFromCanvas>>,
  ) => {
    const saved = await addCustomColoringPage({ title, ...prepared });
    await refreshPages(saved.id);
    setMessage("Coloring page added. The page is ready to color!");
  };

  const openPdfForImport = async (file: File) => {
    setMessage("Opening PDF…");
    const document = await loadPdfDocument(file);
    pendingPdfRef.current = document;
    const pageCount = document.numPages;

    if (pageCount === 1) {
      const canvas = await renderPdfPageCanvas(document, 1, 1200);
      const prepared = await prepareLineArtFromCanvas(canvas);
      await savePreparedPage(pdfPageTitle(file.name, 1, 1), prepared);
      await document.destroy();
      pendingPdfRef.current = null;
      return;
    }

    const previewCanvas = await renderPdfPageCanvas(document, 1, 520);
    setPdfImport({
      document,
      fileName: file.name,
      pageCount,
      pageNumber: 1,
      previewDataUrl: previewCanvas.toDataURL("image/png"),
    });
    setMessage(\`PDF opened. Choose one of ${pageCount} pages.\`);
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setMessage("Preparing your coloring page…");
    try {
      if (!isSupportedColoringFile(file)) {
        const limit = Math.round(CUSTOM_COLORING_MAX_FILE_BYTES / (1024 * 1024));
        throw new Error(\`Choose a PNG, JPG, WebP, SVG, or PDF smaller than ${limit} MB.\`);
      }
      if (isPdfColoringFile(file)) {
        await openPdfForImport(file);
      } else {
        const prepared = await prepareImageLineArt(file);
        await savePreparedPage(safeCustomColoringTitle(file.name), prepared);
      }
    } catch (error) {
      if (pendingPdfRef.current) {
        await pendingPdfRef.current.destroy().catch(() => undefined);
        pendingPdfRef.current = null;
      }
      setPdfImport(null);
      setMessage(error instanceof Error ? error.message : "ColorQuest could not add this page.");
    } finally {
      setBusy(false);
    }
  };

  const previewPdfPage = async (requestedPage: number) => {
    if (!pdfImport) return;
    const pageNumber = clampPdfPage(requestedPage, pdfImport.pageCount);
    setPdfBusy(true);
    try {
      const canvas = await renderPdfPageCanvas(pdfImport.document, pageNumber, 520);
      setPdfImport((current) => current && current.document === pdfImport.document
        ? { ...current, pageNumber, previewDataUrl: canvas.toDataURL("image/png") }
        : current);
    } catch {
      setMessage("ColorQuest could not preview that PDF page.");
    } finally {
      setPdfBusy(false);
    }
  };

  const importSelectedPdfPage = async () => {
    if (!pdfImport) return;
    setPdfBusy(true);
    setMessage(\`Preparing PDF page ${pdfImport.pageNumber}…\`);
    try {
      const canvas = await renderPdfPageCanvas(pdfImport.document, pdfImport.pageNumber, 1200);
      const prepared = await prepareLineArtFromCanvas(canvas);
      await savePreparedPage(
        pdfPageTitle(pdfImport.fileName, pdfImport.pageNumber, pdfImport.pageCount),
        prepared,
      );
      await pdfImport.document.destroy();
      pendingPdfRef.current = null;
      setPdfImport(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ColorQuest could not import that PDF page.");
    } finally {
      setPdfBusy(false);
    }
  };

  const cancelPdfImport = async () => {
    const document = pdfImport?.document || pendingPdfRef.current;
    setPdfImport(null);
    pendingPdfRef.current = null;
    if (document) await document.destroy().catch(() => undefined);
    setMessage("PDF import cancelled.");
  };

  const openFilesPicker = async () => {
    const picker = (window as FilePickerWindow).showOpenFilePicker;
    if (picker) {
      try {
        const handles = await picker({
          multiple: false,
          types: [{
            description: "Coloring pages",
            accept: {
              "application/pdf": [".pdf"],
              "image/png": [".png"],
              "image/jpeg": [".jpg", ".jpeg"],
              "image/webp": [".webp"],
              "image/svg+xml": [".svg"],
            },
          }],
        });
        const file = await handles[0]?.getFile();
        if (file) await handleUpload(file);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Some mobile browsers expose the API but cannot complete it inside an
        // installed PWA. Fall back to the normal document input in that case.
      }
    }
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const passGate = async () => {
    const action = gateAction;
    setGateAction(null);
    if (!action) return;

    if (action.type === "upload-photo") {
      window.setTimeout(() => photoInputRef.current?.click(), 0);
      return;
    }
    if (action.type === "upload-file") {
      await openFilesPicker();
      return;
    }

    setBusy(true);
    try {
      if (selectedPageId === action.page.id) setSelectedPageId(null);
      await deleteCustomColoringPage(action.page.id);
      await refreshPages();
      setMessage("The page and its saved coloring drafts were removed from this device.");
    } catch {
      setMessage("ColorQuest could not remove that page.");
    } finally {
      setBusy(false);
    }
  };

  const uploadActions = (
    <div className="custom-import-actions" aria-label="Add a coloring page">
      <button className="custom-import-photo" disabled={busy} onClick={() => setGateAction({ type: "upload-photo" })}>
        <span aria-hidden="true">🖼️</span><strong>Photos</strong><small>Choose from your photo library</small>
      </button>
      <button className="custom-import-files" disabled={busy} onClick={() => setGateAction({ type: "upload-file" })}>
        <span aria-hidden="true">📁</span><strong>Files & PDF</strong><small>Recent, Downloads, Drive, PDF files</small>
      </button>
    </div>
  );

  return (
    <section className={\`custom-coloring-studio ${selectedPage ? "page-focused" : "library-view"}\`} aria-label="My coloring pages">
      <input
        ref={photoInputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          void handleUpload(file);
        }}
      />
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf,image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          void handleUpload(file);
        }}
      />

      {!selectedPage ? (
        <>
          <div className="custom-coloring-heading">
            <div>
              <p className="eyebrow">Family coloring shelf</p>
              <h3>My coloring pages</h3>
              <p>Add a picture from Photos or choose an image/PDF from Files. Everything stays private on this device.</p>
            </div>
          </div>

          {uploadActions}

          {pages.length === 0 ? (
            <div className="custom-coloring-empty">
              <span aria-hidden="true">🖍️</span>
              <strong>No family pages yet</strong>
              <p>Add a clean black-and-white image or PDF. Closed outlines work best with the paint bucket.</p>
            </div>
          ) : (
            <div className="custom-page-library">
              <div className="custom-page-library-heading">
                <div><strong>Choose a page</strong><small>{pages.length} saved on this device</small></div>
              </div>
              <nav className="custom-coloring-shelf" aria-label="Uploaded coloring pages">
                {pages.map((page) => (
                  <article key={page.id}>
                    <button className="custom-page-card" onClick={() => setSelectedPageId(page.id)}>
                      <img src={page.lineArtDataUrl} alt="" />
                      <span>
                        <strong>{displayPageTitle(page.title)}</strong>
                        <small>{new Date(page.createdAt).toLocaleDateString()} · Tap to color</small>
                      </span>
                    </button>
                    <button className="custom-page-delete" aria-label={\`Remove ${displayPageTitle(page.title)}\`} onClick={() => setGateAction({ type: "delete", page })}>×</button>
                  </article>
                ))}
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="custom-coloring-focus">
          <header className="custom-focus-bar">
            <button className="custom-focus-back" onClick={() => setSelectedPageId(null)}>← My pages</button>
            <div>
              <strong>{displayPageTitle(selectedPage.title)}</strong>
              <small>{tool === "bucket" ? "Tap a closed area to fill it" : "Draw with your finger, mouse, or stylus"}</small>
            </div>
            <button className="custom-focus-add" onClick={() => setGateAction({ type: "upload-file" })}>＋ Add</button>
          </header>

          <div className="custom-coloring-workbench">
            <div className="custom-canvas-column custom-canvas-hero">
              <div className="custom-canvas-viewport">
                <canvas
                  ref={canvasRef}
                  className={\`custom-coloring-canvas tool-${tool}\`}
                  style={{ width: \`${zoom * 100}%\`, maxWidth: "none" }}
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={stop}
                  onPointerCancel={stop}
                  onPointerLeave={stop}
                  aria-label={\`Color ${displayPageTitle(selectedPage.title)}\`}
                />
              </div>
              <div className="custom-canvas-meta">
                <div className="custom-zoom-row">
                  <span>Zoom</span>
                  {[0.75, 1, 1.25, 1.5].map((value) => (
                    <button key={value} className={zoom === value ? "active" : ""} onClick={() => setZoom(value)}>
                      {Math.round(value * 100)}%
                    </button>
                  ))}
                </div>
                <small>✓ Progress autosaves for {profileName}.</small>
              </div>
            </div>

            <aside className="custom-coloring-toolbar" aria-label="Coloring controls">
              <div className="custom-toolbar-label"><strong>Coloring tools</strong><small>Keep the page big; tools stay compact.</small></div>
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
                  <span>Brush size</span>
                  <input type="range" min="5" max="52" step="1" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
                </label>
              )}

              <div className="custom-paint-section">
                <span>Pick a color</span>
                <div className="custom-color-palette" aria-label="Paint colors">
                  {paints.map((paint) => (
                    <button
                      key={paint.id}
                      className={selectedPaint === paint.id ? "active" : ""}
                      style={{ background: paintCss(paint.id) }}
                      title={paint.label}
                      aria-label={\`Choose ${paint.label}\`}
                      onClick={() => setSelectedPaint(paint.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="custom-history-actions">
                <button disabled={historyRef.current.length <= 1} onClick={() => void undo()}>↶ Undo</button>
                <button disabled={redoRef.current.length === 0} onClick={() => void redo()}>↷ Redo</button>
                <button onClick={() => void startOver()}>Start over</button>
              </div>

              <button className="save-button custom-focus-save" disabled={!ready} onClick={() => void saveFinished()}>
                Save to gallery
              </button>
              <p className="custom-focus-privacy">🔒 This page and its progress stay on this device.</p>
            </aside>
          </div>
        </div>
      )}

      {message && <p className="gallery-message custom-coloring-message" role="status">{message}</p>}
      {!selectedPage && <p className="gallery-privacy">🔒 Imported pages and coloring progress stay on this device unless a grown-up exports finished artwork.</p>}

      {gateAction && (
        <div className="custom-coloring-gate-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGateAction(null); }}>
          <div className="custom-coloring-gate-dialog" role="dialog" aria-modal="true" aria-label="Grown-up check">
            <GrownUpGate
              title="Grown-ups only"
              intro={
                gateAction.type === "delete"
                  ? "A grown-up can remove this family coloring page and its saved drafts."
                  : gateAction.type === "upload-photo"
                    ? "A grown-up can choose a coloring-page image from Photos."
                    : "A grown-up can choose an image or PDF from Files, Recent, Downloads, or cloud storage."
              }
              confirmLabel={
                gateAction.type === "delete"
                  ? "Remove page"
                  : gateAction.type === "upload-photo"
                    ? "Open Photos"
                    : "Open Files"
              }
              onPass={() => void passGate()}
              onCancel={() => setGateAction(null)}
              cancelLabel="Cancel"
              compact
            />
          </div>
        </div>
      )}

      {pdfImport && (
        <div className="custom-coloring-gate-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) void cancelPdfImport(); }}>
          <section className="pdf-import-dialog" role="dialog" aria-modal="true" aria-labelledby="pdf-import-title">
            <div className="pdf-import-heading">
              <div><p className="eyebrow">PDF coloring page</p><h3 id="pdf-import-title">Choose the page to color</h3></div>
              <button aria-label="Cancel PDF import" onClick={() => void cancelPdfImport()}>×</button>
            </div>
            <div className="pdf-preview">
              <img src={pdfImport.previewDataUrl} alt={\`Preview of PDF page ${pdfImport.pageNumber}\`} />
              {pdfBusy && <span>Preparing page…</span>}
            </div>
            <div className="pdf-page-picker">
              <button disabled={pdfBusy || pdfImport.pageNumber <= 1} onClick={() => void previewPdfPage(pdfImport.pageNumber - 1)}>←</button>
              <label>
                Page
                <input
                  type="number"
                  min="1"
                  max={pdfImport.pageCount}
                  value={pdfImport.pageNumber}
                  onChange={(event) => void previewPdfPage(Number(event.target.value))}
                />
                <span>of {pdfImport.pageCount}</span>
              </label>
              <button disabled={pdfBusy || pdfImport.pageNumber >= pdfImport.pageCount} onClick={() => void previewPdfPage(pdfImport.pageNumber + 1)}>→</button>
            </div>
            <p>Your PDF never leaves this device. ColorQuest renders only the page you choose.</p>
            <div className="pdf-import-actions">
              <button className="text-button" disabled={pdfBusy} onClick={() => void cancelPdfImport()}>Cancel</button>
              <button className="primary-button" disabled={pdfBusy} onClick={() => void importSelectedPdfPage()}>
                Use page {pdfImport.pageNumber}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
