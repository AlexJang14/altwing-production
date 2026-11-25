# Approved-release operator runbook

**Prepared only. No command in this runbook has published this candidate.** The current user approved design and requested a feature freeze, not production deployment. The final approval request is withheld until the mandatory gates in [FINAL-PRODUCTION-RELEASE.md](../FINAL-PRODUCTION-RELEASE.md) are satisfied.

## Release identity and safeguards

| Item | Reviewed value |
| --- | --- |
| Public site/repository | https://altwing.org / AlexJang14/altwing-production |
| Frontend baseline | `443f965f2c5f45b2199c24b0b5db800eb5fee60b`, GitHub main |
| Backend project | `appgprj_6ade62e44e9081919499f0bdeb1a7261` |
| Backend rollback version |11, `appgprj_6ade62e44e9081919499f0bdeb1a7261~appgver_a0757dc69edc819191ce14daf7b2c385` |
| Version11 source / deployment | `ca46e2305d8ad14ff2f627126dcea23af73a7b6b` / `appgdep_6af9f19bb0a081918a0d035e6a276554` (succeeded, archive available) |
| Runtime / audience baseline | Runtime revision5; public Site, access revision2. Keep them unchanged; server route authorization provides dashboard privacy. |
| DB / other binding | Existing `DB`; no R2 binding, replacement database or data transfer |
| Administrator/signing settings | Preserve the existing `ANALYTICS_ADMIN_EMAIL`, `ANALYTICS_ADDITIONAL_ADMIN_EMAILS`, `ANALYTICS_INGEST_SECRET`, and `ANALYTICS_ALLOWED_ORIGINS`; values stay server-only. |
| Pending migration | `drizzle/0002_research_assessment.sql`, SHA-256 `d32a63b5fbe73e76c7492d66a4380e8feb3c8267c570e1c677bb6ee800afda3d` |

The GitHub `origin` and existing `sites` Git remote use different hosts/histories. A push to GitHub main automatically deploys the frontend; a push to the Sites source remote is not that GitHub deployment. Reconcile each remote without force-pushing or overwriting newer work. Do not treat the source-review ZIP as a Sites deployment archive or invent a saved-version ID.

Keep DNS, nameservers, Cloudflare proxy/SSL/analytics configuration, Pages custom-domain configuration, Site ownership/audience and the old junjang06 repository unchanged. Do not purchase services. Keep secrets/private evidence out of Git, public artifacts and logs.

## 1. Mandatory preparation before requesting final approval

1. Record mascot rights evidence and manual acceptance results, resolve genuine failures, and fix the exact release source/preview identifiers. Accept old unchanged-case evidence only with explicit mapping to unchanged behavior; rerun changed interactions. Record design approval separately.
2. Establish a provider-supported recoverable database backup/recovery point and restore procedure with the existing authorized hosting owner/operator. Verify its coverage, timestamp, retention window, restore access and private reference. Code archives, reporting CSVs and bounded row pages do not qualify. If the existing Site exposes no supported backup/restore route, stop and resolve that capability with its owner/provider; do not add a production export endpoint or assume D1 is visible in the founder's domain-account dashboard.
3. Through supported authorized SQL/DB access, run the SELECT-only [PRE-MIGRATION-CHECKS.sql](PRE-MIGRATION-CHECKS.sql). Retain results privately with timestamp, schema and counts. Query results from a local test are not production evidence. The connected database viewer tools cannot execute arbitrary SQL or make a complete recoverable dump.
4. Require no conflicting pending object names, an understood applied-migration journal, and zero duplicate non-null `(session_id,major)` keys for existing Recommended Field Explored rows. The old ingest validator does not normally accept this new event, but that is not proof that the production table has no such rows. If an unexpected duplicate/schema object exists, stop; do not delete history, alter the frozen SQL or mark a migration applied without review.
5. Confirm the rollback archive is accessible. Check available free-tier capacity information if the provider exposes it; no capacity failure has been observed and absent optional quota metrics are not a new owner-evidence gate. Do not buy capacity. If an actual provider limit blocks deployment, stop and report that exact limit.
6. Request one final approval for the exact release source, backend migration/deployment, subsequent GitHub Actions frontend publication, and reviewed verification/rollback procedure. No approval question is appropriate while the mandatory evidence is still missing.

## 2. After final approval: fresh preflight

1. Fetch GitHub main and the existing Sites source again, compare against both reviewed baselines, and preserve local work. If upstream/runtime/audience/configuration changed, reconcile first and obtain review for material differences. Never reset newer work to a recorded old revision.
2. Confirm artifact/source/SQL hashes and all required evidence. Refresh the backup/recovery point, row/schema baseline and index-duplicate check near the actual migration; an expired restore point is not protection. Record live-traffic timing so later legitimate inserts or existing retention are not mistaken for migration changes.
3. Run `npm run verify:release` against the final source before any production migration. It must pass with zero unexpected failures. Do not rerun completed research/rights/opportunity source audits without a new concern or an actual freshness failure; never rewrite verification dates to satisfy CI.
4. Confirm the two accounts have kept their own credentials, the existing grants/configuration are untouched, and no test/preview data will be sent to production. Preserve current source/build/backup references privately.

## 3. Backend first: existing Sites source and publication

