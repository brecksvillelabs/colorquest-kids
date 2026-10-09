# ColorQuest Kids — Project SOP & Living Roadmap

**Owner:** Brecksville Labs  
**Repository:** `brecksvillelabs/colorquest-kids`  
**Primary product today:** installable web/PWA. The Android project is maintained for testing and future Google Play release; ColorQuest is **not yet published on Google Play**.

This document is the project-level source of truth for how ColorQuest is changed, validated, and released. It is intentionally separate from subject-specific documents such as `CURRICULUM_ROADMAP.md`, `MATH_QA_PLAN.md`, and `PLAY_STORE_SUBMISSION.md`.

## 1. Mandatory update rule

Update this file in the **same change set** whenever work materially changes any of the following:

- product architecture or local-data model;
- parent/child safety boundaries;
- release or deployment process;
- QC baseline or required automated checks;
- roadmap priority or status;
- a recurring automation/workflow;
- a major feature entering or leaving production.

Routine daily story additions belong in `DAILY_STORY_LOG.md`; do not create noisy SOP entries for each story unless the story system itself changes.

Roadmap status vocabulary is fixed: **Planned / In progress / Done / Hold**.

## 2. Product principles

1. **Kid-first and calm.** No ads, public profiles, social pressure, dark patterns, or unnecessary accounts.
2. **Parent-controlled device access.** File pickers, external links, destructive family-library actions, and similar device-level actions require the grown-up gate.
3. **Private by default.** Child profiles, artwork, drafts, and family-imported coloring pages remain on-device unless a grown-up explicitly exports/shares something.
4. **Offline-capable core.** Built-in creative and learning content should remain useful without a network connection.
5. **Truthful release language.** A source commit is not “live” until the relevant build/deployment for that exact commit succeeds.
6. **No silent data loss.** Creative work should autosave when practical; destructive actions require clear confirmation or a grown-up boundary.
7. **Accessibility is functional, not decorative.** Read-aloud, alt text, touch/stylus support, large targets, and non-color-only cues should be preserved as features evolve.

## 3. Current architecture

### Web/PWA

- React + TypeScript + Vite.
- GitHub Pages deploys from `main` through `.github/workflows/deploy-pages.yml`.
- The service worker uses a network-first path for authored app JS/CSS and story art so newly deployed content is not hidden indefinitely by an older cache.
- Fixed starter assets remain available offline.

### Android

- Capacitor project under `android/`.
- Package: `com.brecksvillelabs.colorquestkids`.
- The Android release-check workflow validates buildability but its CI AAB is an engineering artifact, not a production Play upload.
- There is no current Google Play production release.

### Local family data

- Profiles and learning progress: localStorage through `profile-data.ts`.
- Saved artwork: IndexedDB through `artwork-store.ts`.
- Recent Draw/Color drafts: IndexedDB through `canvas-drafts.ts`.
- Family-uploaded coloring pages and their per-child paint layers: separate IndexedDB database through `custom-coloring-store.ts`.
- No cloud account is required for these stores.

## 4. Standard change SOP

### A. Before coding

1. Read this document plus the feature-specific source/docs.
2. Inspect current `main`; do not assume an earlier chat description is still current.
3. Identify privacy, child-safety, offline, and migration implications.
4. Prefer a QC branch for substantial changes. Keep `main` usable.

### B. During implementation

1. Reuse existing interaction patterns and storage conventions.
2. Add regression tests for pure logic and high-risk behavior.
3. Keep parent-only actions behind `GrownUpGate`.
4. Do not add third-party trackers, ad SDKs, or unnecessary remote dependencies.
5. Update this SOP/roadmap if architecture or priorities changed.

### C. Pre-main QC

For substantial changes, open a temporary PR/QC branch so the repository's Android release check runs.

Required minimum:

- `npm run test`
- `npm run build`
- `npm run android:sync`
- Android unit tests and release-bundle engineering check when the workflow is applicable
- no TypeScript errors
- no missing production assets
- privacy/support assets remain present
- relevant UI regression checks pass

Do not advance a known-broken candidate to `main`.

### D. Main/deployment verification

After the validated change reaches `main`:

1. Capture the exact `main` commit SHA.
2. Verify GitHub Pages workflow for that SHA reaches **success**.
3. For PWA-visible changes, confirm the deployed artifact contains the expected code/assets.
4. Check service-worker behavior when new fixed-name assets or content catalogs are involved.
5. Only then report the feature/content as live.

## 5. Custom Coloring Pages — V1 specification

**Status: Done** (October 2026 V1)

Goal: let a grown-up add a coloring sheet from the device, then let children color it privately inside ColorQuest.

### V1 behavior

- Creative Studio → Color contains two libraries:
  - **ColorQuest pages** — existing hand-built SVG coloring scenes.
  - **My coloring pages** — family-imported pages.
