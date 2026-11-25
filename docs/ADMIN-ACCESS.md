# AltWing administrator access

Only the two existing authorized administrator accounts may read analytics, impact reports, student feedback, Impact Stories, historical reporting and exports. Student pages and anonymous feedback remain public. The administrator list stays server-only; ChatGPT sign-in by itself never grants reporting access.

The reviewed, undeployed private-entry update is documented in [PRIVATE-ANALYTICS.md](PRIVATE-ANALYTICS.md). It preserves the existing owner, additional administrator, database and runtime secrets. No credentials or personal administrator emails belong in this repository, browser bundles, logs or exported reports.

## Current production versus approval candidate

Current production (backend saved version11, runtime revision5) still uses the existing `/#/analytics` bookmark. No production setting or deployment has changed.

After this update is explicitly approved and deployed:

- Dashboard: `https://altwing-engineering-pathways.theanna.chatgpt.site/admin`
- Deliberate login: `https://altwing-engineering-pathways.theanna.chatgpt.site/admin/login`

Bookmark the private login. Each administrator uses their own **Sign in with ChatGPT** account in a normal top-level tab. An unauthorized dashboard request receives generic404 rather than automatic login. The login page offers explicit sign-in/account switching; it never authorizes an unlisted account. Old hash bookmarks show Access Denied; students see no dashboard link.

## Server-only grants and checks

`ANALYTICS_ADMIN_EMAIL` retains the original owner. `ANALYTICS_ADDITIONAL_ADMIN_EMAILS` is the existing JSON-array secret for the one additional account. Exact normalized matching, verified Site identity and both ID/email are required. Duplicate entries/owner references do not add accounts. An unexpected third distinct grant fails closed for additional accounts; valid original-owner access survives bad optional configuration. Do not edit these production values for this update.

The Worker gates protected rendering before the framework; /admin rechecks on the server; every private API also rechecks before any DB read, cleanup or preparation. Private responses are non-cacheable and non-indexable. Public ingest endpoints retain consent, signed-visit, origin and validation controls.

## Validation and operations

Run `npm run test:admin-access`, `npm run test:research-assessment` and `npm run verify:release`. These use synthetic identities and isolated data, not actual administrator sessions. The full suite includes existing progression, analytics privacy and production builds. Technical passes are separate from real-account/browser verification and final release approval.

After approval, deploy the backend first with unchanged Site audience/bindings/secrets, then the matching Pages frontend. Independently verify both real accounts, generic404/401/403 denial, reports/history/exports and genuine anonymous feedback receipt. Historical preparation, if still needed, is an authenticated, resumable write and must not be invoked during this no-production-change phase.

Rollback retains backend version11, runtime revision5, both grants and all records. Use approved ordinary Git revert/Actions and backend restoration. Do not remove the additional grant, fall back to an owner-only historical release, change Site ownership or reverse/drop the database.
