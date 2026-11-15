# AltWing custom-domain migration

**Historical plan, superseded:** The domain was registered through Cloudflare and deployment is moving to AlexJang14's dedicated repository. Use [the current production guide](../PRODUCTION.md). Do not apply the Porkbun/old-owner cutover steps below to the new deployment. The following is retained as the earlier preparation record.

Status: prepared in `migration/altwing-org`; **not deployed**. No production repository, Pages setting, DNS record, backend environment variable, database, or Site deployment has been changed.

## Risks to resolve before production changes

- **Browser progress does not follow a domain change.** `https://junjang06.github.io` and `https://altwing.org` have separate localStorage. The transfer and recovery tools below preserve available saved data through a user-controlled file; they cannot silently move it between origins. Cleared data, private-browser data after closure, and unsaved work held only in an old tab cannot be recovered by DNS changes.
- **Cutover can interrupt the old address.** GitHub Pages starts redirecting the project address when the custom domain is activated. DNS currently returns NXDOMAIN for `altwing.org`; do not activate the custom domain before backups, domain verification and recovery-page preparation. Coordinate the Pages setting, root-path bundle and DNS in one maintenance window. Certificate issuance and propagation can cause a temporary outage; zero downtime is not guaranteed.
- **Current access cannot deploy the live GitHub repository.** The connected GitHub account has pull access but no push/admin access to `junjang06/altwing`. Publishing files requires write access; configuring Pages requires an administrator. No Porkbun account is connected. The DNS values below are for the domain owner to enter.
- **Release checks are not all green.** The full validation run passes 13/15 checks. The existing freshness gate rejects 42 program records last verified October 25, 2026. The historical source-marker audit also fails two checks described below. Dates and assertions have not been altered to manufacture a passing result.
- **Browser acceptance is outstanding.** The required managed Sites preview command timed out opening relay port 4173, and this session has no `cua_repl.js` browser tool. Automated logic and build checks passed; interactive simulation, mobile layout, download/import, Back/Forward and real redirect-fragment behavior still need browser acceptance before deployment.
- **Backend origin permissions need a coordinated update.** New-origin preflights are currently rejected. Merge the prepared allowlist before frontend cutover; retain existing secrets, authentication settings and database bindings.

## Confirmed application and hosting

| Item | Current / intended configuration |
| --- | --- |
| Public frontend today | `https://junjang06.github.io/altwing/` |
| Planned canonical frontend | `https://altwing.org/` |
| Public deployment repository | `junjang06/altwing`, branch `main`, root `/`, legacy Pages publishing |
| Current editable-source baseline | `b0f70714f1c8a53cb1c5821869ec4dfc77b21926` |
| Existing backend and owner dashboard | `https://altwing-engineering-pathways.theanna.chatgpt.site` |
| Existing Sites project | `appgprj_6ade62e44e9081919499f0bdeb1a7261`, published version 9 |
| Student accounts | This release stores student progress locally; it does not implement student cloud accounts or cloud progress sync |
| Owner authentication and data | Existing Sign in with ChatGPT and D1 remain on the original backend; no account migration or schema change |

The unmodified editable source rebuilt byte-for-byte to the 29 application files in the current static deployment. Other older AltWing repositories were not used as the source of this migration.

## Prepared changes

- Centralized frontend domain, legacy base and existing backend in `deployment/domain.mjs`.
- Custom-domain build uses `/` for assets and emits root `CNAME` containing `altwing.org` plus `.nojekyll`. The separate pre-cutover build uses `/altwing/` and deliberately has no `CNAME`.
- Loading-screen images, runtime images, JS/CSS modules, favicon and privacy links resolve under the selected deployment base. All existing lazy feature chunks remain present.
- Added absolute canonical, Open Graph and Twitter metadata using the existing penguin brand image; generated `robots.txt` and a sitemap containing actual static URLs. No invented hash-route sitemap entries. Existing visual design and simulations are retained.
- Added `#/progress-transfer` and a footer link for private full-progress export/import. Existing saved-data key names and payloads remain unchanged. Default restore keeps overlapping destination records; explicit replacement first downloads a backup. Quota failures trigger rollback; a browser that revokes storage access receives an explicit partial-restore warning.
- Preserved all existing deep links and legacy counselor links. Home-only hashes `#/`, `#/home` and `#` normalize to the clean homepage while preserving any real query string.
- Added migration, bundle and recovery tests plus a validation-only GitHub workflow. No workflow deploys production.
- Repaired the existing lint setup by pinning its missing React Refresh plugin, recognizing Next’s `metadata` export and fixing existing dashboard/legacy-facade lint errors without changing their layout or capabilities. Preserved all other lockfile package versions and platform markers.
- Repaired a pre-existing syntax error in the historical Python audit so its remaining failures are visible; its assertions were not weakened.

