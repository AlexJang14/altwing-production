# Independent administrator access

## Review status

This update is prepared locally from production commit `da9007a46ebf35d535c9ff09984f7e56f9ff46b2`. Production configuration and deployment require final approval. This file documents the intended release, not confirmation that the additional account is active.

The existing backend, Sites ownership, audience, D1 binding `DB`, schema, retained data and browser progress remain unchanged. No database migration, identity provider, paid service or new Site is required.

## Server configuration

- Preserve `ANALYTICS_ADMIN_EMAIL` exactly as currently configured in Sites. This remains the existing owner's server-side secret.
- Add `ANALYTICS_ADDITIONAL_ADMIN_EMAILS` as a **secret** runtime value in the same Sites project after approval. Its value is a JSON array of exact, approved ChatGPT sign-in email addresses. Do not put real values in GitHub, frontend environment variables, `.openai/hosting.json`, screenshots, previews, logs or documentation.
- Configure additional grants through the existing Sites environment-variable tool, updating only this new key. Keep the signing secret and allowed origins untouched. Apply runtime changes using the normal saved-version backend deployment.
- Administrator values are provided privately by the owner. Source and tests use reserved example identities only. The public build contains neither the allowlist nor its values.

`analyticsAuthorization()` checks the authenticated identity supplied by the existing ChatGPT sign-in integration. It first preserves the existing owner grant, then compares the authenticated email with the additional allowlist. Matching is exact after trimming and case normalization; there is no domain, wildcard, substring, URL, form or role-header grant.

The optional setting must be valid JSON containing at most 100 email strings and at most 8192 characters. Empty/missing, malformed, non-array, mixed-type, wildcard or invalid entries deny additional grants. A malformed optional setting cannot lock out the existing owner. Changing/removing a grant takes effect on subsequent requests after the runtime revision is deployed; no per-user permission cache is used.

## Scope and boundaries

Both authorized accounts may read the original navigation report, educational impact report and private feedback, export numeric/private-feedback CSV, and run/resume historical reporting preparation. They see the same stored data. Quotation permission, anonymous student feedback, retention, date ranges and metric definitions do not change.

Private API routes check authorization before querying the database or running retention/import writes. Anonymous requests receive 401; authenticated unlisted accounts receive 403. Responses remain private/no-store, and private data has no cross-origin read permission. The student website remains public. Normal anonymous survey ingestion still uses its existing explicit permission and signed session capability.

Dashboard administration grants no Sites ownership, source-editor role, deployment capability or access to the server's runtime secrets. Do not use a Sign in with ChatGPT bypass token as an administrator login.

## Review preview and tests

`npm run build:impact-preview` creates an offline HTML preview with an **Access states** tab showing the actual access-panel component. Select existing administrator, additional administrator, signed out or unlisted account. These are clearly marked demo states, never real authentication, and login buttons are disabled. All dashboard data is marked demo; tracking and production API calls are disabled.

`npm run test:admin-access` executes real API handlers and SQL against isolated in-memory SQLite. It checks both administrator identities across navigation, impact/private feedback, both CSV export kinds and history initialization; denied identities before database access; malformed settings without owner lockout; exact identity matching; grant revocation; CSRF origin checks; preserved raw/survey records; and the rendered real access component. No real identities or production test records are used.

`npm run verify:release` includes this required check plus the existing tests and all production builds. The two explicitly reviewed content/audit advisories remain unchanged; unexpected failures block release. Static-build validation checks that server administrator/signing configuration is absent from every Pages bundle.

## Approval and rollout

1. Review the source diff, offline access-state preview, authorization matrix and test results. Approve before any commit/push or production environment change.
2. Sync production again. Commit the reviewed source using a GitHub-provided noreply author address, and securely add only the additional-admin runtime secret. Deploy the matching saved version to the existing backend; retain saved version **10** as rollback. Do not print secret values or include them in tool summaries.
3. Push the reviewed frontend wording/preview/test changes to the existing production GitHub repository and let its current Actions workflow validate and deploy.
4. Independently sign in with each account at https://altwing-engineering-pathways.theanna.chatgpt.site/#/analytics. Verify both accounts see the same reports, private feedback and exports. If reporting is still unprepared, either authorized account can select **Prepare / continue historical reporting** until ready.
5. Verify signed-out and an unrelated signed-in account cannot read reports, feedback, exports or initialization. Recheck privacy controls and existing student features. Do not enter invented feedback or completions in production.

Actual two-account browser sign-in cannot be verified from mocks or builds. Report it as pending until each account is exercised on the approved live release. Use the existing top-level ChatGPT sign-in/sign-out links; credentials are never shared.

## Rollback and revocation

For an access-only rollback, remove the new additional-admin setting or deploy it as an empty JSON array while preserving the existing owner secret. Redeploy the existing saved release to apply the configuration. For a code rollback, restore backend saved version **10** and revert the frontend commit through normal Git history/Actions. No database reversal is required. Existing analytics, survey rows, quote permissions and historical-import state remain in the original database. Obtain approval before a later production rollback or access change.
