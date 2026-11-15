# Cloudflare and educational impact analytics

**Review state:** implemented locally on `feature/cloudflare-impact-analytics`, based on production commit `f8b3bd20f706ff9d63a6fb45591d9439fce8ae1e`. Not committed, pushed, deployed, or applied to the active database. Production approval is required by `AGENTS.md` and the owner's request.

## What is included

- The supplied Cloudflare Web Analytics module script and public site identifier, loaded once through a privacy/production gate.
- Existing hash-route page metrics plus deduplicated project/lab mission starts and evidence-based completions.
- Optional before/after WingMatch understanding ratings and a post-result survey covering satisfaction, career helpfulness, recommendation and optional written feedback.
- Repaired legacy WingMatch feedback submission: real backend receipt is required before success or a submitted marker is shown. PostHog availability is no longer a prerequisite.
- An integrated owner-only educational dashboard above the preserved original navigation dashboard: lifetime available coverage, UTC date filters, cumulative growth, WingMatch start-cohort conversion, rating distributions, paired self-reports, CSV exports and a printable report.
- Separate explicit feedback permission and unchecked permission to quote a testimonial publicly. Private text is excluded from shareable outputs.
- Additive schema on the same `DB` binding, plus a separate bounded/resumable owner-only historical import. No new service or database is provisioned.

## Cloudflare installation and privacy

`src/features/analytics/cloudflareBeacon.ts` creates exactly one script with `type="module"`, source `https://static.cloudflareinsights.com/beacon.min.js`, and `data-cf-beacon` containing the supplied identifier. That identifier is intended to be public in a client snippet; it is not a Cloudflare API credential.

The script is gated by both the custom-domain production build and the exact `https://altwing.org` origin. Development, the GitHub preview, the backend host, owner analytics, privacy and progress-transfer views are excluded. Potentially private/unknown URL parameters suppress its loading. The existing `altwing-analytics-consent-v1` opt-out, DNT and GPC are respected; privacy changes from another tab invalidate the in-memory preference cache.

Removing a script tag cannot undo its event handlers. For a beacon already loaded, narrowly scoped guards block its `sendBeacon`, XHR and fetch telemetry destinations after privacy revocation, without intercepting unrelated application requests. Cloudflare then stays disarmed for that document, avoiding replay of opted-out/private activity. It can resume on the next full page load. The app does not reload automatically or discard user work.

Cloudflare's native SPA measurement uses browser-supported soft-navigation, Navigation API or History API handling. The fallback does not establish consistent semantic hash-route reporting across browsers. AltWing therefore retains its own validated `hashchange` page measurement; it does not reload the Cloudflare script on hash changes, synthesize history navigations or send undocumented manual beacons. Cloudflare site/performance statistics and AltWing educational statistics are distinct datasets and must not be added together. Cloudflare account-level delivery can be confirmed only after an approved real deployment and an actual allowed browser visit.

