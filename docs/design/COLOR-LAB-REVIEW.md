# AltWing Color Lab

Prepared November 18, 2026 (America/New_York). **Preview only; no final identity selected and no production change.**

Open `Color-Lab.html` in a browser. It contains the actual existing AltWing application and all required imagery/fonts in one offline file. It needs no server or sign-in. The previous Black & Gold workspace, review package and release candidate remain preserved. This work is isolated in `/workspace/altwing-color-lab`, branch `design/color-lab`; its production push URL is disabled.

## Use the lab

1. Choose Ion Blue, Solar Coral, Hyper Lime, Nebula Violet, Cosmic Raspberry, or the Black & Gold control. Selection applies instantly to the existing app instance; it does not reload the homepage or reset progress/project selection.
2. Adjust intensity from Quiet (2) to Expressive (5). This changes the amount of accent treatment and orbital emphasis. Exact accent hues stay fixed. Approximate 2–5% presence is a visual target, not a measured pixel-coverage claim.
3. Choose Desktop (1440 × 1000) or Mobile (390 × 844). Frames are scaled to fit the available review area while retaining their real viewport dimensions and responsive CSS. Use Single to inspect detail.
4. Choose Side by side and select the comparison palette. The second frame loads only when needed; both use the same app document. Vertical scrolling is linked. On narrow lab screens the frames stack so controls remain usable. Navigation remains real, and Return home takes both frames back to the homepage.
5. Inspect the live light-on-dark samples and expand Compare all six palettes for calculated contrast ratios. Dark labels are used on filled accent buttons. Warm Pearl on any candidate accent fails 4.5:1, so the lab explicitly identifies that pairing as unsuitable for normal button labels.

## Palette and roles

| Candidate | Exact color |
| --- | --- |
| Ion Blue | `#45D9FF` |
| Solar Coral | `#FF695C` |
| Hyper Lime | `#C5F45D` |
| Nebula Violet | `#A995FF` |
| Cosmic Raspberry | `#FF547D` |
| Black & Gold control | Existing `#E6BB65` gold; no kick overrides |

The base remains Obsidian `#101216`, Graphite `#1B1E24`, Signature Gold `#E6BB65` and Warm Pearl `#F7F2E6`. Gold remains on the wordmark, headline emphasis, factual capability numbers and existing value cues. The accent marks exploration CTAs, selected project states, focus/hover interactions, small arrows/details and orbital paths. At higher intensities it also marks exploration eyebrows and outline actions. Surfaces stay dark; only the small selected control receives a flat subdued tint. No gradient, glow, asset recoloring or colorful card treatment is added.

All five accents use identical roles. The control removes all kick overrides and uses the exact previous Black & Gold styles. The homepage TSX, navigation, actual project components, font files, horizon image and mascot PNG are unchanged.

The source of truth is `src/design/kickColorTokens.ts`. It defines the candidates, fixed core, intensity settings, selected-surface mixes and contrast calculations. `src/design/kickColorRoles.css` provides reusable semantic exploration/achievement roles. It is imported **only by the Color Lab frame**, not production entries. No final production accent or saved user preference is introduced.

## Verification and limits

The focused checks exercise the real lab and frame-bridge controllers using an isolated DOM/event harness: six choices, all four intensity levels, lazy comparison, viewport scaling, app-instance preservation, linked scrolling, sender validation and reset to the control. Calculated normal-text contrast passes for the intended dark-surface, selected-state and dark-on-accent combinations at every intensity. Full script syntax, type checking and lint are checked separately.

401 existing homepage-candidate source files match their baseline exactly; only package scripts change among the 402 copied files. Both original workspaces are also checked directly: all 402 homepage-candidate files and all 384 prior release-candidate files remain unchanged. Backend/API/authentication, assessment versions, data, progress and existing app behavior are preserved. No new dependency, visual asset, font or database migration is introduced. Previous full regression evidence remains valid for unchanged production code; it is not represented as a new run of those audits.

Browser visual layout, assistive-technology behavior and actual pixel coverage remain **UNVERIFIED**. The [Sites workflow](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) states: “If `cua_repl.js` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” That tool is unavailable in this session. No browser screenshots or manual PASS results are fabricated.

The artifact inherits the existing preview's production-analytics opt-out and disabled feedback submission. Theme messages contain only palette IDs, intensity and scroll coordinates, and are accepted only from the known parent/frames. The actual public site, dashboard permissions, backend, domain, DNS/proxy and deployment settings remain untouched.

## Focused manual review

All rows start **UNVERIFIED**. Record PASS or FAIL only after performing them.

| Case | Steps | Expected | Status / evidence |
| --- | --- | --- | --- |
| CL01 | Switch through all six palettes while viewing the hero. | Same layout, copy, imagery and mascot; only defined interaction accents change. Control restores the original Black & Gold appearance. | UNVERIFIED |
| CL02 | Select each colored candidate and move intensity from 2 through 5. | Restrained, increasing accent presence; exact hue and dark/gold core stay fixed. No glow or colorful cards. | UNVERIFIED |
| CL03 | Scroll to project previews, choose Bridge design, and switch palettes/intensity. | Scroll position, selected project and existing app instance remain intact. | UNVERIFIED |
| CL04 | Compare Ion Blue with the control; choose each other comparison color. Scroll and use Return home. | Two real matching app previews; scroll follows; Return home works on both. | UNVERIFIED |
| CL05 | Switch Desktop/Mobile in Single and Side by side. Resize the lab to phone width. | Actual viewport sizes are preserved; mobile layout is responsive; outer lab controls remain usable and comparisons stack on narrow screens. | UNVERIFIED |
| CL06 | Use Tab, arrow keys on palette radios, Enter/Space and the range slider. Try a screen reader. | Named controls, visible focus, announced choices and no keyboard traps. | UNVERIFIED |
| CL07 | Enable reduced motion, reload and switch palettes. | Existing motion stops; content and controls remain available. | UNVERIFIED |
| CL08 | Review contrast samples/table and inspect actual rendered text/focus over imagery with a browser contrast tool. | Calculated ratios match their labels; intended text pairings meet requirements. No assumption that token calculations alone certify all rendered elements. | UNVERIFIED |

Choose a palette and intensity after review. That choice will guide a later platform-wide styling preview; it does not approve deployment.
