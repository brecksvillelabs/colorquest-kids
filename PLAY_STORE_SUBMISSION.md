# ColorQuest Kids Google Play Submission

Release candidate: **2.8.0**  
Version code: **16**  
Package: **com.brecksvillelabs.colorquestkids**  
Publisher: **Brecksville Labs**  
Support email: **brecksvillelabs@gmail.com**

## Play Console app record

- App name: **ColorQuest Kids**
- Default language: **English (United States)**
- App or game: **App**
- Free or paid: **Free**
- Category: **Education**
- Ads: **No, this app does not contain ads**
- Privacy policy: **https://brecksvillelabs.github.io/colorquest-kids/privacy.html**
- Support website: **https://brecksvillelabs.github.io/colorquest-kids/support.html**
- Support email: **brecksvillelabs@gmail.com**

Do not create the Play Console app record with the old `com.harinath.colorquestkids` bundle. Package names are permanent after registration.

## Target audience and Families

Select only the age groups the current experience is intentionally designed for:

- Ages 5 and under
- Ages 6–8
- Ages 9–12

Declare that the app appeals to children and complete the Families requirements. The v2.8.0 build has no advertising, analytics, chat, accounts, location, camera, microphone, contacts, or advertising-ID access. Curated external learning resources and artwork export are protected by a grown-up check.

## App access and content rating

- Restricted access: **No account or sign-in is required**
- Reviewer note: **Parent Corner and external resources use a randomized multiplication grown-up check. Reviewers may solve the displayed question; no fixed password is required.**
- Complete the IARC questionnaire truthfully as an educational/creative app with no violence, sexual content, gambling, chat, or user-generated public sharing.

## Data safety

Use `DATA_SAFETY.md` as the audited answer sheet. For v2.8.0, the recommended declaration is that Brecksville Labs does not collect or share user data. Profiles, progress, preferences, drafts, and artwork remain locally on the device. Reconfirm this after Play Console analyzes the uploaded bundle.

## Store listing copy

### Short description

Draw, color, read, solve puzzles, and explore Math and Science—ad-free.

### Full description

ColorQuest Kids is a private, ad-free creative learning playground for children ages 1–12.

Children can draw freely, build with shapes, color detailed scenes, read funny picture stories, solve varied puzzles, explore adaptive Math and Science, try hands-on Science Labs, and discover hundreds of age-appropriate ideas about nature, geography, space, and more.

CREATIVE STUDIO
• Draw and color in one focused workspace
• Ten expressive brushes, rich colors, gradients, base paints, and editable shapes
• Recognizable animals, gardens, vehicles, landscapes, fantasy, and space scenes
• Four recent works save quietly so children can leave without disruptive popups
• A private gallery with parent-controlled export

LEARNING THAT GROWS WITH THE CHILD
• Separate experiences for ages 1–3, 4–6, 7–9, and 10–12
• Fresh adaptive Math questions that reduce repetition
• Gentle hints and challenge changes without grades, streaks, or pressure
• Guided Science concepts and hands-on investigations with clear safety labels
• Reasoning puzzles, illustrated stories, and 400 Discovery Lab missions

BUILT FOR FAMILIES
• No advertising or behavioral tracking
• No child account, chat, or social profile
• Nicknames, progress, drafts, and artwork stay on the device
• Parent Corner manages profiles, artwork, read-aloud settings, and support
• Core Android activities work offline

Fifi, the friendly Color Spark, offers optional encouragement without judging a child's artwork or interrupting creative play.

ColorQuest Kids is free from Brecksville Labs.

## Required graphics

- App icon: 512 × 512 PNG, no transparency
- Feature graphic: 1024 × 500 PNG or JPEG
- Phone screenshots: at least four recommended
- 7-inch tablet screenshots: at least four recommended
- 10-inch tablet screenshots: at least four recommended

Capture both portrait and landscape where the experience benefits. Recommended screens: Home doors, canvas-first drawing, picture-first coloring, Storybooks, adaptive Math, Science Lab, Discovery Lab, and Parent Corner privacy controls. Do not show a child's real name or artwork without explicit parental permission.

## Release engineering

1. Run `npm ci`.
2. Run `npm run check`.
3. Run `npm run android:sync`.
4. Run Android unit tests and `bundleRelease`.
5. Create a private upload key and `android/keystore.properties` from the included example.
6. Build the signed `.aab` and archive it with `mapping.txt`.
7. Upload to Internal testing first and inspect App Bundle Explorer and the Pre-launch report.
8. Fix all crashes, policy warnings, layout failures, and accessibility blockers before Closed testing.

Never commit the upload key, passwords, `keystore.properties`, signed bundle, or private tester email list.

## Testing and launch

If Play Console requires the new-personal-account gate, keep at least 12 testers opted into the closed test continuously for 14 days before requesting production access. Save tester feedback and the changes made from it because the production-access form asks about both.

Keep Managed publishing enabled so approval does not automatically make the app public. Begin with a controlled production launch after the store listing, policy declarations, and device reports are complete.
