# ColorQuest Kids — UX + Teacher Hard Check

**Review date:** 2026-10-09  
**Baseline:** `main` at `9e820f2080239db28ca75a016040ce0faf26bad5`  
**Review branch:** `audit/ux-teacher-hard-check-20261009`  
**Scope:** child home, profiles, Creative Studio, custom coloring, puzzles, storybooks, Math, Science, Science Lab, Discovery Lab, read-aloud, Fifi coaching, Parent Corner, local privacy/safety boundaries, mobile/tablet behavior, PWA/Android release paths.

> **Method disclosure:** This is a structured role-based product review carried out against the source, tests, interaction architecture, responsive CSS, content catalogs, and release workflow. The five-day “kid control group” below is a **synthetic usability simulation using representative personas and scripted tasks**. It is not a claim that real children participated. A separate real-world field-test protocol is included at the end.

---

## 1. Review team lenses

### UX lead — child-product specialist

Primary questions:

- Can a child understand the next action without reading a paragraph?
- Does the most important object become the visual hero?
- Are targets forgiving enough for developing motor control?
- Does language mature with the child instead of feeling babyish at ages 8–12?
- Are interruptions rare, useful, and dismissible?
- Can a child recover from mistakes without fear of losing work?
- Are adult-only controls truly separate from child flows?
- Does phone layout preserve the activity rather than the chrome?

### Teacher / learning-design reviewer

Primary questions:

- Does the app invite thinking rather than reward tapping?
- Is challenge appropriate to the age world?
- Are predictions treated as ideas rather than grades?
- Does Math support representation and explanation?
- Does Science separate observation from explanation?
- Are hands-on procedures appropriately supervised?
- Is read-aloud available without removing older children’s autonomy?
- Does the app avoid streak pressure and false “mastery” signals?
- Is the literacy/story offering adequate across the advertised 1–12 range?

### Software / release reviewer

Primary questions:

- Are privacy/safety boundaries enforceable in code?
- Does local state remain scoped by profile?
- Can updates safely reach the PWA instead of being trapped by cache?
- Do fixes preserve Android/Capacitor builds?
- Are high-risk behaviors covered by regression tests?
- Is the living SOP/roadmap updated with decisions and residual work?

---

## 2. Findings and dispositions

| Severity | Finding | Review verdict | Disposition |
| --- | --- | --- | --- |
| P0 | The old multiplication “grown-up check” can be solved by many 10–12-year-olds. | Not a meaningful adult boundary for the full advertised age range. | **Fixed:** reusable local 4–6 digit Parent PIN. New installs set it during first profile setup; legacy installs bootstrap once, then create a PIN. |
| P0 | A saved Parent PIN originally had an arithmetic “forgot PIN” reset path. | That would recreate the same older-child bypass. | **Fixed before release:** no arithmetic bypass once a PIN exists. |
| P0 | “Grown-up nearby/required” Science Labs were labels only; materials and procedures were still exposed immediately. | Safety copy without behavior is insufficient. | **Fixed:** prediction remains child-facing, but supervised materials/procedure are hidden until the Parent PIN is entered. |
| P0 | Ages 1–3 had some labs marked “Child can try.” | A toddler should not interpret a hands-on lab as independent work. | **Fixed:** every age-world-0 lab is treated as at least **Grown-up nearby** in UI, narration, and gating. |
| P1 | “Add a child” was reachable directly from the child profile switcher. | A child could make a different-age profile and move into another content world. | **Fixed:** adding a child now requires Parent PIN. Existing household profiles remain easy to switch. |
| P1 | Desktop header duplicated Grown-ups / Parent Corner. Mobile then hid both. | Duplicate desktop affordance, weak mobile discoverability. | **Fixed:** one Parent Corner action; compact protected entry remains available on mobile. |
| P1 | Home hero had Start, Continue, and Choose competing at once. | Three primary-ish choices create unnecessary decision load. | **Fixed:** one primary action plus one alternate path. Continue leads when resume data exists. |
| P1 | Child home included product/marketing statistics and explanatory cards below the activity launcher. | Useful for adults, but noise in the child’s task environment. | **Fixed:** removed the marketing/stat strip and “why” section from child home. Parent-oriented detail remains in Parent Corner. |
| P1 | Young children were shown two learning recommendations at once. | Too many “next steps” for a preschool/early-reader home. | **Fixed:** younger worlds get one small recommendation; older worlds retain broader choice. |
| P1 | Older children saw “Number Games” and “Puzzles and stories” even when stories are unavailable in their age world. | Babyish/inaccurate labeling damages trust. | **Fixed:** older worlds use **Math**, **Science Lab**, **Discovery**, and **Puzzles and challenges**. |
| P1 | Every non-story workspace ended with an art-specific “There is no wrong way to make art” reminder. | Context error under Math, Science, Lab, Discovery, and Puzzles. | **Fixed:** reminders are activity-specific. |
| P1 | Fifi’s home greeting returned every browser/app session. | Friendly once; repetitive interruption over time. | **Fixed:** greeting state now persists locally per profile/version rather than only per session. |
| P1 | Story shelf becomes a long vertical list on phones as daily stories accumulate. | The reader gets pushed too far below the catalog. | **Fixed:** mobile/tablet story shelf becomes a horizontal scroll rail; page targets increased to 44 px. |
| P1 | Puzzle selection states were mainly visual. | Keyboard/screen-reader state was less explicit than it should be. | **Fixed:** selection controls now expose pressed/target state. |
| P1 | Custom coloring import and selected-page hierarchy were weak in the phone build. | File/PDF access and canvas focus were not good enough. | **Already fixed in V1.1:** explicit Photos vs Files/PDF, local PDF page chooser, selected-page hero workbench. |
| P2 | Ages 7–12 do not currently receive a purpose-built story library. | Real content gap against an ages 1–12 promise. | **Roadmap:** write/illustrate age-appropriate middle-grade stories rather than showing younger books to older children. |
| P2 | Parent progress is numerically useful but not yet a teacher-style narrative summary. | Parents would benefit from “what they tried / what to ask next,” not just counts. | **Roadmap:** profile-level learning summary based on actual logged evidence, never inferred mastery. |
| P2 | No real child longitudinal usability data exists yet. | Synthetic analysis cannot replace observation. | **Roadmap:** run the field protocol in §7 before a broad store launch. |

