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
