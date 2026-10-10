# ColorQuest Kids — Abacus Lab Specification

**Feature:** Soroban Abacus Lab  
**Status:** Done — V1 deployed to web/PWA  
**Date:** 2026-10-09  
**Product location:** Learn → Math → Abacus Lab  
**Primary instrument:** Japanese-style soroban (1 upper bead + 4 lower beads per rod)

## 1. Product intent

Abacus Lab is not a decorative mini-game. It is a real virtual soroban that lets a child learn and practice decimal place-value arithmetic when a physical abacus is unavailable.

The feature must preserve ColorQuest principles:

- no public scores, leaderboards, streak pressure, or timed ranking;
- accuracy and explanation before speed;
- child-specific progress stays on-device;
- free practice never becomes a grade;
- younger children can explore beads without being told they have “mastered” arithmetic;
- older children get age-respectful language and progressively deeper arithmetic.

## 2. Architecture decision

Abacus is **not** a ninth top-level ColorQuest activity.

Math remains the top-level activity. Math now contains two internal paths:

1. **Math Trail / Number Games** — existing adaptive concept lessons and generated questions.
2. **Abacus Lab / Abacus Play** — the soroban curriculum and virtual instrument.

This avoids re-complicating the simplified Home architecture from the 2026 hard check. It also keeps resume routing stable: the existing `math` activity resumes, and Math remembers whether the child last used Math Trail or Abacus Lab.

## 3. Instrument model

### Legal-state soroban

Each rod is stored as one decimal digit 0–9, not as arbitrary bead coordinates.

A digit maps to:

- upper bead inactive/active = 0 or 5;
- 0–4 lower beads active = 0–4.

That means the UI can never create an impossible soroban state.

### Lower-bead grouping

Lower beads behave as a group like a physical soroban:

- tapping an inactive lower bead moves it and the beads above it toward the beam;
- tapping an active lower bead moves it and the beads below it away;
- swipe toward/away from the beam maps to the same grouped state changes.

### Input

V1 supports:

- touch/tap;
- vertical swipe toward/away from the beam;
- mouse;
- keyboard activation and arrow controls.

Beads snap to legal positions rather than floating freely.

### Place value

The rightmost rod is ones. Moving left gives tens, hundreds, thousands, etc.

Place-value labels can remain visible while learning and can be hidden in Free Abacus as the child gains fluency.

## 4. V1 modes

### Learn

Short stage explanation + guided challenge + visible strategy.

No speed target.

Three successful builds mark a stage **explored**. This is deliberately not called mastery.

### Practice

Fresh deterministic problems at the selected stage.

A wrong check:

- does not lock the activity;
- gives a directional clue;
- reveals a stage-appropriate hint;
- lets the child keep manipulating the same abacus.

### Free Abacus

A child can use the screen like a physical soroban without a prompt.

V1 rod choices are age-aware:

- ages 1–3: 3 rods;
- ages 4–6: 3 or 5 rods;
- ages 7–9: 3, 5, 7, or 9 rods;
- ages 10–12: 3, 5, 7, 9, or 13 rods.

Free use is not scored.

## 5. Curriculum progression

| Stage | Minimum age | Goal |
| --- | ---: | --- |
| Bead Play | 1 | Move beads, notice the beam, count active beads; exploration only |
| Meet the Soroban | 4 | Build digits 0–9; upper bead = 5, lower bead = 1 |
| Build Numbers | 5 | Ones/tens/hundreds/thousands; read and create multi-digit values |
| Direct Addition | 5 | Add without an exchange |
| Direct Subtraction | 5 | Subtract without an exchange |
| Friends of 5 | 6 | Complement-to-5 strategy |
| Friends of 10 | 6 | Carry/borrow through complement-to-10 |
| Multi-digit Arithmetic | 7 | Mixed larger addition/subtraction |
| Multiply & Divide | 8 | Basic arithmetic result practice on the soroban |
| Advanced Mixed | 10 | Larger mixed calculations and intermediate values |

All age-appropriate stages remain selectable. The app recommends the first stage not yet explored but does not hard-lock later material.

## 6. Important V1 boundary

The V1 Multiply & Divide stage uses the soroban as a place-value workspace and verifies the final result.

It does **not** claim to teach the complete traditional multi-rod soroban multiplication/division layout algorithm yet.

That deeper method is a roadmap item and must be reviewed by a qualified soroban instructor before being labeled as traditional technique.

## 7. Progress model

Abacus progress is separate from adaptive Math progress because a child may be advanced in conventional arithmetic and brand-new to soroban.

Stored per child:

- whether Abacus Lab has been visited;
- attempts;
- correct checks;
- successful builds per stage;
- explored stages;
- recent results;
- last mode;
- last stage;
- last value.

The main family profile storage remains local-only.

## 8. Age behavior

### Ages 1–3

