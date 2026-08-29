# ColorQuest Kids 2.8.0 — Brecksville Labs Play Readiness

Web version: **2.8.0**

Android version: **2.8.0** (`versionCode` **16**)

Android package: **com.brecksvillelabs.colorquestkids**

## Release purpose

This release establishes the permanent Brecksville Labs identity and the privacy, support, signing, documentation, and automated release checks needed before the first Google Play upload. It preserves the v2.7.1 canvas-alignment fix and all existing child profiles, creative tools, learning content, and local-data behavior.

## Included

- Permanent Brecksville Labs Android application ID
- Public privacy policy at `/colorquest-kids/privacy.html`
- Public parent-support page at `/colorquest-kids/support.html`
- Privacy and support links inside Parent Corner and on the grown-up gate screen
- Private support contact: `brecksvillelabs@gmail.com`
- Removed unused Google Services build hook
- Ignored local release-signing configuration with a safe example file
- Data Safety audit sheet
- Play Console submission answers, store copy, asset plan, and testing checklist
- Pull-request Android workflow that builds the minified release bundle without publishing or exposing signing secrets
- Offline cache advanced to v2.8.0

## Important release boundary

The GitHub Actions artifact is an unsigned engineering check and must not be uploaded to Play. The production App Bundle must be signed with the private ColorQuest upload key, then inspected in Play Console before closed testing.
