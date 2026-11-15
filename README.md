## Production source and deployment

Current production source belongs to [AlexJang14/altwing-production](https://github.com/AlexJang14/altwing-production). Follow [the production guide](docs/PRODUCTION.md) for automatic GitHub Actions deployment, Cloudflare DNS, backend configuration, progress preservation and rollback. The intended canonical address is https://altwing.org/; the independent GitHub address is https://alexjang14.github.io/altwing-production/. The old junjang06 deployment remains separate.

Push updates to `main` to run tests and deploy the frontend. `npm run build:pages` creates `pages-dist/` for the custom-domain root; `npm run build:pages:preview` creates `pages-preview/` for the new owner's GitHub path. Actions chooses the configured Pages base automatically. The Worker build from `npm run build` serves the existing authenticated backend and is not the Pages frontend artifact.

Student progress is browser-local and needs export/import between origins. Owner analytics sign-in stays on the existing backend and database; backend source is included, but its deployment remains a separate Sites operation. The new repository and DNS setup do not redirect or disable the old owner's Pages project.

The older release notes below describe historical releases. Use [the production guide](docs/PRODUCTION.md) for current deployment commands and analytics configuration. The two reviewed pre-existing content/audit warnings remain visible; new failures block release.

## October 25 UX redesign

Public website: https://altwing-engineering-pathways.theanna.chatgpt.site

The shared shell keeps the same penguin home logo and fixed navigation on every app route, including project workspaces, labs, the loading fallback, and privacy. The recommended journey is Find My Wing → Explore Engineering → Try Projects → Colleges & Programs. My Universe and Site Map remain directly accessible.

Canonical routes: `#/match`, `#/explore`, `#/major?major=civil`, `#/projects?project=solar`, `#/colleges`, `#/programs`, `#/universe`, `#/sitemap`, `#/privacy`, `#/aerospace`, and `#/aerospace-build?wing=propulsion`. Legacy counselor links resolve to the appropriate guide or directory.

WingMatch opens a four-step tutorial immediately after completion; it can be skipped and replayed. Three distinct project workspaces support previewing any stage while preserving the evidence requirements for completion. A saved completed project awards one pack, with duplicate saves deduplicated by source ID. Pack reveals use a body-level dialog and self-contained SVG illustrations; collected worlds persist in browser storage and display before undiscovered objects.

UI research and rationale: `docs/UX-RESEARCH.md`. Existing student data keys are retained.

# AltWing — submission release

**Not everyone flies the same way. Your path. Your pace.**

AltWing helps students explore engineering and take a practical next step with adjustable support. This release preserves the engineering guidance and aerospace lab experiences and adds three complete browser-based starter projects.

## Run locally

Use Node 22.12+ or 24 (Node 20.19+ is also supported by the build tool).

```sh
npm ci
npm run dev
```

## Verify and build

```sh
npm run test:submission
npm run lint
npm run build
npm run guidance:balance
npm run guidance:freshness
```

The submission test covers opportunity grade, budget and location exclusions, duplicate records, validated routes and saved profile shapes, project models and completion gates, draft round-trips, export contents, and blocked-storage recovery. The balance script checks structural ranking distribution across all 65,536 response patterns; it does not validate aptitude prediction. The freshness script checks date age, not the accuracy of current program facts.

## Deploy

Publish the **contents of dist/** at the root of a static HTTPS website. No backend is required. Routes use the URL hash, so direct links and refresh do not require a server rewrite rule. The deploy archive contains the static files ready to publish; the source archive is for development. Do not submit a localhost or file:// URL.

For a local production preview:

```sh
npm run preview -- --host 127.0.0.1
```

Analytics is optional. Without configuration, the site works and the analytics SDK is not loaded. To configure a separate source build, use the variable names in .env.example and rebuild. Never put secret server keys in VITE variables. The supplied static build has no analytics configuration.

## Implemented in this release

- Prominent WingMatch entry on the homepage and project recommendations linked from its results.
- 663 university records: 37 curated major links plus 626 College Scorecard engineering-directory leads. Directory leads are a dated May 2025 snapshot, not confirmation of exact-major availability today.
- 42 source-linked STEM programs, with grade-unknown records excluded when a grade is selected.
- Searchable, paginated university results and searchable program listings.
- Three browser-only projects: solar panel orientation, simplified cooling, and relative beam deflection/material tradeoffs.
- Guided, hints, and independent support modes; examples, glossary, explicit assumptions, no timer, pause/resume.
- Prediction → test → compare → revised test → reflection, with actual simulated test history.
- Student-authored exploration records, text export and JSON data copies. Support is not an ability rating.
- Resumable WingMatch decisions; saved written notes and submitted evidence in the existing aerospace labs.
- Shareable hash routes, working browser history and direct counselor-tab links.
- Grade exclusions, explicit structured program-fee bands, conservative near-home matching, duplicate removal and review-needed labels.
- Explicit optional grade/state setup, optional bounded score inputs, removed confidence-like match percentages in the current results.
- Reopenable saved guidance and project records in My Universe, with projects shown before collections.
- Improved headline spacing, body readability, focus visibility, phone layouts and reduced-motion behavior.
- Optional analytics loaded separately; automatic interaction capture and session recording disabled.
- Compatible dependency security updates and route-level loading.

## Product boundaries

The primary WingMatch is the eight-incident engineering storm-response experience across 14 engineering directions. It is not the earlier Mars-only assessment. The six aerospace labs remain a separate deeper exploration route.

Opportunity Match is a rule-based beta over 42 source-linked catalog records, not an autonomous AI search service or confirmation of eligibility. Program dates and requirements must be checked at their official sources. Source-check dates are inherited catalog metadata; this release did not independently reverify every listing.

The three starter projects are simplified models with explicit assumptions, not validated physical designs. New project records require a prediction, two distinct tested inputs, comparison, revision reasoning, and reflection; they are not an independently assessed credential. No educator pilot or learning-impact study has been performed for these additions.

Progress is browser-local. The new project workspace restores inputs, test history, notes, step and support level. Aerospace labs restore written notes and submitted evidence; their individual simulation controls reset after leaving. Exports are student-selected downloads. Cloud accounts, cross-device sync, audio/image evidence, full bilingual UI, live human mentoring and a trained AI tutor remain future work.

## Suggested short demonstration

1. Homepage: explain “Your path. Your pace.” and optional WingMatch.
2. Projects → Follow the sunlight. Choose a support mode.
3. Predict that facing the light directly increases power.
4. Test the initial 30° angle; the ideal model gives 207.85 W.
5. Refresh to show the test and support choice were retained.
6. Compare with the prediction, revise to 0°, and run the model again (240 W).
7. Record why the change helped, name a model limitation, and write a next question.
8. Save and export the exploration record. Open My Progress to resume it.
9. Show a counselor program list, its eligibility caveats and official source, and the alternative project route.
10. If time permits, show the original aerospace labs separately.

Do not describe every part of the longer roadmap as implemented. Update any submission narration that still calls the main WingMatch a Mars-only experience.

## University data refresh options

The browser uses the bundled catalog, so no API credential or live service is needed. See docs/data-sources.md for primary-source evidence and API tradeoffs.

To rebuild directory additions from the official institution ZIP, download the dated file linked at https://catalog.data.gov/dataset/college-scorecard and run:

```sh
python3 scripts/import-scorecard.py /absolute/path/to/Most-Recent-Cohorts-Institution_05192025.zip
```

The importer preserves the 37 curated records using their reviewed UNITID mapping. If you change releases, update the release label after checking the source and fields; never relabel older metrics as current.

```sh
npm run data:scorecard-probe
# Optional: set COLLEGE_SCORECARD_API_KEY in your shell, then:
npm run data:scorecard-api
```

The probe uses one public DEMO_KEY request. A full refresh requires your own key and produces docs/scorecard-api-candidate.json for review; it does not silently replace the published catalog. Never place a private API key in VITE variables or static assets. NASA's general data APIs are not treated as an internship feed. Program additions remain a maintained official-source catalog.