---

## 3. UX lead review

### Home and navigation

The three-door **Create / Play / Learn** architecture is strong because it reduces eight activities into three recognizable intentions. The main failure was hierarchy around it: the hero originally competed with itself, then child-facing marketing/stat content continued below the launcher. The revised hierarchy makes the next action obvious while leaving exploration available.

Age language now needs to mature in parallel with capability. A 10-year-old can reject an otherwise capable product if it calls Math “Number Games.” That is a tone failure rather than a curriculum failure, and it has been corrected.

The profile pill is useful because a shared family device needs an obvious identity cue. Switching profiles is intentionally simple; **creating or changing** household structure is now adult-controlled.

### Creative Studio

Drawing is one of the strongest interaction models in the app. On mobile the canvas already moves ahead of tool panels, and autosave removes fear of navigation. The custom-coloring V1.1 change follows the same rule: once a page is chosen, **the page is the product** and the library gets out of the way.

Remaining import enhancements—crop/rotate, line threshold, better gap closing—belong in the coloring roadmap rather than this global hard check.

### Puzzles

The varied mechanics are preferable to hundreds of cosmetically different multiple-choice cards. Match/sort/sequence/choice modes create different forms of reasoning. The main hard-check change is to expose selection state semantically so the visual highlight is not the only cue.

### Storybooks

The illustrated reader is strong: large artwork, read-aloud, page progression, vocabulary/conversation layer, no timers. On smaller screens, the growing daily shelf was becoming the dominant element. Horizontal browsing keeps the selected book close.

The unresolved problem is editorial rather than CSS: older worlds need stories written for them.

### Learning boards

Math and Science do a good job of explaining first and checking second. Off-screen practice is especially valuable because it keeps the app from pretending learning must happen on the device.

The revised workspace reminder now reinforces the actual discipline: explain a Math strategy, cite Science evidence, name a puzzle rule, or notice a Discovery detail.

### Fifi

Fifi works best as a coach, not as a recurring obstacle. Tip mode is non-blocking, which is correct. Persisting the home greeting across sessions reduces repeated novelty popups while still allowing material future Fifi versions to greet once.

---

## 4. Teacher review

### What should stay

- **No streaks and no locked lesson paths.**
- Young Math is playful and not treated as mastery scoring.
- Older Math can use adaptive question history without turning a wrong answer into punishment.
- Science uses question → idea/prediction → evidence → explanation.
- Lab predictions explicitly say they are not grades.
- Read-aloud is available for pre-readers and can remain optional for older students.
- Drawing/coloring remains open-ended; completion does not demand artistic conformity.
- Discovery connects a real observation to a question instead of presenting trivia alone.

### Changes the teacher required

1. **Adult supervision must be behavioral, not decorative.**  
   A red/yellow safety badge is not enough if a child can immediately read and execute the procedure. Supervised procedures are now behind Parent PIN.

2. **Toddlers must never see “Child can try” as an independence signal.**  
   Every ages 1–3 lab is presented as at least Grown-up nearby.

