# Private analytics entry — approval candidate

Prepared November 17, 2026 (America/New_York). Production remains unchanged. This follow-up preserves the pending impact-v3 assessment work and addresses access control/login only. No new data collection, database migration, authentication provider, service, domain, DNS or Site ownership change is introduced.

## What inspection found

- Every existing navigation/impact report, private feedback/story read, export and historical preparation handler already calls the shared server-side authorization function before database access or cleanup. Ordinary signed-in ChatGPT users are not automatically administrators.
- The two administrator grants are held in server-only runtime settings. The existing Site is public (access revision2), backend saved version11, runtime revision5. Read-only inspection confirms both administrator settings are secrets; their values are masked and were not copied or changed. A Site's public audience is separate from the application's administrator allowlist.
- The public footer advertised the dashboard, and the Pages hash route automatically navigated to the backend's hash dashboard. Hash fragments never reach the server. API authorization protected private data, but the old dashboard entry itself was a public client-rendered shell.

## Proposed changes

1. Remove the public footer link. The old `#/analytics` route shows a generic Access Denied notice, without loading reports or navigating to login. The public Pages bundle no longer includes the actual dashboard implementation.
2. Render the existing dashboard at the backend's **/admin** server route. The Worker rejects blocked HTML/RSC/HEAD requests before the framework runs with a generic HTTP404 and no login redirect. The server page independently rechecks authorization before rendering. Every data handler retains its own authorization check.
3. Keep a deliberate, non-advertised login entry at **/admin/login**. Anonymous users can click the existing top-level **Sign in with ChatGPT** link; unlisted accounts can explicitly switch accounts. Only an already authorized account is redirected automatically to /admin. Sign-in establishes identity, not administrator membership.
4. Apply `private, no-store`, `Vary: Cookie`, `noindex, nofollow`, no-referrer and nosniff to the private entry/login/API responses; remove ETag/Last-Modified there. Private APIs return generic JSON401/403 without Location rather than redirecting. Unrecognized routes within the analytics/impact API namespaces fail closed by default.
5. Reuse the same two server-only secret grants, with an explicit maximum of the original owner plus one distinct additional account. Exact normalized matching remains required. A missing/malformed optional list or unexpected third account fails closed for additional grants while the original owner's valid grant stays intact. No administrator email is hardcoded or returned to the frontend.

The Worker uses identity headers verified by the existing Sites dispatch boundary; application routes must remain behind that boundary. Local fixtures supply synthetic headers only to isolated tests. This is not a new OAuth/session system, a bypass token, or a claim that a hidden path secures data. Private JavaScript assets may describe the interface, but contain no administrator list, private response data or secrets; data is authorized on every request.

## Public behavior retained

altwing.org, missions, simulations, results, rewards and saved browser progress remain public and unchanged. No Site-wide sign-in restriction is enabled. These existing anonymous write endpoints remain available with their original origin, consent, payload-validation, signed-visit and deduplication controls:

- POST/OPTIONS `/api/analytics/session`
- POST/OPTIONS `/api/analytics/events`
- POST/OPTIONS `/api/impact/surveys` (legacy, impact-v2 and impact-v3)
- POST/OPTIONS `/api/impact/assessment-events`

They do not expose any report, story or stored feedback. Tracking opt-outs and explicit-feedback consent stay independent. Invalid payloads and unsupported methods retain their existing rejection behavior.

## Independent login after approval/deployment

Proposed dashboard: **https://altwing-engineering-pathways.theanna.chatgpt.site/admin**

Proposed dedicated login/bookmark: **https://altwing-engineering-pathways.theanna.chatgpt.site/admin/login**

1. Open the dedicated login in a normal browser tab. These new paths are not live before deployment.
2. Each administrator selects **Sign in to view analytics** using their own authorized ChatGPT account. No shared password, cookies or identity token is required.
3. Successful authorization returns to /admin. Both accounts access the same existing database, history, feedback and exports.
4. A different account is denied. To deliberately change accounts, reopen /admin/login and choose **Switch account**, then sign in with the authorized account. The denied /admin page itself does not offer a login redirect.
5. Students continue to use altwing.org without signing in. Do not add the private login/dashboard to public navigation or the public sitemap.

Before this release, the existing production bookmark remains `https://altwing-engineering-pathways.theanna.chatgpt.site/#/analytics`. It is not silently replaced in production. After deployment, update the two private administrator bookmarks; legacy hash bookmarks become denial screens.

## Verification and limits

`npm run test:admin-access` exercises all private legacy/v2/v3 report/story/export handlers for both allowed identities and anonymous/unlisted identities, denial before database access, the Worker boundary before rendering, deliberate login and independent page guard, two-account limit, exact matching/revocation, non-cacheable responses, removed public links, and anonymous feedback storage through the actual public handler. Fixtures and database are isolated; no synthetic feedback is sent to production. `npm run test:research-assessment` retains v2/v3 and privacy coverage. The full `npm run verify:release` checks the entire existing application and all builds.

The updated offline preview's **Access states** tab demonstrates protected entry vs deliberate login. It is a simulation and cannot authenticate a real account. Actual browser sign-in/session expiry, both real account grants, gateway identity-header handling, production 404/API headers and live feedback collection require verification after an approved backend release. Secret values are masked, so this session cannot independently inspect the exact deployed allowlist contents or use either person's authenticated session. No successful live-login claim follows from server fixtures.

## Data safety, release and rollback

There is no schema or data rewrite for this privacy change. The existing pending CREATE-only research migration, historical records, DB binding, secrets, Site access policy and impact-v2/v3 version handling are preserved. Release this reviewed candidate only after final approval and existing release gates. Deploy the protected backend before the matching public frontend, verify both real accounts privately, then confirm anonymous/unlisted denial and genuine public feedback. No production write is authorized now.

Keep backend saved version11, runtime revision5 and the previous GitHub revision as rollback evidence. An approved rollback uses ordinary Git revert/Actions and backend version restoration with the same database and both administrator secrets; do not remove either grant, reverse/drop data, or migrate ownership. Earlier pending assessment release risks/gates remain documented separately; this privacy update does not claim to resolve those rights/manual-acceptance items.

## Latest local result

Full regression suite completed at 2026-11-18T03:42:20.253Z: **25/25 PASS**, zero advisory allowances or unexpected failures. The administrator suite checks150 actual endpoint cases and56 request-boundary cases plus the real Worker entry and independent server pages. The first full run found the existing framework metadata lint exception did not cover new page files; that narrow framework configuration was corrected and the full suite rerun. Prior lint evidence is retained in the review bundle. No manual/browser/live account case is marked passed.
