const CACHE_PREFIX = "colorquest-";
const VERSION = `${CACHE_PREFIX}v2.8.1`;
const BASE = self.registration.scope;

// Keep a small, proven offline starter library bundled in the install cache.
// New daily stories are fetched and cached on demand so publishing a story
// never requires editing this service worker again.
const STARTER_STORY_IDS = ["pips-hat", "moons-sock", "turtles-fast-day", "banana-boots", "polite-volcano", "bubble-bus"];
const STARTER_STORY_IMAGES = STARTER_STORY_IDS.flatMap((story) =>
  [1, 2, 3, 4].map((page) => `${BASE}stories/${story}-${page}.webp`),
);

const APP_JS = `${BASE}assets/app.js`;
const APP_CSS = `${BASE}assets/app.css`;
const SHELL = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}privacy.html`,
  `${BASE}support.html`,
  APP_JS,
  APP_CSS,
  `${BASE}hero-production.png`,
  `${BASE}icon.svg`,
  `${BASE}icon-192.png`,
  `${BASE}icon-512.png`,
  ...STARTER_STORY_IMAGES,
];
const SHELL_URLS = new Set(SHELL.map((url) => new URL(url, BASE).href));

async function networkFirst(request, fallbackUrl = null) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      const copy = response.clone();
      const cache = await caches.open(VERSION);
      await cache.put(request, copy);
    }
    return response;
  } catch {
    return (await caches.match(request)) || (fallbackUrl ? await caches.match(fallbackUrl) : undefined);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" }))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== VERSION)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, `${BASE}index.html`));
    return;
  }

  // The story catalog is compiled into app.js. Always check the network first
  // for the authored JS/CSS so a newly deployed daily story appears promptly,
  // while retaining the latest successful copy for offline use.
  if (url.href === new URL(APP_JS, BASE).href || url.href === new URL(APP_CSS, BASE).href) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Daily story art may be added without changing this worker. Cache every
  // same-origin story image after it is requested so rereads work offline.
  if (url.pathname.includes("/stories/")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (!SHELL_URLS.has(url.href)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
