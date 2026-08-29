# ColorQuest Kids Data Safety Declaration

Prepared for version 2.8.0 (`com.brecksvillelabs.colorquestkids`). Re-audit this declaration whenever dependencies, permissions, network behavior, accounts, analytics, advertising, or cloud features change.

## Recommended Play Console answers

- Does the app collect or share any required user data types? **No**
- Is all user data encrypted in transit? **Not applicable: the app does not send user data to Brecksville Labs**
- Can users request deletion? **Not applicable to developer-held data; Parent Corner lets parents delete local profiles and artwork, and clearing app storage removes all local app data**
- Does the app follow the Families Policy? **Yes, based on the audited v2.8.0 behavior and declarations below**

## Local-only information

The following information is stored only in browser or Android application storage on the family's device and is not collected by Brecksville Labs:

- Child nickname or first name
- Age and avatar choice
- Activity progress and resume position
- Voluntary interest choices
- Read-aloud preferences
- Drawing drafts and saved artwork

## User-directed transfers

A parent may deliberately export artwork through the operating system share sheet. The app writes a temporary private-cache file and the parent selects the destination. Brecksville Labs does not receive the artwork.

The device or browser text-to-speech service may process lesson text according to that platform's settings and privacy practices. ColorQuest does not use the microphone and Brecksville Labs does not receive speech-service data.

## Network and SDK audit

- No advertising SDK
- No analytics SDK
- No crash-reporting SDK
- No account or authentication SDK
- No Firebase or Google Services plugin
- No location, camera, microphone, contacts, advertising-ID, or broad storage permission
- Core Android content is bundled locally
- Same-origin GitHub Pages requests are limited to application files and offline caching
- Grown-up-gated links may open NASA, NOAA, or PhET in the browser

## Recheck before every release

1. Inspect `package.json`, `package-lock.json`, Gradle dependencies, and the merged Android manifest.
2. Search production source for analytics, advertising, remote logging, API clients, and new external URLs.
3. Inspect the signed App Bundle in Play Console's App Bundle Explorer.
4. Reconcile this document, the public privacy policy, and every Data safety answer.
