# AltWing final production release

> **November18 update:** The dated mascot account-holder grant has now been received within rights held; do not request it again. Reference-input rights remain unverified. The owner subsequently authorized an isolated Black & Gold homepage preview, with visual approval required before platform-wide rollout. The frozen candidate and production are preserved. See [current design review](design/BLACK-GOLD-HOMEPAGE-REVIEW.md) and [permission receipt](rights/MASCOT-PERMISSION-2026-11-18.md). Earlier dated review evidence below retains its original scope.

Prepared November 17, 2026 (America/New_York). **HOLD — feature development is frozen; production deployment is not approved.** The founder approved current functionality and the private-administrator architecture **from a design perspective**. This is not a manual-test result, a copyright clearance, or final deployment approval.

This is the current consolidated release record. Earlier review files remain evidence within their original dates/scopes. No source feature, runtime setting, database, Site audience, Cloudflare setting or domain is changed by this consolidation.

## Frozen candidate and completed reviews

The reviewed private-dashboard package contains375 source files, tree SHA-256 `b8c21d4d590c4537e3f4e8594738572dba541e00a0dc71d4421068464df4b543`. All375 matched before this documentation-only consolidation. Subsequent changes are release documentation only; the packet supplies both manifests and a comparison. Do not silently alter runtime code after approval.

| Review | Status | Existing evidence and boundary |
| --- | --- | --- |
| Functionality/private architecture design | PASS — owner approval recorded | Current user instruction explicitly approves design; no new features are authorized. |
| Complete security/regression/build suite | PASS |25/25 checks at `2026-11-18T03:42:20.253Z`, zero active advisory allowances and zero unexpected failures. Includes Worker and all Pages builds, progression, missions, analytics/privacy, legacy/v2/v3 submissions and exports. No unchanged audit is rerun for this documentation-only task. |
| Private administrator security | PASS — isolated execution |150 endpoint checks,56 request-boundary checks, actual Worker entry and independent server-page guard. Denial occurs before rendering/data access; public Pages excludes the real dashboard. Both synthetic authorized identities share retained history. Real-account/edge behavior remains a live check. |
| Assessment usability/version safety | PASS — implemented and automated | Five plain-language items; exact requested Q2; all five required only for voluntary submission; story optional; quote permission hidden for blank text, separate and unchecked; explicit final Submit accepts the private-sharing notice; actual success/error handling. Exact impact-v2 wording/records retained, impact-v3 reported separately. |
| Research/originality review | PASS — bounded public-source scope | Completed comparison covers the archived impact-v2 registry and accessible primary material from all seven references. No distinctive copied item identified within that scope. The v3 readability revision is documented, not represented as a new validation or universal originality guarantee. Restricted/current forms remain outside the inspected scope; buying access is not an automatic release prerequisite. |
| Copyright/licensing review | PASS — review completed, clearance partial | Four contribution classes distinguished; founder's scoped authorization recorded; emitted software notices retained; original proprietary code remains UNLICENSED; no endorsement or validated-instrument claim. The specific active mascot permission gap remains below. No blanket assignment from every Git committer is requested. |
|42 opportunity records / two legacy advisories | PASS within recorded scope |30 verified retained-fact reviews;12 explicitly qualified partial records, existing IDs retained. Both former advisories retired with evidence; no failure waiver remains. Unannounced program facts are not represented as confirmed. |
| Data/auth/progress preservation | PASS — source and isolated evidence | Existing DB binding, applied migrations, Site auth integration, both administrator-secret settings and browser progress preserved. No database rewrite, secret reset, ownership transfer or origin change. Historical lifetime data is not fabricated or reconstructed beyond retained records. |

References: [private security](PRIVATE-ANALYTICS.md), [assessment method](ASSESSMENT-METHODOLOGY.md), [v3 usability](release-readiness/ASSESSMENT-V3-USABILITY.md), [rights register](release-readiness/RIGHTS-REGISTER.md), [questionnaire comparison](release-readiness/QUESTIONNAIRE-SIMILARITY-REVIEW.md), [opportunity evidence](release-readiness/OPPORTUNITY-VERIFICATION.json), [retired audit investigation](release-readiness/LEGACY-AUDIT-INVESTIGATION.md).

## Only the remaining pre-approval blockers

