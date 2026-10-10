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


### V1.1 — Files/PDF import and focused coloring

**Status: Done** (2026-10-09)

Triggered by phone UX testing.

- The library must present two explicit grown-up entry points:
  - **Photos** for the system photo library;
  - **Files & PDF** for Recent, Downloads, cloud/file providers, images, and PDF documents.
- Prefer the browser's document file picker when available; fall back to a mixed-MIME file input so Android does not force an image-only photo picker.
- PDF rendering uses Mozilla PDF.js bundled with the app. The PDF bytes stay on-device; the selected page is rendered locally and then passed through the same line-art cleanup pipeline as images.
- Multi-page PDFs show an in-app page preview/selector before import.
- Once a family page is chosen, that page becomes the visual hero:
  - the family shelf disappears;
  - the ColorQuest/My Pages library tabs collapse out of the way;
  - a compact **My pages** back control replaces the shelf;
  - the canvas is first and full-width on phones;
  - coloring tools follow the canvas rather than pushing it below a large library header.
- Numeric camera/file names should display as **My coloring page** rather than exposing an unfriendly file number.

## 6. 2026-10-09 UX + Teacher Hard Check

**Status: Done**

Detailed review: [UX_TEACHER_HARD_CHECK_2026-10-09.md](UX_TEACHER_HARD_CHECK_2026-10-09.md)

Hard-check release requirements:

- Parent-only actions use a reusable local Parent PIN rather than a math question once a PIN has been established.
- New installs create the Parent PIN during first-profile setup; legacy installs without a PIN bootstrap once and then create one.
- Adding another child profile requires Parent PIN.
- Supervised Science Lab materials/procedures stay hidden until Parent PIN is entered.
- Ages 1–3 are treated as requiring at least a grown-up nearby for every hands-on lab.
- Child Home prioritizes one next action, uses age-appropriate labels, and omits parent-marketing/stat clutter.
- Activity-specific reminders must match the discipline rather than reuse art copy.
- Fifi’s Home greeting persists per profile/version rather than repeating every session.
- Storybook mobile shelf must not push the active reader far below a growing catalog.
- Real child usability testing remains separate from synthetic review and must never be reported as completed until human participants actually take part.

## 7. Abacus Lab — Soroban Math V1

**Status: Done** (2026-10-09)

Detailed specification: [ABACUS_LAB_SPEC.md](ABACUS_LAB_SPEC.md)

Product decision:

- Abacus Lab is **inside Math**, not a ninth Home activity.
- Math contains two paths:
  - **Math Trail / Number Games** — existing adaptive concept lessons;
  - **Abacus Lab / Abacus Play** — real soroban instruction and practice.
- The virtual instrument uses legal Japanese soroban states: one upper 5-bead and four lower 1-beads per rod.
- Beads support tap, swipe, mouse, and keyboard controls and snap to legal states.
- The child performs carry/borrow/complement movements; ColorQuest does not auto-carry or auto-solve.
- Learn, Practice, and Free Abacus modes are included.
- Abacus progress is stored separately from adaptive Math progress because conventional arithmetic ability and soroban experience are not the same skill.
- Ages 1–3 receive exploratory **Abacus Play** only; formal soroban instruction begins later.
- V1 progresses through place value, direct addition/subtraction, complements to 5/10, multi-digit arithmetic, and basic multiplication/division result practice.
- Complete traditional soroban multiplication/division layouts and Mental Abacus are roadmap work and must not be described as already taught by V1.
- No timer, leaderboard, streak pressure, or public score is part of V1.

V1 release requirements:

- legal bead-state engine tests pass;
- all generated challenges fit the available rods;
- age curriculum and rod availability tests pass;
- per-child local progress/resume tests pass;
- Math Trail regressions remain green;
- Abacus Lab hides irrelevant Math Trail page navigation while active;
- phone/tablet layout keeps rods touchable and scrollable instead of shrinking them excessively;
- full web + Android repository QC passes;
- exact-main Pages deployment succeeds;
- deployed artifact contains Abacus Lab code.

## 8. Storybook workflow

- Daily story content uses `src/story-data.ts`, story art under `public/stories/`, and `DAILY_STORY_LOG.md`.
- Story art/content must be original and age-appropriate.
- Inclusion themes should be expressed through plot and participation, not tokenism or lectures.
- Every page needs meaningful alt text.
- A story is not reported live until the exact-commit GitHub Pages deployment succeeds and the deployed artifact contains the story.
- The illustrated PDF companion is generated only after successful source/web delivery verification.

## 9. Roadmap

