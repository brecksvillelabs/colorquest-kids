export type CustomColoringPage = {
  id: string;
  title: string;
  createdAt: string;
  width: number;
  height: number;
  /** Transparent PNG containing only the cleaned line art. */
  lineArtDataUrl: string;
};

export type CustomColoringDraft = {
  id: string;
  profileId: string;
  pageId: string;
  colorDataUrl: string;
  updatedAt: string;
};

const DATABASE = "colorquest-custom-coloring-v1";
const VERSION = 1;
const PAGES = "pages";
const DRAFTS = "drafts";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PAGES)) {
        database.createObjectStore(PAGES, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(DRAFTS)) {
        const drafts = database.createObjectStore(DRAFTS, { keyPath: "id" });
        drafts.createIndex("pageId", "pageId", { unique: false });
        drafts.createIndex("profileId", "profileId", { unique: false });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error);
    };
  });
  return databasePromise;
}

function requireIndexedDb() {
  if (typeof window === "undefined" || typeof window.indexedDB === "undefined") {
    throw new Error("Local coloring-page storage is unavailable in this browser.");
  }
}

function customId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listCustomColoringPages(): Promise<CustomColoringPage[]> {
  requireIndexedDb();
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PAGES, "readonly");
    const request = transaction.objectStore(PAGES).getAll();
    request.onsuccess = () => resolve(
      ((request.result as CustomColoringPage[]) || [])
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
    request.onerror = () => reject(request.error);
  });
}

export async function addCustomColoringPage(
  page: Omit<CustomColoringPage, "id" | "createdAt">,
): Promise<CustomColoringPage> {
  requireIndexedDb();
  const saved: CustomColoringPage = {
    ...page,
    id: customId("color-page"),
    createdAt: new Date().toISOString(),
  };
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(PAGES, "readwrite");
    transaction.objectStore(PAGES).put(saved);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  return saved;
}

export async function deleteCustomColoringPage(pageId: string) {
  requireIndexedDb();
  const database = await openDatabase();

  const drafts = await new Promise<CustomColoringDraft[]>((resolve, reject) => {
    const transaction = database.transaction(DRAFTS, "readonly");
    const request = transaction.objectStore(DRAFTS).index("pageId").getAll(pageId);
    request.onsuccess = () => resolve((request.result as CustomColoringDraft[]) || []);
    request.onerror = () => reject(request.error);
  });

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([PAGES, DRAFTS], "readwrite");
    transaction.objectStore(PAGES).delete(pageId);
    const draftStore = transaction.objectStore(DRAFTS);
    drafts.forEach((draft) => draftStore.delete(draft.id));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function customColoringDraftId(profileId: string, pageId: string) {
  return `${profileId}:${pageId}`;
}

export async function loadCustomColoringDraft(profileId: string, pageId: string) {
  requireIndexedDb();
  const database = await openDatabase();
  const id = customColoringDraftId(profileId, pageId);
  return new Promise<CustomColoringDraft | null>((resolve, reject) => {
    const transaction = database.transaction(DRAFTS, "readonly");
    const request = transaction.objectStore(DRAFTS).get(id);
    request.onsuccess = () => resolve((request.result as CustomColoringDraft) || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomColoringDraft(
  profileId: string,
  pageId: string,
  colorDataUrl: string,
) {
  requireIndexedDb();
  const draft: CustomColoringDraft = {
    id: customColoringDraftId(profileId, pageId),
    profileId,
    pageId,
    colorDataUrl,
    updatedAt: new Date().toISOString(),
  };
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DRAFTS, "readwrite");
    transaction.objectStore(DRAFTS).put(draft);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function deleteCustomColoringDraft(profileId: string, pageId: string) {
  requireIndexedDb();
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DRAFTS, "readwrite");
    transaction.objectStore(DRAFTS).delete(customColoringDraftId(profileId, pageId));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