| Gate | Status | Exact evidence/action still needed |
| --- | --- | --- |
| Original active penguin rights | UNVERIFIED; dependent clearance gate FAIL | Nov18 creation screenshot/tool/account context and official Jan1,2026 terms are now documented; live/repository PNG bytes match. The dated account-holder grant has been received within rights held. Factual reference-image input/rights clarification remains unverified. Exact original-file derivation/dates remain disclosed limits. Do not replace branding or re-request the already supplied screenshot as missing. |
| Recorded manual acceptance | UNVERIFIED | Return the current guided checklist's CSV/JSON with actual pre-deployment results, browser/device/time and private error/evidence references. The existing plan has31 pre-deployment cases, including read-only checks of the current backend. Test desktop/mobile, keyboard/screen reader/contrast/motion, full WingMatch flow and every page of A4/Letter PDFs. Existing unchanged-case evidence can be reviewed for reuse; do not repeat already documented tests solely for a new packet. At minimum rerun the changed wording/submission/version interactions and private-entry behavior. Design approval alone does not fill test checkboxes. |
| Safe migration preflight | UNVERIFIED | Establish a recoverable backup or provider recovery point, its restore operator/procedure and a private reference/time. Obtain read-only schema/row-count and unique-index preflight results before approval, and refresh them immediately before migration. The connected Sites tools expose table names and bounded/truncated rows, not a full database export/restore operation; saved Site versions, reporting CSVs and paginated row inspection are not a recoverable DB backup. Use an existing supported owner/provider recovery facility if available; otherwise report the missing capability and keep deployment blocked. Never share passwords or publish student data. |

The manual template still contains38 UNVERIFIED rows; that means no candidate-bound result has been recorded here, not that the founder performed no earlier testing. The7 post-deployment cases are not demanded as impossible pre-release passes. Current-backend sign-in cases use the old production bookmark until the new routes are deployed.

The recovery action may require the existing Site owner/authorized hosting operator. The database is managed by Sites; it is not assumed to appear in the founder's separate Cloudflare domain account. Do not purchase a service, create a backup API, seed production records, or change Site ownership to work around access. A provider-supported recovery reference is needed, not credentials or a public copy of private feedback.

## Operator preparation already completed

- Latest GitHub `main` fetched: `443f965f2c5f45b2199c24b0b5db800eb5fee60b`; existing local work retained.
- Backend saved version11 and its existing archive confirmed; deployment `appgdep_6af9f19bb0a081918a0d035e6a276554` succeeded with runtime revision5. This is the rollback baseline, not a new deployment.
- Read-only DB overview confirms the existing `DB` binding and8 user tables; the4 research tables are not present in that overview. No student rows were read for this consolidation. Indexes, applied-migration bookkeeping, row counts and backups are not inferred from a table-name overview.
- Exact pending migration is unchanged: [0002_research_assessment.sql](../drizzle/0002_research_assessment.sql), SHA-256 `d32a63b5fbe73e76c7492d66a4380e8feb3c8267c570e1c677bb6ee800afda3d`.
- [Runbook](release-readiness/DEPLOYMENT-RUNBOOK.md), [read-only preflight SQL](release-readiness/PRE-MIGRATION-CHECKS.sql), and [post-deployment verification](release-readiness/POST-DEPLOYMENT-VERIFICATION.md) are prepared. No SQL has been executed on production by this preparation.

The migration is CREATE-only, but that is not a zero-risk guarantee. It adds4 tables,6 indexes and3 triggers, including a unique index on existing `analytics_events` for Recommended Field Explored. Unexpected existing duplicate keys could prevent that index from being created. The prepared read-only query checks this without deleting records. Sites applies hosted migrations before Worker upload; a failed deployment can therefore leave applied schema. Inspect actual state before retrying; do not reset migration history or blindly rerun CREATE statements.

## Final private login and public site

Private login after approval/deployment: **https://altwing-engineering-pathways.theanna.chatgpt.site/admin/login**

Private dashboard after approval/deployment: **https://altwing-engineering-pathways.theanna.chatgpt.site/admin**

These new routes are not live yet. The current production bookmark remains `https://altwing-engineering-pathways.theanna.chatgpt.site/#/analytics`. After release each administrator privately bookmarks the new login, signs in with their own authorized ChatGPT account in a top-level tab, and returns to /admin. Unlisted signed-in accounts are denied; sign-in does not grant administrator membership. The public student site remains **https://altwing.org** without login. No public dashboard link, DNS/proxy/domain change or shared credential is involved.

## Approval rule

The owner supplies the remaining evidence; the reviewer resolves actual failures, confirms the final candidate/backup procedure, and then requests **one final production deployment approval** covering the exact backend migration/release, subsequent GitHub Actions publication, and reviewed verification/rollback procedure. **Do not request that approval while the mandatory gates above remain unmet.** No deployment approval is requested or implied by this document.

## November18 provenance follow-up

[New mascot evidence](rights/MASCOT-PROVENANCE-2026-11-18.md) corroborates AI-assisted creation context and directly verifies live/repository byte identity. The official effective date was checked. The rights gate is narrower, not cleared: the account-holder grant is now received within rights held; reference-image rights remain UNVERIFIED. Other manual/recovery gates, existing application/tests and production are unchanged.
