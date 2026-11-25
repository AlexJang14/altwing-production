# AltWing Black & Gold homepage direction

Prepared November 18, 2026 (America/New_York). **Visual review only. Production is unchanged.**

The current owner request authorizes a homepage preview first. Platform-wide visual changes follow approval of this direction. The original release candidate remains in `/workspace/altwing-editable`; this candidate is isolated in `/workspace/altwing-black-gold` on `design/black-gold-homepage`. GitHub main was fetched and still points to `443f965f2c5f45b2199c24b0b5db800eb5fee60b`. No commit or push was made, and the isolated checkout's push URL is disabled. Existing unpublished assessment and private-administrator work was copied without discarding it.

## What to review

Open the accompanying **preview.html** in a browser. It is a self-contained copy of the actual AltWing application, with a desktop/mobile review bar. It needs no server or account. Choose **Desktop** or **Mobile · 390**, scroll the homepage, switch the three project previews, open the mobile menu, and try the existing navigation. **Return home** returns to the redesigned page without resetting the preview's progress.

Only the homepage and its shared navigation/footer receive the proposed theme in this phase. Other routes intentionally retain the preserved candidate's appearance until visual approval. This is not the completed platform-wide redesign.

The actual `GuidanceHome`, `SiteHeader`, `SiteFooter`, `Penguin`, `JOURNEY`, `PROJECTS`, `ProjectVisual`, routing and App callbacks run in the preview. There is no parallel mock homepage. Three review-only adaptations embed assets, map informational-document links to their existing hash routes, and skip home URL canonicalization inside `about:srcdoc`. Production routing code is unchanged.

## Visual system

- Obsidian `#101216` and graphite `#1B1E24` form the main surfaces. Antique `#B99252`, signature `#E6BB65` and champagne `#F2D89D` gold mark hierarchy, actions and orbital details; warm pearl `#F7F2E6` is the main text color. Black dominates; gold remains an accent rather than a surface wash.
- The two requested brand messages remain prominent. The first paragraph explains engineering exploration, decisions and experiments. No student counts, testimonials or impact statistics are invented; the field/scenario/project/lab counts describe existing content.
- Self-hosted Manrope and Space Grotesk provide body and display typography. Their complete SIL Open Font License notices and source/hash records are retained. No external font request is needed.
- A new fictional planetary horizon was generated in this development session without reference images, then compressed to a roughly 105 KB WebP. It is decorative original AI-assisted output, not a NASA photograph or a claim of exclusive copyright. Provenance and the original generated-file hash are recorded.
- The original mascot PNG is byte-for-byte unchanged. Restrained surrounding gold orbits provide the proposed treatment; no replacement character or pixel recoloring is introduced.
- `src/design/blackGoldTokens.css` centralizes palette, text styles, spacing, radii, borders, shadows, motion and focus tokens. Homepage styles consume these tokens within `.aw-theme-black-gold`; compatibility aliases are restricted to that scope. Scientific plot and collectible-rarity colors are preserved.
- Responsive layouts include desktop, tablet and narrow mobile rules. Entry animations leave content visible by default; reduced-motion preferences cancel motion. Buttons and navigation have visible focus styles and touch-sized controls. Mobile-menu Escape returns focus to its toggle.

See [asset provenance](BLACK-GOLD-ASSET-PROVENANCE.json), [font records](BLACK-GOLD-FONT-LICENSES.json) and [mascot permission receipt](../rights/MASCOT-PERMISSION-2026-11-18.md). The received mascot grant covers only rights actually held; reference-input uncertainty remains recorded separately.

## Preservation and verification

The original release candidate's 384 copied source files are indexed in the accompanying baseline manifest. The targeted check compares 170 protected API/backend, database/migration, analytics, progression, WingMatch and project files against that baseline. All match. The original mascot SHA-256 remains `ba5278a01945231847b44295d56e0617bf8a7b922c5bd26c00e685fcab76b975`.

The targeted check executes the real homepage/chrome, project-selection state and existing callbacks, saved-result resume/college routing and menu Escape/focus behavior. It also checks the self-contained bundle's syntax, retained font notices, responsive/reduced-motion code, and ten token contrast pairs. Calculated contrast is evidence about those token pairs, not proof of every rendered element or text over imagery. Results and the full regression/build report accompany the preview.

Browser layout, clipping, actual focus order, screen-reader output and animation appearance have **not** been observed in this session. They remain UNVERIFIED in the focused manual checklist. No screenshots or browser-test passes are fabricated.

The [Sites skill](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) states: “If `cua_repl.js` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” That tool is unavailable here, so this review uses a standalone interactive artifact and leaves browser checks for actual manual execution.

## Isolation and next approval

The preview is built with production analytics disabled and no backend API origin. Existing submission guards disable real feedback submission in previews. No production sessions, survey records, tests or Cloudflare beacons are intentionally transmitted. Any progress made while exploring this artifact is preview-browser activity, not progress stored at altwing.org. Production privacy settings and storage keys are unchanged.

No database migration, deployment, DNS/domain/proxy change, Site-ownership change, purchase or production repository push is part of this stage. The pending research migration, both administrator authorization paths, impact-v2/v3 records and the existing deployment workflow are preserved.

The next decision is approval or revision of the **homepage visual direction**. That approval would authorize applying this reviewed design system across the remaining platform and preparing its comprehensive preview. It does not authorize publication. Full-platform visual/accessibility review and explicit production approval are still required before deployment.