1. Use the supported Sites source workflow on the **same** project and source remote. Reuse its configured history; reconcile differences in a separate existing-source checkout if needed. Copy only the exact reviewed tree after that comparison, including the immutable old migrations and pending0002 SQL/journal. Do not push to GitHub main yet.
2. Obtain the existing project's source credential only when execution is approved. Keep it in memory/stdin. The source workflow owns commit/push/build/package and returns the verified pushed commit and deployment archive. Ensure no private automatic publish-on-push window is active; this public Site uses the explicit save/deploy flow. Do not change the Site audience to obtain a private-publish shortcut.
3. Build/package from that exact committed source, preserving `.openai/hosting.json`, the `DB` binding and all environment settings. Pass the helper's matching archive and commit to `sites.save_site_version`, retain the returned opaque version ID, then call the existing public-site `sites.deploy_site_version` operation. Omit tunnel/runtime/audience changes. A review ZIP is not an upload-ready Worker deployment archive.
4. **Sites applies pending hosted migrations before uploading the Worker**, per the [Sites storage instructions](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/references/storage.md). Do not separately execute the same CREATE statements by hand, rerun old applied migrations, or change a migration snapshot/journal to hide uncertainty.
5. Pending0002 adds4 tables,6 indexes and3 triggers. Existing8 tables remain. New tables: `impact_assessments`, `impact_assessment_activity`, `impact_behavior_activity`, `impact_behavior_daily`. The unique `analytics_recommended_field_once` index is on existing `analytics_events`; the other new indexes are on new tables. The capture/rollup triggers observe subsequent real events, not an invented historical detailed split.
6. Poll only the actual returned deployment ID to a terminal result. Record source commit, saved version, deployment ID and runtime revision. A source push/build alone does not prove deployment. If deployment fails, inspect whether schema was applied before retrying; a failed Worker upload may leave tables/indexes/triggers present. Do not wipe the DB, drop tables or blindly replay CREATE statements.
7. Before frontend publication, run the backend access checks in the post-deployment plan with the two actual accounts and anonymous/unlisted visitors. Verify known historical records and legacy feedback remain accessible and compare schema/baseline evidence. If private-data denial, either real administrator, existing-data compatibility or migration integrity fails, stop frontend publication and follow the reviewed recovery/rollback decision.

## 4. Frontend: AlexJang14 GitHub Actions

1. Commit the exact approved complete editable source to the production repository with normal history and a GitHub noreply author identity. Backend and GitHub commits may have different parents/SHAs; their reviewed application-source content must agree. No force-push, unrelated repository overwrite or old-repository change.
2. After the backend gate succeeds, fast-forward/merge the approved source to **AlexJang14/altwing-production main**. This push starts `.github/workflows/pages.yml`; do not trigger an additional unrelated deployment.
3. Wait for validation, build and deploy jobs to succeed. The existing workflow reads the configured Pages base, builds the static frontend, uploads it and deploys with GitHub's existing short-lived token/OIDC. Preserve its `altwing.org` custom-domain root, CNAME policy, canonical/social metadata and `.nojekyll` handling. Do not change Pages settings, DNS or Cloudflare configuration.
4. Record the exact GitHub commit, workflow/run/deployment URLs and published artifact identity. If validation or deployment fails, report the actual failure; keep the previous public deployment and do not bypass tests.
5. Confirm https://altwing.org serves the approved assets/features, then execute the remaining post-deployment checks. Keep the final status partial until real data-reception/administrator checks are evidenced; do not equate workflow success with full product verification.

## 5. Data and historical reporting

No existing response is rewritten into a different questionnaire version. Preserve `impact_surveys` legacy/v1 and `impact_assessments` v2/v3, quote permissions, source labels, history, cohort definitions and browser storage keys. Counts from different versions, visits and respondents are not pooled into verified-student claims.

After the approved release, an authorized administrator may use the existing **Prepare / continue historical reporting** action until ready if still needed. It is a resumable write; do not invoke it during this preparation. Record coverage/cursor/ready evidence and compare retained totals, without claiming to recover already deleted raw history or create historical project/lab splits. No synthetic student testimonial or mission event is inserted for a production PASS.

## 6. Rollback and stop conditions

- Stop publication for unauthorized private content, either actual administrator denied, historical-data/progress loss, migration inconsistency, broken anonymous feedback or a material regression. Keep private evidence and the failed deployment ID.
- A frontend-only rollback uses a normal revert of the release commit on GitHub main and the existing Actions workflow. Recheck altwing.org. The new backend accepts old clients, so retain it when safe; a backend rollback is not automatically required.
- If the Worker must be restored, deploy saved backend version11 through the existing project using its known archive/version ID. Preserve the **current reviewed** environment and both grants; restoring code does not automatically restore runtime revision5 or any database snapshot. Stop for unexpected runtime drift rather than resetting secrets.
- Leave all new tables, responses, quote flags, counts and triggers intact. Rollback does not reverse applied SQL. New capture/rollup triggers can remain active with old code; disabling a specific trigger requires separately reviewed SQL and is not a default deletion/reset.
- Version11 lacks the new v2/v3 APIs. Roll back the frontend as needed; cached new clients may need a reload. Existing v2/v3 submissions remain stored for a forward fix even if the old dashboard cannot display them. Never clear student storage or downgrade saved progress to resolve a deployment failure.
- A full database restore is an exceptional recovery operation, **not** the default code rollback. It can overwrite genuine responses received after the restore point. Preserve/reconcile newer data and obtain explicit recovery approval; do not trade away new feedback/history silently.
- Preserve failed and previous release records for investigation. Do not force-push, drop/recreate the database, reverse migrations, remove the additional administrator, move domains, or purchase replacement infrastructure.
