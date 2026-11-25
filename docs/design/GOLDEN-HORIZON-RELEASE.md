# Golden Horizon — coordinated platform visual release

Prepared November 19, 2026 (America/New_York). **Design direction approved; production deployment is not approved.**

The founder selected Ion Blue `#45D9FF`, with approximately 5% target accent presence, and named the identity **Golden Horizon**. That approval authorizes the complete platform styling implementation and comprehensive preview. It does not approve publishing, migrating a database, changing infrastructure, or clearing unresolved third-party rights.

## Implemented scope

The coordinated implementation covers the homepage and shared navigation/footer; Find My Wing and all eight scenarios; Engineering Explorer and all fourteen field guides; careers, project ideas, colleges and opportunities; three project workspaces and their support/evidence states; the six aerospace wings, full learning journeys and actual laboratory controls; My Universe, collections, Cosmic Packs and reveal dialogs; assessment and Beyond the Flight; private analytics, Impact Stories, versioned research/legacy reports and exports; privacy, methodology, credits, terms and progress transfer; loading, errors and generic access-denied/404 presentation.

58 existing UI stylesheets now consume centralized theme tokens. The shared platform layer supplies typography, spacing, responsive layouts, action styles, dialog hierarchy and reduced-motion behavior. The previously approved homepage layout, imagery and copy remain. A source map documents the stylesheet changes and explicitly protected declarations. No new educational feature, dependency, asset, route, score, reward rule or database migration is introduced.

The system lives in `src/design/golden-horizon/tokens.css` and `platform.css`. Obsidian `#101216` and Graphite `#1B1E24` provide surfaces, Warm Pearl `#F7F2E6` provides text, Signature Gold `#E6BB65` marks achievements/value, and Ion Blue marks curiosity, primary actions, selection and focus. The existing semantic scientific and rarity palettes remain separate. Approximately 5% is a design target, not a measured pixel-coverage statistic.

The selected theme applies to every App route, the standalone private server pages, body-level modal portals and the generated static information pages. Explicit cascade priority protects the theme when lazy-loaded page styles arrive. Printable reports retain their existing ink-friendly print rules. Scientific diagrams, plotted-series colors, rarity distinctions and condition colors are protected separately from UI chrome.

Reduced-motion preferences suppress decorative animations and smooth scrolling. Cosmic Pack cards reveal immediately when reduced motion is requested; the cards, values, inventory and award rules are unchanged. The existing close/focus controls remain. A chart-label React warning was corrected by rendering each SVG title as one string with the same date and count.

## Comprehensive interactive preview

Open **Golden-Horizon-Preview.html** in a browser. It is a single offline file with Desktop (1440) and Mobile (390) controls and **61 scene shortcuts**. The frames retain their actual viewport dimensions while scaling to the review area. Use real navigation, filters, sliders, project support modes and forms inside the frame.

The scene navigator includes every field guide, each of the eight actual mission questions, all six wing journeys, six directly accessible actual laboratory components, all three projects, reward reveal, assessment, full private dashboard, versioned reports/stories/CSV/print, login appearance, generic denial, loading, error and informational states. Scene shortcuts can reset a demonstration state; normal in-app navigation retains the preview's in-memory progress.

**Application.html** opens the actual application without the outer review frame, useful for native browser widths/zoom and public-route testing. **Acceptance-Guide.html** retains the existing guided 38-case acceptance tool, exact steps/expectations, PASS/FAIL/UNVERIFIED controls, progress tracking and export. Its initial results remain UNVERIFIED. The added visual checklist below covers the changed platform styling without repeating unchanged copyright research.

The preview uses in-memory browser storage installed before application evaluation. It never reads or modifies real saved browser progress. Fetch and beacon transmission are disabled; private-report API responses are explicit synthetic fixtures reused from the existing assessment preview. Reports, stories and exports retain DEMO labels. The full private dashboard is a demonstration, not a real authentication test. A preview-only adapter supplies synthetic permitted/unpermitted stories to its actual report component; this adapter and its data do not enter production builds.

## Verification

| Check | Status and scope |
| --- | --- |
| Complete existing release suite | **PASS —25/25**, zero active advisory exceptions and zero unexpected failures. Includes server/Pages builds,150 protected-endpoint and56 Worker-boundary cases, missions/progression, legacy/v2/v3 assessment, privacy, assets, notices and progress transfer. Exact run time is in the accompanying QA JSON. |
| Coordinated design checks | **PASS** —57 actual component renders,61 scene shortcuts, all8 mission questions,14 field guides,6 lab controls and journeys; optional-story/quotation behavior; token contrast; theme entry points and offline bundle syntax. |
| Logic and data preservation | **PASS** —145 relevant logic/data/API files byte-identical;14 UI adapters restricted to theme, motion or the same SVG label text. No server authorization/database/model changes. All415 copied Color Lab files remain unchanged in the previous workspace. Earlier homepage and release snapshots are also retained. |
| Scientific/rarity/status/print styling | **PASS within source-check scope** —923 protected rules plus70 explicit semantic-color rules checked against the retained source. Plotted SVG artwork/model source is preserved. Chart bar fills are explicitly visible against the new surfaces. |
| Rights documentation and assets | **PASS for preservation**, not universal clearance. Existing rights/release records, mascot/horizon/font bytes, third-party notices and proprietary license status are retained. No new imagery/font/software license is introduced. |
| Actual browser layout, focus, screen-reader and animations | **UNVERIFIED** —requires real browser/device observation. Rendered markup and computed token contrasts are supporting checks, not a browser accessibility certification. |
| Browser PDF output / visual paper review | **UNVERIFIED** —print source/guards and synthetic exports are checked; actual A4/Letter browser pagination and appearance need manual review. |
| Measured blue pixel coverage | **UNVERIFIED** —approximately5% remains a visual target. |

