# AltWing production ownership and deployment

This is the current deployment guide. It supersedes the original Porkbun / `junjang06` custom-domain plan in `docs/migration/ALTWING-ORG.md`.

## Repositories and ownership

- Complete editable source and production deployment: **[AlexJang14/altwing-production](https://github.com/AlexJang14/altwing-production)**, branch `main`.
- Initial independent Pages address: **https://alexjang14.github.io/altwing-production/**.
- Intended canonical address: **https://altwing.org/**.
- Existing production stays available at **https://junjang06.github.io/altwing/**. Its repository, Pages settings and files are not changed by this migration. A new repository does not automatically redirect the old owner's URL.
- `AlexJang14/Altwing` (August 16 snapshot) and `AlexJang14/altwing-v2` (October 2 snapshot) are earlier variants. They are not overwritten. The complete current source comes from the existing Sites project; its unmodified static build matches all 29 deployed application files in `junjang06/altwing` at `ffc5ccf9eb6ae23d722fdf36ab204a9c9c8d363c`. The deployed `.nojekyll` file is additional hosting metadata, not a feature difference.

## Update the application independently

Clone this repository, use Node >=22.13, and install dependencies from `package-lock.json`:

```sh
git clone https://github.com/AlexJang14/altwing-production.git
cd altwing-production
npm ci
npm run dev
```

Use a branch and pull request for changes. A push to `main` starts **Test and deploy AltWing** (`.github/workflows/pages.yml`). It runs validation, builds the correct Pages base for the repository's configured address, uploads the static frontend, and deploys using GitHub's short-lived `GITHUB_TOKEN`/OIDC. No personal access token, Cloudflare API key, backend signing secret or analytics-admin identity is needed in the frontend workflow. Pull requests validate without deploying.

Set **repository Settings → Pages → Build and deployment → Source = GitHub Actions**. If the connected integration cannot manage that setting, the account owner must enable it once in GitHub. The workflow does not alter the old repository.

Until a custom domain is configured, Actions builds the `/altwing-production/` preview with no custom-domain CNAME and `noindex`. When Pages is configured for `altwing.org`, it builds `/` with canonical/social metadata for the custom domain. Unexpected base paths fail rather than publishing broken asset URLs. After changing the Pages custom-domain setting, manually run **Actions → Test and deploy AltWing → Run workflow** to rebuild the same source for its new base.

Build commands:

| Command | Output / purpose |
| --- | --- |
| `npm run build:pages:preview` | `pages-preview/`: AlexJang14 GitHub address |
| `npm run build:pages` | `pages-dist/`: custom-domain root |
| `npm run build:pages:legacy` | `pages-legacy/`: old `/altwing/` address, if the old owner ever chooses to update it |
| `npm run build` | Existing authenticated Worker backend build; **not** the Pages frontend artifact |
| `npm run verify:release` | Run all checks, block unexpected failures and report exact pre-existing advisories |
| `npm run verify:migration` | Strict check runner: nonzero if any check fails, including an existing advisory |
| `npm run security:source -- --history` | Common credential-pattern scan of tracked/current files and Git history; findings print names only |

After deployment, `python3 scripts/check-live-site.py --target preview` checks every published static file against its local build, the old website's availability and exact production CORS/private-report behavior without submitting events. Use `--target custom` after domain activation. `--skip-cors` is only for checking frontend readiness before the backend environment revision is applied; full acceptance includes CORS. Results explicitly distinguish these HTTP checks from browser interaction QA.

## Validation and existing advisories

The full suite includes source security, project/mission/progression tests, all existing routes, analytics and real SQLite queries, transfer/restore failure handling, release-policy rejection tests, lint, TypeScript, both ranking-balance checks, backend build, three Pages build variants, bundle asset graphs and the original-origin recovery exporter.

The two previously acknowledged checks have been resolved in the local release-readiness source: all42 listings were actually checked against official organizer sources, and the obsolete label audit now tests the existing reward transactions and real rendered states. The original fingerprints/failure descriptions remain in `deployment/retired-advisories.json`. Active `deployment/existing-advisories.json` has no failure allowances, so any failed/missing/unexpected check blocks. Source-check dates are tied to evidence/record hashes; they do not assert that unannounced future-cycle facts are known. See `docs/release-readiness/DEPLOYMENT-CHECKLIST.md` for the independent rights/manual gates. These local fixes are not yet production changes.

## Backend, authentication and analytics

GitHub Pages serves static files. The existing backend remains **https://altwing-engineering-pathways.theanna.chatgpt.site**, using the existing Sites project and D1 binding in `.openai/hosting.json`. The current connected Sites account has the owner role. The complete backend source is included here, but pushing to GitHub deploys the frontend only; backend releases remain a separate Sites operation.

The analytics dashboard continues to use its existing Sign in with ChatGPT protection on that backend. No auth token, session cookie, database credential or signing secret is copied into JavaScript or repository configuration. Existing analytics history stays in the same D1 database. `ANALYTICS_ADMIN_EMAIL`, the optional `ANALYTICS_ADDITIONAL_ADMIN_EMAILS` allowlist, and `ANALYTICS_INGEST_SECRET` remain server-side. See [administrator access](ADMIN-ACCESS.md) for configuration, validation and rollback; an additional administrator does not receive Site ownership or infrastructure privileges.

The only required runtime configuration change is to merge these exact origins into `ANALYTICS_ALLOWED_ORIGINS`:

```text
https://junjang06.github.io,https://alexjang14.github.io,https://altwing.org,https://www.altwing.org
```

Retain additional existing entries if any. The path is not part of an origin, and browser hostname origins are lowercase. Apply an updated environment revision by redeploying the existing saved backend version, without changing its source, audience or database. New origins may submit anonymous events; private reports must remain inaccessible cross-origin. The old origin remains allowed so its analytics continues to work. The delivery's live verification evidence records whether these checks have actually completed; do not infer an applied runtime change from the example JSON.

## Cloudflare DNS: exact records

Use **Cloudflare dashboard → altwing.org → DNS → Records**. Keep Cloudflare Registrar's assigned nameservers. A newly registered domain can take time to appear in public DNS; check the zone is Active if queries still return NXDOMAIN. No Porkbun configuration is needed.

After the independent Pages site has passed its checks, verify the domain under **AlexJang14 account Settings → Pages → Add a domain**, using GitHub's generated TXT challenge. The expected TXT Name is `_github-pages-challenge-AlexJang14`; use the exact Name and unique value GitHub displays, and keep that record. The challenge value cannot be invented or derived from the repository name.

Configure the repository's Pages custom domain as `altwing.org` before pointing traffic to it, then enter:

| Type | Name | Content | Proxy status | TTL |
| --- | --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | **DNS only** (gray cloud) | Auto |
| A | `@` | `185.199.109.153` | **DNS only** (gray cloud) | Auto |
| A | `@` | `185.199.110.153` | **DNS only** (gray cloud) | Auto |
| A | `@` | `185.199.111.153` | **DNS only** (gray cloud) | Auto |
| CNAME | `www` | `alexjang14.github.io` | **DNS only** (gray cloud) | Auto |

The CNAME target is the **new owner's** hostname, with no `https://` or repository path. Replace only conflicting website/parking records at `@` and `www`; preserve email MX/TXT/DKIM/DMARC and the GitHub verification TXT. Leave proxying off during domain verification and GitHub certificate issuance, so validation sees GitHub's actual targets and HTTPS behavior is direct. No Cloudflare redirect rule or Flexible SSL mode is required for this DNS-only configuration.

IPv6 is optional. To enable it, add four DNS-only AAAA records at `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`, TTL Auto. Otherwise remove only stale website AAAA records pointing elsewhere.

Sources: [GitHub custom-domain targets and setup order](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Cloudflare record management](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/), [Cloudflare proxy status](https://developers.cloudflare.com/dns/proxy-status/).

## Safe activation and verification

1. Push the reviewed source to the **new** repository and enable GitHub Actions as its Pages source. Wait for the workflow, check the independent GitHub URL, all asset/module requests and the owner-dashboard destination. Keep the old deployment unchanged.
2. Ensure new-origin analytics preflights work and the old origin is still allowed. Test that unauthenticated/private cross-origin report requests remain denied. Do not copy private analytics records into a frontend artifact.
3. Complete browser acceptance of WingMatch, all three project workspaces, all six aerospace labs, mission/evidence saves, My Universe/pack rewards, saved colleges/programs, privacy, transfer downloads/imports, reload and Back/Forward. HTTP/asset checks and automated model tests do not replace actual interaction/visual QA. If browser tools are unavailable, record that limit explicitly.
4. Back up progress in the original browser before switching. Verify the domain's TXT, set **this new repository's** custom domain to `altwing.org`, rerun its Pages workflow and then add the Cloudflare records above. Avoid using the old repository's custom-domain setting: that would move or redirect the deployment the user asked to keep available.
5. Wait for DNS and GitHub's certificate, enable **Enforce HTTPS**, then verify the apex and www, canonical URL, favicon, brand image, sitemap, privacy page and all assets. Certificate/DNS propagation can take up to 24 hours. Confirm `www` redirects to the apex without loops. The app homepage omits `/#/`; existing feature hash links remain supported.
6. Recheck the old URL still returns its original app. Do not delete, redirect, disable or transfer the old repository as part of these steps. Redirecting that URL later requires its owner/admin and a separate coordinated action.

## Progress preservation and recovery

This release has no student cloud accounts: profiles, matches, saved plans, project records, missions and collections belong to the browser origin. Changing to either the AlexJang14 Pages origin or `altwing.org` does not make the old origin's storage visible. Export/import is required. A sign-in session is not a progress backup.

The new app has **Transfer saved progress** in its footer at `#/progress-transfer`. It exports allowlisted progress, includes its own in-memory fallback where available, previews an imported backup, keeps overlapping destination data by default and backs up current data before explicit replacement. It excludes authentication and anonymous analytics identifiers. Keep downloaded files private and retain the original until a saved project and My Universe have been checked after restore.

For original-origin full export without changing the old deployment, run `npm run build:progress-bridge` and open `progress-bridge-dist/original-origin-export.bookmarklet.txt`. Create a browser bookmark, replace its URL with the entire one-line text, visit the original `https://junjang06.github.io/altwing/` in the original browser profile and click that bookmark. It runs a read-only, network-free export on the original origin and downloads the JSON accepted by the new app. It refuses to export on another origin and does not read session/authentication identifier values. Restore the private file through the new site's footer **Transfer saved progress** link. The bookmark source is included and tested; no remote script or browser extension is installed.

The package also includes a separate recovery page that can be hosted under `https://junjang06.github.io/altwing-progress-bridge/` without a custom domain if that account's owner chooses to publish it. AlexJang14 cannot make a different origin's page read old-origin localStorage automatically. The original app's existing project-export buttons remain available. Data cleared from the browser, closed private sessions or work held only in a closed old tab cannot be reconstructed by changing DNS. Browser execution of the exporter still needs the acceptance check described above when browser tools are unavailable.

## Rollback and future ownership

As long as the old website remains unchanged, failed setup of the independent repository/domain can be rolled back simply by continuing to use the old URL. Do not force-push either repository. To roll back a later new-source release, use `git revert` on its commit and let Actions deploy, or rerun a known-good workflow after confirming its base matches the current Pages setting. The original compiled deployment is retained in the earlier migration archive.

Back up any work created on the new domain before changing its hosting address again. Keep the old origin, new preview origin and domain data separate; imports do not automatically merge fields from competing project versions. Backend/D1 rollback is not part of this frontend move because they are not migrated.

## Pending private dashboard entry

The approved-for-review source now places analytics at the existing backend /admin server route, with deliberate login at /admin/login, removes the public footer link and denies the old public hash entry. These paths remain undeployed until final approval. See [PRIVATE-ANALYTICS.md](PRIVATE-ANALYTICS.md) for the exact URLs, authorization boundary, verification limits and data-preserving release/rollback steps. Both administrator secrets and Site audience remain unchanged; students and anonymous feedback stay public.