3. **Prediction before procedure is retained.**  
   The child can still think first. The gate is placed before materials/procedure, not before the scientific question.

4. **Home should offer a small next step, not a dashboard.**  
   Younger children now get one recommendation rather than two competing academic paths.

5. **Older-child language must respect older children.**  
   “Math,” “Science Lab,” and “Discovery” replace younger labels where appropriate.

6. **Do not force one-hour sessions on toddlers in a real usability study.**  
   A 60-minute requirement can turn a product test into endurance testing. See the age-capped field protocol below.

### Teacher-identified content debt

The story experience is pedagogically good, but the library is not yet age-complete. Ages 7–12 should eventually receive:
- longer page text and richer vocabulary;
- conflicts that fit school/friendship/community/science/design interests;
- inference and perspective-taking questions;
- no babyish narration or visual treatment;
- the same inclusion/equity principles without turning the story into a lesson lecture.

That requires authored content and illustration, not a software switch.

---

## 5. Software/release review

### Privacy and local storage

ColorQuest remains local-first:
- child profiles/progress: local storage;
- creative drafts/artwork/custom pages: IndexedDB/local storage architecture;
- no child account or social profile;
- imported family coloring pages stay local unless an adult deliberately exports artwork.

### Parent PIN

The Parent PIN is a **household-device boundary**, not an online identity system. The verifier is salted and the plaintext PIN is not stored. A determined user with developer/device-storage access is outside the threat model; this is still materially stronger than a math question that a 12-year-old can answer.

Protected surfaces now include:
- Parent Corner;
- family file/PDF import;
- approved outside links where the existing gate is used;
- supervised Science Lab procedure;
- adding another child profile.

### Regression strategy

High-risk changes must remain covered by:
- Parent PIN validation/storage/verification tests;
- protected Parent Corner test;
- supervised-lab hidden-procedure test;
- ages 1–3 effective lab-safety test;
- older-world navigation wording test;
- context-correct workspace reminder test;
- existing full app journey suite;
- web build + Android sync/unit/release bundle CI before main.

---

## 6. Synthetic five-day usability study

**Important:** The following is a design simulation, not human-subject research. It uses the app’s actual interaction model and representative capability constraints to predict friction and drive regression checks.

### Synthetic control group

| Persona | Age | Interaction profile |
| --- | ---: | --- |
| A | 2 | Pre-reader; large-target tapping; adult nearby; relies on icons/read-aloud |
| B | 5 | Emerging reader; basic counting; exploratory; can follow 1–2 step instructions |
| C | 8 | Independent reader; comfortable with menus; wants faster task entry |
| D | 11 | Advanced/independent; notices childish wording quickly; can reason around weak gates |
| E | 9 | Prefers read-aloud and larger targets; lower confidence with dense screens; capable reasoning |

### Day 1 — orientation and finding something to do

Tasks:
- recognize active profile;
- understand the three Home doors;
- enter one activity;
- return Home;
- resume.

Predicted friction before fixes:
- B/A face too many hero choices;
- D sees age-inappropriate “Number Games”;
- C/D see “Puzzles and stories” although stories are unavailable;
- repeated Fifi greeting becomes noticeable on relaunch.

After fixes:
- one primary Home action;
- age-aware labels;
- accurate Play copy;
- Fifi greeting persists once per version/profile.

### Day 2 — create, color, recover

Tasks:
- draw with one brush;
- switch tool;
- leave and return;
- open custom coloring;
- choose Photos or Files/PDF;
- color and save.

Predicted friction:
- V1 custom coloring shelf competes with canvas; fixed in V1.1.
- Android image-only picker sends parent toward Photos; fixed with separate Files/PDF.
- Numeric filenames look meaningless; fixed to a friendly title.
- A/B need forgiving targets and no “save before leaving” anxiety; autosave handles this.

Residual:
- imperfect scanned line art may still need crop/rotate/threshold controls.

### Day 3 — puzzles and Math

Tasks:
- complete match, sort, sequence;
- open Math;
- answer incorrectly once;
- recover;
- explain a strategy.

Predicted friction:
- visual-only selection state is weaker for E; ARIA state now explicit.
- generic art reminder under Math undermines teacher framing; replaced with a Math reminder.
- D wants “Math,” not “Number Games”; age-aware label fixed.

### Day 4 — Science, Lab, Discovery, Story where age-appropriate

Tasks:
- answer a Science concept;
- make a Lab prediction;
- attempt to begin a supervised Lab without adult;
- complete a safe/adult-approved lab;
- use Discovery;
- younger personas read a story.