The [Sites skill](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) states: “If `cua_repl.js` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” That tool is unavailable in this session. No browser screenshots, device passes or PDF visual results are fabricated. The supplied standalone artifacts let the owner perform those observations.

## Release gates and unchanged infrastructure

**HOLD for production.** No commit/push, publication, migration, DNS/proxy/domain change, ownership change, secret reset or purchase has occurred. The isolated branch is `design/golden-horizon`; its push URL is disabled. Production main was fetched and remains at `443f965f2c5f45b2199c24b0b5db800eb5fee60b`.

The genuine remaining pre-release requirements are current manual visual/accessibility/PDF acceptance; the previously recorded reference-image input-rights clarification for the retained mascot; a supported recoverable backend backup and read-only preflight for the already-pending research migration; and explicit final production approval. The dated account-holder mascot grant has already been received within rights held and is **not** requested again. Existing scoped permissions do not clear independently protected third-party inputs.

The design adds no migration. The previously prepared `drizzle/0002_research_assessment.sql` is unchanged, SHA-256 `d32a63b5fbe73e76c7492d66a4380e8feb3c8267c570e1c677bb6ee800afda3d`. Existing historical records, DB binding, both server-only administrator grants, impact-v2/v3 definitions, storage keys, altwing.org, Cloudflare configuration and GitHub Actions workflow are preserved. Original rights/release documents remain historical evidence in their stated scope; the new source manifest records this candidate without rewriting those reviews.

The existing release/rollback runbook remains applicable: after final approval and backup/preflight, publish the reviewed backend if needed and then the GitHub Pages frontend through the existing workflow; verify production; roll back with normal Git revert/Actions and the retained backend version if necessary, preserving the database and current administrator grants. Reverting visual styles does not require deleting records or resetting storage.

Planned private login after the pending release: **https://altwing-engineering-pathways.theanna.chatgpt.site/admin/login**. The new private routes remain undeployed; the current production bookmark is unchanged. Actual independent administrator access, unauthorized denial, genuine feedback storage/retrieval, mission events and Cloudflare Visits are post-deployment checks, not pre-release demo passes.

## Focused visual acceptance workflows

Record observations with browser/version, device, viewport, date and private screenshot references. All rows initially remain **UNVERIFIED**. This is one coordinated review, not separate design-approval requests for each page.

| ID | Efficient steps | Expected result | Status / private evidence |
| --- | --- | --- | --- |
| GH01 | Desktop: inspect homepage, header/footer, Site Map and all informational routes; follow both main CTAs. | Clear purpose, approved imagery/mascot, coherent black/gold/blue roles, working navigation and public login-free access. | UNVERIFIED |
| GH02 | Use all8 mission shortcuts, select/revisit options, then complete a fresh WingMatch through its actual flow. | Readable scientific metrics/diagrams, clear selected/focus states, unchanged decisions/scoring; results/rewards remain accessible. | UNVERIFIED |
| GH03 | Open all14 field guides; check careers/ideas and the Explorer search. | Same content/actions, consistent hierarchy and responsive cards; no former navy/mint page theme. | UNVERIFIED |
| GH04 | Open all3 projects. Try support modes, sliders, predictions, comparisons, save and export. | Actual models/plot colors retained; writing, progress and control states legible. Preview data stays in memory. | UNVERIFIED |
| GH05 | Inspect all6 wing journeys and all6 direct lab scenes; move controls and generate evidence. | Scientific condition/series colors remain meaningful; controls, units, validation and progress are readable at desktop/mobile widths. | UNVERIFIED |
| GH06 | Explore college/program filters, academic-profile controls, saved items and official links. | Existing filtering/saving/source disclosures work; forms are readable and usable without adding personal data. | UNVERIFIED |
| GH07 | Inspect My Universe and the demonstration pack. Close/reopen reveal, use keyboard and reduced motion. | Gold marks rewards; rarity labels/colors remain distinct; close/focus behavior works; reduced motion reveals cards without animation delay. | UNVERIFIED |
| GH08 | Run the assessment: no preselection, five answers, blank story submission, then a story with optional quotation. Close at each phase. | Blue selections/focus, clear private-sharing notice, optional writing/quotation, successful demo confirmation; earned results stay accessible. | UNVERIFIED |
| GH09 | Private demo: compare v2/v3, dates, empty period, response distributions and permission filters; download CSV/print with/without allowed quotes. | Honest DEMO labels, correct denominators/version distinctions, private story layouts and unchanged data/export behavior. This is not real authentication. | UNVERIFIED |
| GH10 | Use keyboard/Shift+Tab/Enter/Escape and a screen reader across menu, dialogs, forms and reports; inspect focus/contrast. | Named controls, logical order, focus restoration, no traps, visible focus and readable rendered text. | UNVERIFIED |
| GH11 | Use Mobile390 for every family above. Open Application.html separately at320,768 and1440 px; test200%/400% zoom. | Reflow without lost controls, clipped content or horizontal page overflow; scientific plots/tables may scroll within their own containers. | UNVERIFIED |
| GH12 | In the report scene print to A4 and Letter; inspect every page and permitted-quote option. | Ink-friendly layout, legible tables, no clipping/blank pages, exact DEMO/limitations/version/sample-size text; no unpermitted quote. | UNVERIFIED |