## Exact Porkbun DNS configuration

These values are for **GitHub Pages hosting of the frontend**, while retaining the existing backend. Do not also attach `altwing.org` to Sites or use Sites DNS targets for this rollout.

First confirm the domain is active and delegated to the authoritative DNS service you intend to edit. The public resolver currently returns NXDOMAIN, including for NS queries; that does not establish whether the domain is registered or why delegation is absent. If Porkbun is the authoritative provider, use **Domain Management → altwing.org → DNS**. Preserve mail and unrelated TXT/MX/DKIM/DMARC records. Remove only conflicting parking/forwarding/website A, AAAA, ALIAS or CNAME records at the apex and `www`.

| Type | Porkbun Host field | Answer / Value | TTL |
| --- | --- | --- | --- |
| A | **leave blank** | `185.199.108.153` | `600` |
| A | **leave blank** | `185.199.109.153` | `600` |
| A | **leave blank** | `185.199.110.153` | `600` |
| A | **leave blank** | `185.199.111.153` | `600` |
| CNAME | `www` | `junjang06.github.io` | `600` |

The apex means `altwing.org`; Porkbun uses a blank Host, not a literal `@`. The CNAME answer is a hostname only, with no scheme, path or `/altwing/`. Do not combine these records with an apex CNAME or parking ALIAS. Configure the Pages custom domain as **altwing.org**, so `www.altwing.org` redirects to the apex after both DNS records and HTTPS are ready. See [GitHub’s official targets and setup order](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) and [Porkbun’s Host-field instructions](https://kb.porkbun.com/article/231-how-to-add-dns-records-on-porkbun).

IPv6 is optional. If enabled, add all four **AAAA** records with blank Host and TTL `600`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. Otherwise remove stale website AAAA records that point elsewhere; IPv4-only deployment works with the A records above.

Before pointing website traffic, the `junjang06` account owner should verify the domain at **GitHub profile Settings → Pages → Add a domain**. GitHub supplies a unique TXT challenge. Its expected Porkbun Host is `_github-pages-challenge-junjang06`; use the exact Host and value displayed by GitHub. The value is account-generated and cannot be inferred here. Keep that TXT record after verification. [Official verification instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

## Progress and account preservation

1. Publish `altwing-progress-bridge.zip` to a **separate** repository such as `junjang06/altwing-progress-bridge`, with Pages from `main` / root. Do not set a custom domain or add `CNAME` to that repository. Confirm its actual URL is `https://junjang06.github.io/altwing-progress-bridge/` and that it does not redirect away from that origin.
2. Before cutover, optionally publish the **pre-cutover** bundle to the current frontend repository. It adds the transfer screen without activating the domain. Users can then visit `https://junjang06.github.io/altwing/#/progress-transfer` and download a backup. Verify that the file downloaded before closing the tab.
3. Users with an older already-open version and a storage-full notice should use its existing project-export buttons before refreshing or closing it. A different tab cannot recover that tab’s in-memory changes. Once the updated app is loaded, its transfer tool includes its own in-memory storage fallback.
4. After cutover, users restore at `https://altwing.org/#/progress-transfer`. The file includes allowlisted profiles, match results, saved opportunities/colleges, three starter-project drafts, lab evidence, mission progress, collections and privacy preferences, including recognized legacy progress keys. It excludes authentication tokens, analytics visit identifiers and sessionStorage.
5. Users who missed export can visit the separate original-origin recovery page in their **original browser profile**. It downloads persistent old-origin progress without uploading or modifying it. A recovery file served under the old `/altwing/` project would redirect to the new origin and therefore cannot recover that storage.
6. Test one known backup against My Universe, a saved project, WingMatch and lab evidence on the new origin. Keep the original file. Import keeps existing destination records unless the user explicitly chooses replacement; merging individual fields or two versions of a project is not automatic.

Backups contain private profile/reflection data. They are user downloads, not public repository content. The recovery page exports only on the exact old origin, has no analytics and a restrictive CSP blocking network requests. Its single-file script uses the same export allowlist as the app. It cannot restore data that was cleared or stored on a different origin/browser.

Existing owner accounts and analytics remain on the original backend. Anonymous visit identifiers appropriately restart on the new origin; do not copy them into user progress backups. Historical aggregate reports stay in the same D1 database. This migration does not add cloud student accounts or pretend local progress is already synced.

## Routing and the /#/ suffix

The root homepage can be `https://altwing.org/` now, and the prepared app removes a home-only `/#/` suffix using `history.replaceState`. Existing feature URLs such as `/#/projects?project=solar` and `/#/aerospace-build?wing=gnc` retain their working hashes and query values.

Removing every hash is a separate router/hosting change. Plain GitHub Pages does not supply a general SPA history fallback: directly opening or refreshing `/projects` would currently return 404. A custom `404.html` workaround still returns an error status and is a poor SEO solution. A future clean-path migration needs either generated real entrypoints for supported paths or hosting with a tested catch-all rewrite/SSR route, plus dual support for old hash links and Back/Forward tests. No such change was silently introduced during this domain migration.

Hash fragments do not reach the server. Social crawlers receive the shared app card; distinct route-specific cards and fully indexed route content need real server/static route pages. The new canonical metadata describes the shared application accurately.

## Rollout order

1. Resolve the failed validation gates and complete browser acceptance below. Obtain write/admin access to the actual frontend repository; do not deploy an older source variant or change repository owner to work around access.
2. Preserve the current frontend commit and DNS settings. `altwing-rollback-github-pages.zip` contains the original static deployment. Keep a local copy of both the source patch and user progress backups.
3. Publish and test the original-origin recovery bridge. Optionally publish the pre-cutover app and give returning users an export opportunity before activating redirects.
4. Verify the domain under the `junjang06` account using GitHub’s TXT challenge. Confirm Porkbun is authoritative and existing mail records are preserved.
5. Update **only** `ANALYTICS_ALLOWED_ORIGINS` in the existing Sites project’s production runtime variables, merging existing entries. The observed current value is `https://junjang06.github.io`; the prepared value is `https://junjang06.github.io,https://altwing.org,https://www.altwing.org` (`deployment/analytics-runtime.json`). Keep `ANALYTICS_INGEST_SECRET`, owner-auth settings and D1 bindings unchanged. Verify the OPTIONS preflight for both new origins, allowing only exact origins; reports must stay private.
6. During the cutover window, publish the **contents** of `altwing-org-pages.zip` to the root of `junjang06/altwing`, `main`, preserving repository administration/history. Ensure root `CNAME` is exactly `altwing.org`. The Pages setting must show custom domain `altwing.org`. GitHub recommends setting the custom domain before pointing DNS at Pages. Coordinate root-path assets and domain activation; do not leave the old-path bundle active behind the new domain.
7. Enter the Porkbun A/CNAME records above. Wait for public DNS and GitHub’s certificate issuance. Enable **Enforce HTTPS** when available; verify apex and www certificates. DNS/certificate readiness can take up to 24 hours.
8. Run `node scripts/check-domain-live.mjs --expect-migrated`, then complete actual browser redirect/deep-link acceptance. Do not claim the migration is finished on the basis of a DNS save alone.
9. Verify real social-preview fetches and submit the new sitemap in the owner’s search-console property. Existing caches/index rankings may take time to refresh. Keep the recovery bridge available and retain the verification TXT record.

## Verification evidence and commands

Use Node >=22.13 with dependencies installed from the lockfile. `npm run verify:migration` runs every listed check even when a prior check fails; it never deploys. Logs and machine-readable results are in `.sites-runtime/migration-validation/`. The delivery includes a snapshot in `VALIDATION.json` and the validation-log archive.

| Check | Latest result |
| --- | --- |
| Submission / routes / project models / evidence gates / 663 universities / 42 programs | PASS |
| Analytics / actual SQLite migrations / owner-only reports / exact old+new CORS / privacy | PASS |
| Progress backup/import / all six wings / conflicts / quota rollback / blocked storage / root normalization | PASS |
| TypeScript and ESLint | PASS |
| Engineering balance: all 65,536 response patterns | PASS |
| Historical WingMatch V5 balance: 729 paths | PASS |
| Backend production build | PASS |
| Root custom-domain and `/altwing/` pre-cutover production builds | PASS |
| Static bundle graph / brand assets / all lazy feature chunks / metadata / CNAME policy | PASS |
| Standalone recovery build and execution tests | PASS |
| Guidance freshness | FAIL: all 42 dates exceed 14 days; recheck official program facts before updating dates |
| Historical source-marker audit | FAIL: outdated `Cosmic Pack Vault` and `Honest leaderboard lock` text checks; existing functional progression/pack tests pass; audit needs review against the current release |
| Real browser acceptance | NOT COMPLETED: preview relay timeout and unavailable browser tool |
| Production redirect / DNS / new-origin CORS | NOT READY: old URL HTTP 200 with zero redirects; new domain NXDOMAIN; production preflights reject new origins |

The [Sites skill](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) explicitly says, “If `cua_repl.js` is unavailable, skip browser QA”. Its [managed preview instructions](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/references/preview/managed.md) also prohibit a separate server workaround. Browser tools are unavailable here. A `sites-preview start /workspace/altwing-editable` attempt additionally failed with `relay could not open browser port 4173: timed out waiting for relay readiness`. No separate browser-control workaround was used and no browser result is being inferred from a build.

Before deploying, browser acceptance must cover:

- Home, WingMatch, explorer, field guide, colleges, programs, projects, My Universe, sitemap, privacy and protected analytics entry; all three projects and the six aerospace wings.
- Existing mission/evidence completion, saved progress, project reload, pack reveal/deduplication and downloaded records. Verify one full backup on a separate test origin, conflicting imports and blocked-storage handling.
- Direct hash deep links, refresh and Back/Forward; root-hash cleanup; desktop/mobile presentation; original penguin image and other assets. Compare against the original design.
- Old root and deep project/wing links redirecting to the corresponding new-root hash path with no duplicated `/altwing/`, lost query fields or loops; `www` canonical redirect and valid HTTPS; recovery bridge staying on the old origin.

Useful commands:

```sh
npm run verify:migration
npm run check:domain
node scripts/check-domain-live.mjs --expect-migrated
```

The read-only live check uses curl for redirects/assets and OPTIONS for CORS. It does not create analytics events. Browser fragments are not observable in an HTTP-only server test.

## Rollback

Preserve data on **both** origins. Before reverting traffic, users who worked on the new domain should export from its transfer page; DNS rollback does not merge their new data into the old origin.

If the cutover fails, restore the previous DNS website records, remove the custom domain from the frontend repository’s Pages settings and remove its deployment `CNAME` in the same rollback window. Restore the original static bundle/commit (or the tested pre-cutover bundle) so `/altwing/` assets match the old project path again. Recheck the old URL and existing hash links. Leave the recovery bridge and verification TXT intact. The backend, owner authentication and D1 do not need rollback because no data migration or backend move is performed. Keeping the expanded exact-origin analytics allowlist is safe during recovery; restore the prior value if reverting it, without touching other variables.

After cutover begins, DNS caches and cached permanent redirects can delay rollback for some visitors. Revisit this runbook rather than deleting either origin’s browser data.
