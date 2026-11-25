# Research assessment review and rollout

Status: implemented locally on `feature/research-impact-assessment`, based on production commit `443f965f2c5f45b2199c24b0b5db800eb5fee60b`. No commit, push, hosted migration, runtime change or production publication is authorized until the owner reviews the interactive preview and approves deployment.

**Final IP/QA review is NO-GO.** See [FINAL-REVIEW.md](FINAL-REVIEW.md) and [rights evidence](rights/RIGHTS-REVIEW.md). The specific original-mascot gap and required real browser/PDF acceptance remain pre-approval gates. Founder-scoped authorization for project materials is recorded without independently verifying others’ rights; no blanket contributor assignments are demanded merely from Git names. The bounded public-source item comparison is now complete; full restricted/current forms and universal originality remain unverified. The previously prepared preview includes public methodology, credits, Terms and a separately denominated assessment completion rate. The final phase adds no product features: it corrects official opportunity facts, the existing audit and release documentation; see release-readiness/DEPLOYMENT-CHECKLIST.md for25/25 current automated results and remaining gates. These supersede the earlier preview's readiness summary.

## Scope

- Five-question sequential modal, short post-result celebration, existing penguin mascot, optional Beyond the Flight story, explicit-Submit private feedback permission and separate optional quotation permission and repeat-prompt suppression.
- Separate dimension distributions, source/version tracking, submission-date trends and offer-date response rates, same-activity behavioral conversions, private Impact Stories library and CSV/print reports.
- Existing questionnaire rows, old reports/exports, anonymous ingestion and dual-administrator authorization remain available. Saved scores, models, projects, missions, rewards and browser storage keys are preserved.

The November 17 usability revision is documented in [ASSESSMENT-V3-USABILITY.md](release-readiness/ASSESSMENT-V3-USABILITY.md). All five questions use simpler wording. Earlier v2 records/wording remain separate from current v3 reports. Story and quotation are optional, and the explicit final Submit action accepts the visible private-sharing notice. No further schema change is needed for this revision.

## Migration and compatibility

`drizzle/0002_research_assessment.sql` contains schema-only CREATE statements: four new tables, indexes and event rollup triggers. It does not ALTER/DROP earlier tables, rewrite old values or backfill invented responses. Earlier applied migrations and snapshots remain unchanged. Generated Drizzle metadata records only the new migration.

Both `impact-v2` and the revised `impact-v3` submission paths are version-dispatched through the existing survey API. Cached/older `impact-v1` clients retain their old validation and 8 KB body limit. The v2/v3 request ceiling is 24 KB with a smaller explicit story limit; malformed, extra-field, unconsented or unsigned payloads are rejected. A saved response cannot be overwritten by a changed retry, including quotation permission. The new report does not require the older historical import to be ready; earlier reports retain their own preparation step.

New detailed behavior totals begin with instrumentation and are labelled separately from retained global mission history. No historical split, response, prior baseline or participant identity is inferred. Only existing free infrastructure and runtime bindings are used; current quota limits still apply.

## Isolated preview and checks

Run `npm run build:impact-preview` and open `.sites-runtime/impact-preview/index.html`. The standalone HTML embeds the existing mascot and actual React components. Assessment/Research report tabs show the proposed sequence, empty/date/source-filter states, cohort tables, permission-filtered story library, aggregate CSV and print output. All fixtures/exports are labelled DEMO; there is no production data, tracking, authentication or submission connection.

`npm run test:research-assessment` applies every migration statement to isolated in-memory SQLite and exercises real request handlers. It checks legacy preservation, both administrators/denial before DB access, strict five-item validation, not-sure/NA denominators, negative/no-change answers, optional story and quote permission, retries, retention, exact activity pairing, cross-date cohorts, detailed event dedup, source/version isolation, story pagination, >500-row exports, CSV defenses, local suppression and actual React markup.

`npm run test:cloudflare` also checks the new telemetry's production/privacy gates, ordered lifecycle events without answers/stories, opt-out-independent voluntary feedback and consent cancellation while authorization is pending. `npm run verify:release` requires this new research check along with every existing test/build, including both-role access, progress/models and all deployment bases. Known historical advisories stay explicit; new failures are not waived.

Browser control is unavailable in this session. The [Sites skill](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) says, “If `cua_repl.js` is unavailable, skip browser QA”. No browser/preview-server workaround is installed. Isolated React/handler tests and a functional offline HTML preview do not establish successful browser interaction, assistive-technology behavior, visual print pagination or live database reception. Those remain review/post-approval checks.

## Release after explicit approval

1. Fetch production again and reconcile any new work without overwriting it. Compare the approved source manifest, commit with a GitHub noreply identity, and retain the baseline below.
2. Push the exact reviewed source to the existing Sites repository using fast-forward history; package that source's Worker build and save a version in the existing project. Deploy it with the same Site audience, ownership, `DB` binding and environment revision. Do not change any administrator grant or server secret.
3. Confirm schema migration and backend release succeeded before pushing the frontend to GitHub `main`, which triggers the current Actions workflow. No DNS, domain, Cloudflare proxy, ownership or paid-service operation is part of this release.
4. Re-verify both real administrator accounts, private reports/stories/exports, anonymous/unlisted denial, old records and reports, new client privacy gates and response receipt/retry. Browser desktop/mobile/accessibility/visual PDF checks must already be complete on the reviewed preview before requesting approval; confirm the same behavior after release. Use isolated fixtures for synthetic data; do not seed fake production stories or outcomes.
5. Confirm deployment and Cloudflare installation/receipt without claiming new questionnaires are validated or inferring unique students/causal effects. Report actual verification limits.

## Rollback

Baseline frontend: `443f965f2c5f45b2199c24b0b5db800eb5fee60b`. Baseline backend: saved version **11**, ID `appgprj_6ade62e44e9081919499f0bdeb1a7261~appgver_a0757dc69edc819191ce14daf7b2c385`, with runtime environment revision **5** and both administrator grants.

After approval for a later rollback, use a normal Git revert and the existing Actions workflow; restore backend saved version **11** if necessary. Leave additive assessment tables, existing records and counts intact. Do not reverse applied SQL, drop tables, force-push, remove the additional administrator or change DNS/ownership. Cached new clients may need a reload after frontend/backend rollback; v1 remains accepted by the new server, while the prior server does not accept v2 submissions.