| Priority | Item | Status | Notes |
| --- | --- | --- | --- |
| P0 | Custom Coloring Pages V1 | Done | Parent-gated local upload, bucket/brush/crayon/eraser, drafts, gallery export |
| P0 | PWA deployment/cache correctness | Done | Network-first authored bundle/story delivery in service worker |
| P0 | Creative-work autosave | Done | Built-in Draw/Color drafts are device-local |
| P0 | Daily story delivery verification | Done | Exact-commit deploy verification added to workflow expectations |
| P0 | Files/PDF picker + focused custom-page workbench | Done | Android Files/Recent access, local PDF page rendering, selected-page hero UX |
| P0 | UX + teacher hard check | Done | 106 tests, web build, Android release-check, exact-commit Pages deploy, deployed-artifact verification |
| P0 | Abacus Lab V1 | Done | 120 tests, legal soroban engine, Learn/Practice/Free modes, local progress, full web/Android QC, exact-commit Pages verification |
| P0 | Real five-day child usability study | Planned | Human participants only; age-capped sessions and adult consent per hard-check protocol |
| P1 | Custom page crop + rotate | Planned | Parent import preparation screen |
| P1 | Adjustable line-cleanup threshold | Planned | Helps faint scans and gray worksheets |
| P1 | Rename / age-tag / reorder family pages | Planned | Parent-managed shelf metadata |
| P1 | Custom-page thumbnail and storage management | Planned | Show local storage usage and clearer delete/manage flow |
| P1 | Better imported-page bucket boundaries | Planned | Gap closing / optional segmentation improvements |
| P1 | Older-child story library | Planned | Purpose-built ages 7–9 and 10–12 stories with original art and richer literacy prompts |
| P1 | Story library navigation as catalog grows | Planned | Search/age grouping/recent additions |
| P1 | Teacher-style parent learning summary | Planned | Factual explored/practiced/next-prompt summary; never claim mastery without evidence |
| P1 | Traditional soroban multiplication/division algorithms | Planned | Instructor-reviewed multi-rod method with step verification, beyond V1 final-answer practice |
| P1 | Mental Abacus progression | Planned | Fade labels/beads only after demonstrated soroban fluency; never age-only promotion |
| P2 | Web bundle performance benchmark | Planned | Production app.js is ~582 KB minified / ~190 KB gzip; benchmark low-end devices during real child field study before deciding whether more code splitting is needed |
| P2 | Abacus decimals / money | Planned | Decimal marker, place-value lessons, carefully reviewed arithmetic |
| P2 | Optional private abacus fluency mode | Planned | Local timing only for experienced children; no leaderboard |
| P2 | Backup/export family-created content | Planned | Parent-controlled portable backup; privacy review required |
| P2 | Native Android release preparation | Planned | Only after web/PWA feature and QC baseline are stable |
| P2 | Google Play launch | Hold | No Play release yet; resume when product/release checklist is ready |

## 10. Feature-specific QC checklist: Custom Coloring Pages

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

## 11. Documentation map

- `COLORQUEST_SOP_ROADMAP.md` — project process, architecture, roadmap, major feature state.
- `CURRICULUM_ROADMAP.md` — learning/curriculum expansion.
- `MATH_QA_PLAN.md` — adaptive-math QA.
- `DAILY_STORY_LOG.md` — daily story rotation/content log.
- `ANDROID_RELEASE.md`, `PLAY_STORE_SUBMISSION.md`, `DATA_SAFETY.md` — Android/Play release preparation.
- `RELEASE_SUMMARY.md` — current release-package summary.
- `UX_TEACHER_HARD_CHECK_2026-10-09.md` — app-wide child UX, teacher, safety, synthetic usability review and real field-test protocol.
- `ABACUS_LAB_SPEC.md` — Soroban architecture, curriculum, age behavior, progress model, QC requirements, and advanced roadmap.

## 12. Change log

- **2026-10-08:** Created project SOP/living roadmap. Added Custom Coloring Pages V1 architecture and QC requirements. Clarified web/PWA vs future Android/Play release boundaries.\n- **2026-10-08:** Custom Coloring Pages V1 passed full repository QC and was merged to `main`.
- **2026-10-09:** Phone UX review exposed two V1 wrinkles: image-only picking routed Android into Photos instead of Files/Recent/PDF, and the family shelf competed visually with the selected canvas. V1.1 added local PDF rendering, explicit Photos vs Files pickers, a multi-page PDF chooser, friendlier numeric filenames, and a focused selected-page workbench. Full web/Android repository QC passed before merge.
- **2026-10-09:** Hard check opened: app-wide child UX + teacher review found the arithmetic grown-up gate insufficient for older children and found supervised lab labels were not enforced in behavior. Parent PIN, lab procedure gating, age-aware home/navigation cleanup, and accessibility changes entered QC.
- **2026-10-09:** Hard check completed. Final branch QC passed 106/106 automated tests plus TypeScript/Vite production build, Android sync, Android unit/minified release-bundle check, privacy/support asset checks, and release artifact creation. Squash merge `6273069339e711fc88ead2b6059f190560027f02` deployed successfully in GitHub Pages run `37982334065`; the deployed artifact was inspected for the Parent PIN, age-aware navigation, supervised-lab gate/exit, and activity-specific reminder changes. The five-day child-control-group section remains explicitly synthetic; the real human field study is still P0 Planned.
- **2026-10-09:** Abacus Lab V1 entered QC. Math now has a planned two-path architecture (Math Trail + Abacus Lab) with a legal-state Japanese soroban engine, Learn/Practice/Free modes, age-aware curriculum, separate per-child abacus progress, and advanced traditional/mental-abacus work explicitly deferred to the roadmap.


- **2026-10-09:** Abacus Lab V1 completed. Final QC branch head `c8bc47e119ecf64c9eed7d66a103ea64e4b246b8` passed GitHub Actions run `38006665865`: 120/120 automated tests across 15 test files, TypeScript/Vite production build, Android sync, Android unit tests, minified release-bundle engineering build, privacy/support checks, and artifact generation. PR #11 was squash-merged as `e3c8a3e1ad9ec7f04b7405f53b81f56c4eba9cc3`. GitHub Pages run `38006998333` completed successfully for that exact merge commit. The deployed Pages artifact (`sha256:01edcbb1766434e8ba6f71443f8269a07571fa74233e2b9093bcd89d6fe9712d`) was unpacked and verified to contain Abacus Lab, Free Abacus, Friends of 10, Math Trail, the interactive Japanese soroban, and the updated Math activity copy. The Android AAB remains an engineering artifact; ColorQuest is not yet published on Google Play.