References: [Cloudflare manual installation](https://developers.cloudflare.com/web-analytics/get-started/), [SPA behavior](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/), [RUM data collection](https://developers.cloudflare.com/speed/observatory/rum-beacon/).

## Metric definitions and truthful reporting

| Metric | Definition and limits |
| --- | --- |
| Visit sessions started | A random tab-session ID rotates after 30 minutes of inactivity. A visit is counted on its first observed UTC day. Reloads, other browsers/devices and blocked storage affect session grouping. This is not unique individuals or verified students. |
| Page views | Validated canonical app views. Raw URL text, unknown parameters and form contents are excluded from first-party events. |
| Mission sessions started | A known project or aerospace-lab workspace was opened. One start per session/activity, including across reloads. This is not proof of sustained engagement. |
| Mission sessions completed | Required project evidence or a lab Proof of Flight was saved. One completion per session/activity. Model computations and progression awards remain unchanged. |
| WingMatch completion rate | Recorded sessions with a start followed by completion, divided by sessions with a start. Conversion is attributed to the start's UTC day and observed through report generation, so a cross-midnight completion cannot inflate the next day's rate above 100%. Raw completion occurrences are also shown separately. |
| Survey responses | Voluntary responses, at most one per anonymous session. A respondent is not a verified unique individual. People who opted out of automatic metrics can separately choose to submit feedback; do not divide responses by all visitors or assume representativeness. |
| Satisfaction / helpfulness | Means and distributions on 1–5 scales, with current-questionnaire response counts. Negative and positive valid ratings are both included. |
| Recommendation | A 0–10 likelihood rating, with its response count. It is not automatically labelled NPS or evidence of actual referrals. |
| Understanding change | Same-item before rating collected prospectively at WingMatch's start and after rating supplied with the optional survey. Only paired responses contribute to before/after means and mean change. Missing baselines are not invented. These are self-reports, not objective learning tests or causal evidence. |
| Legacy feedback | The original understanding/direction/action question wording is retained and stored separately from the new questionnaire. It is not mixed into paired understanding gains or current satisfaction means. |

No counts are labelled unique students. The implementation has no identity fields, fingerprinting, cross-device profile or claim that respondents represent everyone. Anonymous ingestion is rate/size/capability constrained but is not an audited or bot-proof measurement system.

Example wording for an eventual real report: “AltWing recorded [N] anonymous visit sessions across the stated available coverage. Among [R] voluntary current-questionnaire responses, career helpfulness averaged [X]/5. Paired self-reported understanding changed by [D] scale points across [P] responses.” Replace placeholders only with actual report values and retain dates, denominators and limitations. Do not use demo preview values as evidence.

## Existing database and retention

Read-only inspection confirmed the active Sites project currently has the `DB` binding and `analytics_events` table. The application continues using the same `.openai/hosting.json` identity and existing runtime authentication/signing secrets.

`drizzle/0001_impact_measurement.sql` is schema-only: it adds a nullable event origin, impact tables, indexes and triggers. Existing rows and columns are retained. Drizzle metadata was generated with the existing tooling. Sites applies hosted migrations before uploading the new Worker; backfill is deliberately outside the migration.

After publication, the signed-in owner selects **Prepare / continue historical reporting**. `POST /api/impact/initialize` requires owner authentication and an exact same-origin request. Each transaction examines at most 500 retained raw records, advances a durable cursor and replays eligible events through a unique-ID ledger. The UI performs at most 20 such batches per click. Retrying resumes rather than duplicating data. A final transactional ready transition serializes with ongoing ingestion; partial historical totals are never presented as complete. Raw retention is paused only while an initialized import is unfinished. Existing navigation reports remain available during preparation.

Lifetime totals retain genuinely available legacy page/WingMatch records and subsequent production records. Records already deleted by the old 90-day policy cannot be reconstructed. Legacy rows did not identify a hosting origin; that historical limitation must be retained. Newly received preview/legacy-origin events are excluded from the new production impact aggregates, while the original raw navigation report remains intact. New mission and survey measurements begin with this feature's instrumentation; historical mission starts are not inferred.

Raw events and temporary deduplication IDs are cleaned after 90 days. Written testimonials and quote flags are removed during retention cleanup after one year. Cleanup runs with feedback/report activity and raw-event retention; it is not a paid scheduled job or a hard TTL while the service is idle. Anonymized numeric responses and cumulative daily totals can remain for lifetime reporting. Removing raw events cannot decrease those totals. Existing free-plan capacity limits still apply; no paid service is enabled.

## Feedback safety and owner access

Submission uses `/api/impact/surveys`, the existing anonymous signed visit capability and the active `DB`. The API validates exact field names, rating ranges, questionnaire version, explicit feedback permission and a separate boolean quote permission. It limits body/text size and rejects common contact details/links; free text can still identify someone, so the UI asks users not to include personal details and asks the owner to review quotes before sharing. No name, school, email, academic score, quiz answer or project reflection is requested or copied automatically.

The same submission ID is used on retry. A confirmed duplicate is acknowledged without a second row; a changed retry cannot falsely claim to have updated existing quote permission. Another response in the same session is rejected. Failure or timeout never sets a successful-submission marker. Development/preview clients cannot submit to production.

`GET /api/impact/report`, `/api/impact/export` and the initialization endpoint check the existing server-side owner identity. Anonymous/non-owner requests are denied, private responses are no-store, and private endpoints do not provide cross-origin read access. No owner identity or signing secret is placed in the frontend.

The dashboard preserves the previous navigation features. Its aggregate CSV contains statistics and methodology but no session identifiers or testimonial text. Streamed response-row CSV exports are owner-only and omit session IDs. A private feedback CSV is explicitly labelled private; shareable print/PDF output includes no testimonial unless the owner opts to include quotes that separately have permission. Printable text is React-escaped; CSV cells guard against spreadsheet formula injection. Default private feedback inspection is limited to the latest 100 written responses, while the protected streamed export includes all rows in the chosen period in 500-row pages.

## Preview and checks

`npm run build:impact-preview` produces a single self-contained HTML file using the actual dashboard, survey and print components. It is explicitly marked **DEMO FIXTURES — NOT REAL USAGE OR IMPACT**. The preview has no live API, tracking or submission connection. Demo CSV/print output is also marked. It includes populated/empty dashboard views, chart controls, accessible tables, private versus quote-permitted text, CSV downloads and a simulated survey receipt.

The new `test:impact` runs actual SQLite schema/trigger/report queries, bounded import/resume/race/idempotency cases, mission deduplication, conversion attribution, input/permission validation, owner access, retention, private-quote policy and CSV safety. `test:cloudflare` checks the exact module snippet, production gates, one script across repeated initialization/hash changes, DNT/GPC and opt-out, post-load transport blocking, cross-tab preference invalidation, unaffected app requests and preview exclusion. `test:impact-preview` checks the standalone artifact's embedded CSS/JS, module syntax, demo marking and migration policy.

Run `npm run verify:release` for the full existing and new test/build suite. The two unchanged pre-existing content/audit advisories remain explicit; new checks are required and new failures are not waived.

The [Sites skill](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) says, “If `cua_repl.js` is unavailable, skip browser QA”. That tool is unavailable in this session, so no browser server/control workaround was used. The self-contained preview is supplied for owner interaction/review, and browser behavior or live Cloudflare receipt is not falsely claimed as verified.

## Approval and rollout order

1. Review the offline preview, code/SQL diff, coverage definitions, permissions and test report. Obtain explicit approval before any commit, push, database change, backend release or frontend deployment.
2. After approval, sync again and commit the approved change. Deploy the corresponding source to the **existing** Sites project before pushing the frontend update to GitHub `main`; that push automatically triggers Pages and must not precede its new APIs.
3. Confirm the additive hosted migration and Worker release succeeded. Sign in to the owner analytics dashboard and prepare/continue historical reporting until ready. Verify old navigation reports and authorization still work; do not seed production with demo responses or fake events.
4. Push the approved source to `AlexJang14/altwing-production` and let the existing GitHub Actions workflow deploy. No DNS, proxy, custom-domain, old-repository, runtime-secret or paid-service changes are required.
5. Verify production assets, privacy/opt-out and existing progress, real hash navigation, all project/lab completion gates, optional feedback receipt/retry and owner reports. Verify an actual allowed Cloudflare browser visit/account receipt after deployment, and label verification/operator traffic accurately rather than treating it as evidence of student impact.
6. For rollback, revert the frontend commit and redeploy the previous saved backend version as approved. The additive tables can stay in place; do not reverse applied migrations or delete user data. Preserve accumulated counts and inspect state before any follow-up migration. The old deployment, database binding and secrets remain available throughout.