Critical synthetic finding:
- D can solve the old multiplication gate and enter adult-only actions. **P0.**
- A could previously see “Child can try” on a hands-on lab. **P0.**
- supervised lab material/procedure was visible without adult confirmation. **P0.**

All three were addressed through Parent PIN + effective safety rules + hidden supervised procedure.

### Day 5 — free choice, repetition, edge recovery

Tasks:
- pick any favorite activity;
- switch profile;
- try to add a child;
- attempt Parent Corner;
- repeat a completed activity;
- start over / undo / go Home;
- revisit story shelf or custom coloring library.

Predicted friction:
- a child could add a different-age profile; fixed with Parent PIN.
- mobile story shelf becomes long as daily stories accumulate; fixed to horizontal rail.
- repeated activities remain available; no lock/streak regression.
- destructive drawing reset remains an explicit safe-choice dialog.

### Synthetic study conclusion

After the hard-check fixes, the primary remaining problems are **content depth and real-world validation**, not a known P0 navigation/safety defect:
- older story content is still missing;
- custom line-art preprocessing can improve;
- parent learning summaries can become more teacher-like;
- actual children still need to be observed before broad release.

---

## 7. Real five-day child usability protocol

This is the protocol to use when real participants are available. Do **not** report the synthetic study above as real child testing.

### Participants

Aim for at least 6–8 children across:
- ages 2–3;
- ages 4–6;
- ages 7–9;
- ages 10–12;
- a mix of reading confidence, app familiarity, and fine-motor comfort.

Use adult consent. Record age band rather than full birth date. Do not put children’s names, photos, voice recordings, or personal identifiers in the product-research notes unless a separate consent process explicitly requires them.

### Session length

Do **not** force one hour for every age.

- Ages 2–3: 10–15 minutes, optional second short session.
- Ages 4–6: 20–30 minutes.
- Ages 7–9: 30–45 minutes.
- Ages 10–12: up to 45–60 minutes with a break.
- Any child can stop earlier.

The goal is usability, not endurance.

### Day plan

**Day 1 — discovery:** “Show me what you think this app lets you do.” Observe without teaching unless safety requires it.  
**Day 2 — creativity:** drawing, built-in coloring, family/custom coloring if parent participates.  
**Day 3 — thinking:** puzzle + Math; note recovery after a wrong answer.  
**Day 4 — learning:** Science / Lab / Discovery; supervise all physical tasks according to the app.  
**Day 5 — free play:** child chooses; observe whether they remember navigation and whether repeat use feels easier.

### Observer sheet

For each task record:
- first thing the child tapped;
- whether adult help was requested;
- whether the child read, inferred from icon, or used read-aloud;
- wrong turns;
- hesitation longer than ~5 seconds;
- accidental taps;
- words the child did not understand;
- whether they could recover without being told what to do;
- visible delight/frustration only as an observation, not a diagnosis;
- direct child quote if useful and consented;
- issue severity: blocker / repeated friction / minor / preference.

### Exit questions

Use simple, non-leading prompts:
- “What was easiest?”
- “What was hard to find?”
- “Was anything annoying?”
- “What would you do first next time?”
- “If you could change one thing, what would it be?”

For pre-readers, use choice cards or demonstration instead of requiring verbal explanations.

### Success thresholds before broad store launch

- No child-safety or privacy bypass discovered.
- ≥90% of core tasks completed without adult navigation coaching for ages 7–12.
- Younger children can reach a chosen activity with icon/read-aloud support.
- No repeated accidental destructive action.
- No recurring target-size complaint across multiple children.
- Parent gate consistently blocks child-only access in observed use.
- No P0/P1 issue remains untriaged after Day 5.

---

## 8. Residual roadmap from the hard check

1. **Older story library (P1 content):** purpose-built ages 7–9 and 10–12 stories with original art.
2. **Story catalog scaling (P1):** age filters/search/recent additions once library volume warrants it.
3. **Teacher-style parent summary (P1):** factual “explored / practiced / next conversation prompt” without claiming mastery.
4. **Custom coloring preprocessing (P1):** crop, rotate, adjustable threshold, stronger gap closing.
5. **Real five-day child field study (P0 before broad launch):** execute §7 and log findings.
6. **Native device-auth option (P2 investigation):** consider platform biometric/device credential as an optional future parent boundary; do not make it a requirement for the web/PWA.

---

## 9. Release rule for this hard check

The review is not “complete” until:
1. full web tests pass;
2. TypeScript/Vite build passes;
3. Android sync + unit/release bundle check passes;
4. changes merge to `main`;
5. GitHub Pages succeeds for the exact final main commit;
6. deployed artifact contains the hard-check changes;
7. `COLORQUEST_SOP_ROADMAP.md` reflects the final disposition.

