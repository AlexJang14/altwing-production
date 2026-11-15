# Built-in AltWing analytics

Open `/#/analytics` (Site analytics in the footer) and sign in with the ChatGPT account that owns this Sites project. Visitor statistics are collected on the same Site and stored in its provisioned D1 database. No Mixpanel account, API token, provider configuration, or tab-local inspector is required. The Site remains public; report access is checked server-side against its configured owner. Student pages do not require sign-in.

The dashboard provides today/7-day/30-day periods, visit sessions, page views, pages per session, navigation clicks, daily activity, most visited pages, common page transitions, learning milestones, WingMatch completion among sessions that started, last pages for inactive sessions, and aggregate report downloads. It refreshes every 30 seconds while visible. Calendar buckets use UTC as labelled. Sessions are anonymous tab visits, not identified people; they reset after 30 minutes of inactivity. A last page is not proof of abandonment.

Only explicit page navigation and learning milestones are recorded. Scores, grade/state, identifying fields, individual match answers/results, written work, search strings, raw URLs, form values, and simulation inputs/results are excluded. Browser DNT/GPC and the Privacy page opt-out disable collection. No third-party analytics SDK or replay. The compatibility PostHog facade is inert. Event history is not stored by the removed diagnostics page. Records older than 90 days are pruned as new traffic arrives.

## Server design

- `POST /api/analytics/session`: issues a one-hour signed capability scoped to an anonymous session. Same-origin JSON only, 256-byte limit. It creates no database record.
- `POST /api/analytics/events`: requires the scoped capability, validates and sanitizes explicit event names/properties, accepts at most 2 KB, writes with server time, deduplicates UUID event IDs, limits each session to 60 events/minute and 500/day, and never returns reports.
- `GET /api/analytics/report`: requires the authenticated Site owner's email and returns aggregates only, with private/no-store caching. Anonymous requests get 401, other authenticated users 403. No session IDs, emails, or individual timelines are returned.
- D1 binding `DB` and schema-only Drizzle migration are deployed with the Site. Data is not bundled in the release archive.
- Runtime secrets `ANALYTICS_ADMIN_EMAIL` and `ANALYTICS_INGEST_SECRET` are already configured in Sites. Values never belong in browser code or source archives. The owner identity comes from dispatch-owned ChatGPT sign-in; never trust a client-provided email.
- Local `.dev.vars` is ignored and uses the starter's loopback-only mock owner. Production builds do not include mock auth. Follow the supported Sites workflow for future deploys.

## Local commands

`npm run dev -- --hostname 127.0.0.1 --port 4180` runs the full site. Apply pending D1 migrations to `.wrangler/state` using the starter instructions. `npm run build` produces a Worker plus client assets, rather than a static-only ZIP. `npm start -- --port 4181` previews the built Worker. Use the Sites archive/source workflow to publish; a static file host alone cannot run these analytics APIs.

Validation: `npm run typecheck`, `npm run test:analytics`, `npm run test:submission`, and the supported Sites build. Analytics tests execute the real schema and SQL against SQLite and test owner authorization, payload sanitization, origin/size checks, signed capabilities, rate limits, retention and client privacy controls. Local browser review also confirms cross-tab aggregation through the actual D1 preview database. Test/preview traffic is separate from production.

## Resumed audit fixes

A failed session authorization now has a five-second backoff instead of suppressing the session for 55 minutes. Rejected event authorization refreshes on the next action. Changing the privacy choice clears previous-page context and discards pending events from before that change. Capability signatures require exactly three fields and an unexpired timestamp. Additional regression checks cover these cases. Live probes also confirmed anonymous/forged-identity report requests receive 401 and unsigned/cross-origin ingestion requests receive 403.