- Adding and deleting family pages requires `GrownUpGate`.
- Accepted uploads: PNG, JPG/JPEG, WebP, SVG; maximum 12 MB.
- Imports are rasterized locally; SVG is not injected into the DOM.
- Images are converted into high-contrast transparent line art, capped at 1200 px on the longest side.
- A one-pixel line dilation helps close tiny scan gaps.
- Custom tools:
  - paint bucket with boundary-aware flood fill;
  - brush;
  - crayon;
  - eraser;
  - undo/redo;
  - start over;
  - zoom presets with scroll/pan viewport.
- Paint progress autosaves per child profile.
- Finished composites can be saved to the existing private family gallery.
- Imported source/derived page data never leaves the device unless a grown-up explicitly exports a finished creation.

### V1 known limits

- Bucket fill works best on clean black-and-white pages with closed outlines.
- Photographs, heavy shading, very faint lines, or large gaps can produce imperfect regions.
- V1 uses automatic line cleanup; interactive crop/rotate/threshold controls are deferred.
- Imported raster pages do not become semantic independent SVG shapes.

## 6. Storybook workflow

- Daily story content uses `src/story-data.ts`, story art under `public/stories/`, and `DAILY_STORY_LOG.md`.
- Story art/content must be original and age-appropriate.
- Inclusion themes should be expressed through plot and participation, not tokenism or lectures.
- Every page needs meaningful alt text.
- A story is not reported live until the exact-commit GitHub Pages deployment succeeds and the deployed artifact contains the story.
- The illustrated PDF companion is generated only after successful source/web delivery verification.

## 7. Roadmap

| Priority | Item | Status | Notes |
| --- | --- | --- | --- |
| P0 | Custom Coloring Pages V1 | Done | Parent-gated local upload, bucket/brush/crayon/eraser, drafts, gallery export |
| P0 | PWA deployment/cache correctness | Done | Network-first authored bundle/story delivery in service worker |
| P0 | Creative-work autosave | Done | Built-in Draw/Color drafts are device-local |
| P0 | Daily story delivery verification | Done | Exact-commit deploy verification added to workflow expectations |
| P1 | Custom page crop + rotate | Planned | Parent import preparation screen |
| P1 | Adjustable line-cleanup threshold | Planned | Helps faint scans and gray worksheets |
| P1 | Rename / age-tag / reorder family pages | Planned | Parent-managed shelf metadata |
| P1 | Custom-page thumbnail and storage management | Planned | Show local storage usage and clearer delete/manage flow |
| P1 | Better imported-page bucket boundaries | Planned | Gap closing / optional segmentation improvements |
| P1 | Story library navigation as catalog grows | Planned | Search/age grouping/recent additions |
| P2 | Backup/export family-created content | Planned | Parent-controlled portable backup; privacy review required |
| P2 | Native Android release preparation | Planned | Only after web/PWA feature and QC baseline are stable |
| P2 | Google Play launch | Hold | No Play release yet; resume when product/release checklist is ready |

## 8. Feature-specific QC checklist: Custom Coloring Pages

Before marking V1 Done:

- Supported image validation and 12 MB cap tested.
- Title sanitization tested.
- Resize logic tested.
- Flood fill cannot cross a synthetic ink boundary.
- Upload button does not open the device picker before grown-up gate success.
- Delete requires grown-up gate.
- Imported SVG is rasterized rather than inserted as live markup.
- Per-child drafts restore correctly.
- Undo/redo and Start over operate on the color layer, not the line art.
- Saving to gallery includes both color and line art.
- Built-in ColorQuest pages remain unchanged and navigable.
- Custom mode hides irrelevant built-in page navigation.
- Phone/tablet layouts remain usable.
- Full repository QC passes.
- Exact `main` GitHub Pages deployment succeeds.
- Deployed artifact contains custom-coloring code.

## 9. Documentation map

- `COLORQUEST_SOP_ROADMAP.md` — project process, architecture, roadmap, major feature state.
- `CURRICULUM_ROADMAP.md` — learning/curriculum expansion.
- `MATH_QA_PLAN.md` — adaptive-math QA.
- `DAILY_STORY_LOG.md` — daily story rotation/content log.
- `ANDROID_RELEASE.md`, `PLAY_STORE_SUBMISSION.md`, `DATA_SAFETY.md` — Android/Play release preparation.
- `RELEASE_SUMMARY.md` — current release-package summary.

## 10. Change log

- **2026-10-08:** Created project SOP/living roadmap. Added Custom Coloring Pages V1 architecture and QC requirements. Clarified web/PWA vs future Android/Play release boundaries.\n- **2026-10-08:** Custom Coloring Pages V1 passed full repository QC and was merged to `main`.
