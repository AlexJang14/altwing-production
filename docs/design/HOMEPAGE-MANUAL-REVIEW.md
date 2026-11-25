# Focused homepage manual review

All rows begin **UNVERIFIED**. Record PASS or FAIL only after performing the case. These changed-homepage cases supplement earlier valid evidence; they do not replace the existing release acceptance plan or mark its unperformed cases passed.

Use the supplied `preview.html` with a current Chrome, Safari or Firefox browser. Record browser/version, device, viewport, date and any private screenshot reference. Production submission and analytics are disabled in this artifact. Other pages retain their previous visual theme until direction approval.

| ID | Exact steps | Expected result | Status | Error / private evidence reference |
| --- | --- | --- | --- | --- |
| H01 | Select Desktop. Read the hero at a browser width of at least 1280 px. Scroll the entire homepage. | Both requested brand messages and engineering purpose are clear. Black/graphite/gold hierarchy is consistent. Original mascot is recognizable. No text overlaps, clips or becomes unreadable. | UNVERIFIED | |
| H02 | Click Discover your next chapter below the hero. | The four-step journey scrolls into view without changing to another app route. | UNVERIFIED | |
| H03 | In the project section, select Solar energy, Bridge design and Cooling systems in turn. Activate Try this experiment. Use Return home. | Exactly one selector is active; the actual preview/question and experiment destination match each selection. Return home restores the real homepage. | UNVERIFIED | |
| H04 | Open Find My Wing from the hero. Return home; open Explore engineering. Repeat with each four-step card, Programs and My Universe. | Each existing destination opens. No new login gate appears for student content. Existing non-home styling is expected during this first stage. | UNVERIFIED | |
| H05 | Select Mobile · 390. Scroll top to bottom. Open Menu, activate a navigation link, then Return home. | No horizontal scrolling, clipped headings, overlapping art, obstructed controls or missing footer links. Menu opens and closes; links remain easy to tap. | UNVERIFIED | |
| H06 | Resize the browser to 320 px, 768 px and 1440 px wide in Desktop mode, or use the browser's responsive viewport tools. Check hero, journey cards, project section and footer at each width. | Layout adapts at narrow, tablet and desktop widths. Content order and all actions remain available. The 390-mode wrapper alone does not certify every breakpoint. | UNVERIFIED | |
| H07 | Reload. Use Tab/Shift+Tab without the mouse. Activate Skip to content, both hero actions, project selectors and footer links. At mobile width open Menu, tab into it and press Escape. | Focus is visible and follows readable order. Skip targets main content. Escape closes the menu and returns focus to its toggle. No keyboard trap. | UNVERIFIED | |
| H08 | At desktop width set browser zoom to 200%; repeat navigation and the project section. Try 400% at a 1280 px browser window. | Text reflows, controls remain operable, and no essential content is lost or obscured. | UNVERIFIED | |
| H09 | Enable the operating system's Reduce Motion setting, reload and scroll. Turn it on while an animation is running if supported. | Mascot drift, orbital pulse and entry motion stop; all text and actions remain visible and usable. | UNVERIFIED | |
| H10 | With VoiceOver or NVDA, navigate by headings, links and controls. Read the project selectors and switch selection. | One meaningful main heading, sensible landmark/heading order, named controls, announced selection/question changes and no decorative-horizon announcement. | UNVERIFIED | |
| H11 | Inspect focus, muted text, selected controls and text over the hero image using a browser contrast tool. | Normal text meets 4.5:1; large text and essential control/focus indicators meet applicable 3:1 requirements. Record actual rendered evidence; token calculations alone do not pass this row. | UNVERIFIED | |
| H12 | Open browser Network tools, reload the preview and navigate its student pages. Try a feedback submission only if completing the existing flow. | No Cloudflare beacon or production ingestion request is sent. Preview feedback reports that submission is disabled rather than saving a real record. External official links may open only when deliberately activated. | UNVERIFIED | |

Reviewer: __________  Browser / version: __________  Device / viewport: __________  Date: __________

Visual direction decision: **UNREVIEWED / APPROVE / REVISE**

Changes requested: __________________________________________________________

This decision covers the homepage direction and subsequent platform styling work only. It is not production deployment approval, a completed copyright clearance, or a result for any unperformed release test.
