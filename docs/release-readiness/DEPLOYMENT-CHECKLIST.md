# Final release decision checklist

Current canonical record: [FINAL-PRODUCTION-RELEASE.md](../FINAL-PRODUCTION-RELEASE.md), November17,2026 America/New_York. Earlier full checklists remain in the prior immutable review packages. **HOLD — production is unchanged.** Design/functionality approval is recorded; final deployment approval is not granted.

| Requirement | Status | Decision/evidence |
| --- | --- | --- |
| Freeze features; preserve reviewed implementation | PASS | Previous375-file source snapshot matched before documentation consolidation. No product, asset, auth-policy, schema, dependency, workflow or frontend implementation changed in this step. |
| Consolidate completed reviews | PASS | Existing25/25 full checks,150 API cases,56 boundary cases, v2/v3 regression, bounded research review, scoped rights register,42 opportunity reviews and retired advisory evidence are retained. No audit was repeated. |
| Active mascot creation/reuse permission | UNVERIFIED | Nov18 creation screenshot and official effective terms are documented; live/repository asset hashes match. Account-holder grant/previous-permission confirmation and reference-image input rights still need evidence; clearance gate remains FAIL. Preserve branding. |
| Manual pre-deployment acceptance results | UNVERIFIED | Current31 pre-deployment checklist cases need recorded execution/coverage; existing unchanged-case evidence may be reused after review.38 fresh rows remain UNVERIFIED, including7 post-release cases. No design-approval-to-PASS conversion. |
| Recoverable backup / verified restore route | UNVERIFIED | Existing Site owner/operator must identify supported full backup/recovery point, private reference/time and restore procedure. Connected tools have no full export/restore function. A code version or report CSV is not a DB backup. |
| Read-only migration baseline/preconditions | UNVERIFIED | Execute prepared SELECT-only preflight through authorized DB access; no conflicting new schema names or duplicate keys for the new unique index; record baseline counts/time privately. Tool table overview is not this check. |
| Deployment, preservation and rollback procedure | PASS — prepared | Separate Sites backend first, GitHub main/Actions afterward; unchanged DB/secrets/audience/domain; normal Git revert/previous Worker version without deleting tables or responses. See runbook. |
| Final owner production approval | UNVERIFIED — not requested | Request only after mascot/manual/recovery/preflight evidence is satisfactory and exact source is fixed. Design approval is separate. |

## Not additional pre-approval blockers

- Complete current restricted research forms/universal originality are disclosed limits, not grounds to demand a new paid audit absent a concrete copying concern.
- Founder-scoped authorization is already recorded; do not demand blanket contributor assignments based only on Git names.
- Unknown future opportunity fees/eligibility remain qualified; the completed official-source review is not reopened without new facts/freshness failure.
- Real access to **new** /admin resources, genuine new survey storage and Cloudflare Visits must be verified after release; mock results cannot satisfy them before deployment.
- Existing Cloudflare page-view receipt was owner-confirmed. Visits and AltWing sessions are separate metrics and not unique people.

## Post-deployment acceptance

All remain **UNVERIFIED** until the approved candidate is actually deployed. Use [POST-DEPLOYMENT-VERIFICATION.md](POST-DEPLOYMENT-VERIFICATION.md) and existing L01–L07: exact backend/Actions revisions; both independent administrator accounts; anonymous/unlisted dashboard/API denial; genuine five-answer submission and private retrieval; history and version-separated exports; genuine mission outcomes; analytics/privacy/Visits; public features and saved progress. Do not seed fake data or expose identity/feedback in evidence.

The final packet has source/artifact hashes, actual existing test logs, the unchanged interactive preview, exact user evidence requests and operator procedures. A passing technical `canDeploy` field in test-policy JSON means only that its automated requirements passed; it is not final release approval or rights/manual/backup clearance.
