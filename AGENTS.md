# AltWing production development rules

AltWing is a live production website. These owner instructions apply to every future update in this repository.

- Official website: https://altwing.org
- Production repository: https://github.com/AlexJang14/altwing-production
- Production branch: `main`
- Deployment workflow: `.github/workflows/pages.yml` (GitHub Actions)
- Current operations guide: `docs/PRODUCTION.md`

## Required workflow for every update

1. **Sync before editing.** Fetch the latest production source from `AlexJang14/altwing-production` and compare it with the working checkout. Start from the latest production revision. Preserve local work and resolve divergence without overwriting changes or rewriting published history.
2. **Preserve the existing application.** Keep existing features, assets, missions, simulations, progression systems, saved browser data, authentication, backend connections and analytics working. Retain existing storage keys, database bindings and backend configuration unless the owner explicitly requests a change. Assess any data migration before implementing it.
3. **Implement and test the requested change.** Keep changes scoped to the request. Run appropriate tests and production builds, and report failures and verification limits accurately. Do not hide failures, weaken checks or invent verification dates to obtain a passing result.
4. **Show a preview before deployment.** Present the implemented result for review, with the relevant changes, test results and migration risks. For documentation changes, show the file or diff. A successful build alone is not an application preview or evidence of browser interaction testing.
5. **Wait for explicit owner approval.** Do not commit or push the update to the production repository until the owner approves the preview. Do not dispatch a production deployment before approval. Approval covers the reviewed changes; materially different changes need a new review.
6. **Commit, push and deploy after approval.** Preserve version history with clear commits. Push approved changes to the production repository and deploy through the existing GitHub Actions workflow. A push to `main` automatically starts production deployment; treat it accordingly.
7. **Verify the live result.** Wait for the workflow to complete, then verify the requested changes on https://altwing.org, including affected assets, routes, saved progress and backend connections. Report the actual deployed revision, results and any remaining limitations. Do not claim deployment success from a push or build alone.
8. **Keep rollback possible.** Retain the previous working revision and deployment history. Prefer an approved `git revert` and the existing deployment workflow for rollback. Do not force-push, delete repositories or discard unrelated work.

## Protected resources and secrets

- Never modify the old `junjang06/altwing` repository or its deployment without the owner's explicit permission. It is not the production source for future work.
- Never change domain or DNS settings without the owner's explicit permission. Routine application updates do not authorize these changes.
- Keep secrets out of source code, Git history, browser bundles, previews, logs and messages. Use the existing server-side secret configuration; do not expose API keys or credentials.
- Never purchase additional services or incur new service charges without the owner's explicit permission.
- Preserve the existing backend, authentication and database connections. Backend deployments and runtime changes are production changes and require the same preview, approval and verification process.

## Repository-specific validation

- `npm run verify:release` runs the full release checks and reports the exact reviewed pre-existing advisories. Unexpected failures block deployment.
- `npm run verify:migration` is the strict runner; it exits unsuccessfully for any failing check, including a pre-existing advisory. Report that distinction rather than saying all checks passed.
- `npm run build:pages` builds the custom-domain frontend. The workflow selects the configured Pages base automatically; `npm run build` builds the separate existing Worker backend and does not publish it.
- `python3 scripts/check-live-site.py --target custom` performs read-only live asset, original-site and analytics-access checks after deployment. It does not replace browser interaction QA.
- For documentation-only changes, review the file/diff and formatting. Do not run unrelated application tests or trigger a deployment without approval.

If access or preview tools are unavailable, explain the specific blocker and finish independent preparation. Do not bypass the approval requirement or make unverified production changes.

## Golden Horizon RC1 release freeze

The owner approved the platform visual direction on November 19, 2026 and froze design and feature development. The current consolidated release record is `docs/release-final/STATUS.json`, with scope and evidence in `docs/release-final/README.txt`.

- Preserve the reviewed product candidate; do not add features or redesign pages.
- Resolve only genuine release blockers. Reuse valid unchanged-source evidence and never mark unperformed manual tests passed.
- Keep unknown reference-image rights, manual acceptance, recovery and production SQL preflight open until evidence resolves them. The mascot account-holder grant is already recorded; do not request it again or infer third-party permission.
- No final production approval has been given. Hold the one consolidated deployment request until mandatory gates pass, then obtain explicit approval before committing/pushing to production or publishing.
- A necessary product fix requires a separately reviewed candidate and focused regression checks. Documentation/evidence updates are allowed without changing the frozen product.

## November 21 approved narrow additive revision

The owner authorized a separate complete candidate retaining the four new
tables and aggregation triggers, removing the pending historical field UNIQUE
index and adding atomic ingestion deduplication. Preserve the original RC1.
The owner acknowledges production DB recoverability remains UNVERIFIED and
paused the Support request. Do not require a full SQL console or demonstrated
restore merely as a Sites publishing mandate; retain supported migration-state
checks and the stop-on-partial-failure procedure in docs/release-final.
Current STATUS.json supersedes earlier gate wording without falsifying evidence.
Mascot reference rights and actual manual acceptance remain unresolved. No final
deployment approval, production write, commit/push or publication is authorized.

## November 23 final acceptance direction

The owner approved the integrated Golden Horizon + Live Intelligence design and
feature direction, not deployment. Freeze product development. Record actual
results in the existing 31 pre-deployment cases; keep seven live-only cases
separate. Reuse documented observations only when their exact criteria match.
The optional College Scorecard key is not an initial-launch prerequisite; keep
its unverified collector disabled. Initial activation is verified daily/weekly
only and is part of the ONE later explicit deployment approval, followed by real
GitHub Actions executions and live freshness checks. No schedule activation now.
Keeping the existing penguin does not itself accept the reference-rights risk.
Obtain an explicit release-policy decision; an exception never supplies third-
party permission or changes underlying rights from UNVERIFIED. Do not request
the recorded November18 account-holder grant again. Preserve the acknowledged
production recovery limitation and stop-on-partial-migration safeguards.
Current reported acceptance progress and owner decisions are recorded under
/workspace/altwing-final-integrated/evidence. No final deployment approval yet.

## November 24 conditional launch instruction

The owner has explicitly approved the initial-release policy exception for the
unchanged penguin. See docs/rights/MASCOT-RELEASE-EXCEPTION-2026-11-24.json.
Underlying reference-image rights remain UNVERIFIED; this is not third-party
permission or copyright clearance. Do not request the existing grant or this
decision again unless genuinely new evidence changes the risk.

The owner now authorizes the one complete integrated launch once the stated
mandatory release conditions are met. This supersedes older pending-approval
wording; it does not waive unperformed manual acceptance, permit blind migration
retries, or authorize publication of an older build. The isolated launch copy is
/workspace/altwing-production-launch/source. Preserve all earlier candidates.
Reconcile official facts only within actually inspected evidence. Unavailable
sources retain their prior factual review date and explicit qualifications.
Keep all 126 unreviewed collectors and the optional Scorecard collector disabled.