- Abacus Play language.
- Bead Play only.
- No formal mastery claims.
- Focus on movement, matching a small target, and counting.
- Grown-up participation is encouraged.

### Ages 4–6

- Formal digit/place-value introduction begins.
- Large rods and visible labels.
- Direct addition/subtraction and complement stages appear by developmental age.

### Ages 7–9

- More rods.
- Multi-digit arithmetic.
- Basic multiplication/division practice from age 8.

### Ages 10–12

- 9-rod default Free Abacus; optional 13 rods.
- Advanced mixed arithmetic.
- Mature labels and less visual scaffolding when desired.

## 9. UX principles

- The soroban is the visual hero.
- On phones, horizontal scrolling is preferred over shrinking 13 rods into tiny targets.
- Current numeric value is always visible.
- Undo and Reset are always available.
- Guided mode keeps coaching adjacent to the instrument on large screens and below it on phones.
- No automatic carrying: the child performs the exchange.
- No auto-solving bead animation after a mistake.
- No speed timer in V1.
- No public score.

## 10. Accessibility

- Each bead group is keyboard-focusable.
- Upper/lower bead controls have spoken place-value labels.
- Active state is exposed with `aria-pressed`.
- The overall soroban reports its current value.
- Read-aloud can speak the current value and challenge.
- Place-value labels are textual, not color-only.
- Minimum interaction targets are enlarged beyond the visible bead where the SVG permits.

## 11. V1 QC checklist

Before V1 is marked Done:

- every digit 0–9 round-trips through the legal soroban state model;
- grouped lower-bead movement is regression-tested;
- number ↔ rod-array conversion is tested;
- age-specific rod choices are tested;
- every generated challenge fits its rod count;
- every curriculum stage is unique and age-gated as specified;
- per-child abacus visit/result progress is tested;
- Free Abacus does not increment scored practice;
- Math Trail still works unchanged;
- Abacus Lab appears as a Math sub-path, not a new Home activity;
- Math page navigation and generic next-row controls disappear while Abacus Lab is active;
- Abacus visit makes Math resumable;
- phone/tablet layouts keep the soroban usable;
- full repository tests/build pass;
- Android sync/unit/minified release-bundle engineering check passes;
- exact-main GitHub Pages deployment passes;
- deployed artifact contains Abacus Lab code.

## 12. Roadmap after V1

### P1 — traditional advanced soroban algorithms

Work with a soroban instructor to implement and validate:

- formal multiplication layout;
- formal division layout;
- multi-rod working zones;
- step verification, not only final-answer verification.

### P1 — mental abacus

Only after strong physical/screen soroban fluency:

1. full soroban;
2. reduced labels;
3. ghost/faded soroban;
4. briefly flashed soroban;
5. visualization without visible beads.

No child should be pushed into mental abacus based only on age.

### P1 — richer coaching

- identify the exact complement strategy the child attempted;
- distinguish conceptual error from accidental bead movement;
- offer one scaffold at a time;
- teacher/parent summary of strategies explored.

### P2 — decimals and money

Add decimal markers and carefully reviewed decimal-place-value lessons.

### P2 — optional private fluency mode

Only for experienced older children:

- local/private timing;
- never a leaderboard;
- never used as the primary readiness measure;
- can be disabled in Parent Corner.

## 13. Evidence and claims

ColorQuest should describe Abacus Lab as a visual-spatial arithmetic and place-value practice tool.

Do not market it as generalized “brain training” or claim broad cognitive benefits that the product does not measure.



## 14. Final V1 verification

### Pre-main QC

- Validated feature branch head: `c8bc47e119ecf64c9eed7d66a103ea64e4b246b8`
- GitHub Actions run: `38006665865`
- Automated tests: **120 passed / 120 total** across 15 test files.
- TypeScript + Vite production build: passed.
- Android web sync: passed.
- Android unit tests and minified release-bundle engineering build: passed.
- Privacy/support assets and release metadata checks: passed.
- The Android AAB produced by CI is an engineering artifact only; it is **not** a Google Play release.

### Main / PWA verification

- PR #11 squash merge: `e3c8a3e1ad9ec7f04b7405f53b81f56c4eba9cc3`
- GitHub Pages run: `38006998333`
- Result: **success**.
- Pages artifact digest: `sha256:01edcbb1766434e8ba6f71443f8269a07571fa74233e2b9093bcd89d6fe9712d`.
- The deployed Pages artifact was unpacked and checked directly. Production content includes:
  - **Abacus Lab**
  - **Free Abacus**
  - **Friends of 10**
  - **Math Trail**
  - **Interactive Japanese soroban**
  - **Fresh questions + a real abacus**

### V1 release disposition

Abacus Lab V1 is complete for the web/PWA and is part of the current ColorQuest source baseline. Advanced traditional multiplication/division layouts, Mental Abacus, decimals/money, and optional private fluency work remain roadmap items and must not be described as V1 capabilities.
