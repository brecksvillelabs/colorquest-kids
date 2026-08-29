# ColorQuest Kids 2.8.0 Test Report

Build target: Android **2.8.0** (`versionCode` **16**)

Application ID: `com.brecksvillelabs.colorquestkids`

Test date: August 29, 2026

## Local results

- Vitest: **90/90 tests passed** across 10 test files
- TypeScript production compilation: passed
- GitHub Pages production build: passed
- Android-targeted production build: passed
- Capacitor Android synchronization: passed
- Capacitor Doctor: Android configuration healthy
- Production dependency audit: **0 vulnerabilities**
- Production bundle source maps: none
- Privacy and support pages: present in both `dist` and Android packaged assets
- Declared Android permissions: Internet only
- Advertising, analytics, Firebase, and Google Services build hooks: absent
- Production dependency tree: React and the Capacitor Android, Filesystem, and Share packages only

## New regression coverage

The app test suite now confirms that:

- Privacy policy and parent-support links are reachable before Parent Corner unlock
- The private Brecksville Labs email link is available after the grown-up check
- Existing v2.7.1 drawing-coordinate, autosave, gallery, profile, learning, puzzle, story, and age-routing coverage remains green

## Android Gradle gate

The local Gradle wrapper could not download Gradle 8.14.3 because this execution environment blocks `services.gradle.org`. No Gradle compilation failure occurred; the wrapper stopped before configuration.

The pull-request workflow runs `testDebugUnitTest` and `bundleRelease` on GitHub's runner, verifies the package/version/privacy assets, confirms no source maps, and uploads a short-lived unsigned AAB plus R8 mapping file for engineering inspection. A signed App Bundle remains a separate private-key step.
