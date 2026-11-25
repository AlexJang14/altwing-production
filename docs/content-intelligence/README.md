# AltWing public content intelligence

This is the unpublished final integration candidate. Its polished Golden Horizon
source and Live Intelligence foundation are combined locally; both original
candidates and all earlier evidence remain unchanged. No database,
feedback, student response, progress, administrator permission, domain or DNS
migration is involved. No workflow has been pushed or activated.

## Initial launch decision

The owner explicitly made the College Scorecard key optional for initial launch.
Its collector remains disabled; it does not block release. Only verified daily
and weekly updates are scheduled for activation after final explicit approval.
The monthly cron is not armed. The retained monthly manual mode is for later
opt-in verification, not a launch gate. Actual post-deployment daily/weekly runs
and a live source-freshness check are part of controlled launch acceptance.

## What is implemented, and what is not yet automated

The existing College and Opportunities components read a validated public JSON
overlay; existing saved IDs and eligibility/scoring logic are retained. The
initial snapshot contains 663 colleges, 42 opportunities, 14 engineering-major
records and 14 career-resource records. Importing them did **not** verify them.
Unknown facts remain null, original review dates remain historical, and imported
records never receive a “New this week” label.

The source registry retains 130 official-source entries spanning all 14 engineering
disciplines and all requested kinds: college, major, admissions, internship,
research, summer program, competition, scholarship, mentorship, career resource.
This is a coverage registry, **not a claim that all 130 sources are scraped or
that all 733 records are current**.

Three verified adapters are enabled. The existing Scorecard adapter is retained
but disabled until the free API key and a complete live refresh are verified.
None uses an application database connection:

| Source | Method | Actual automation scope |
| --- | --- | --- |
| College Scorecard | Official API, full pagination with a free API key | Institution name/location and selected historical tuition, ACT and admission-rate variables. Missing values stay null. Exact degree availability, current testing requirements and accreditation are not inferred. |
| NASA official aeronautics feed | RSS/Atom, robots checked, no feed bodies/images copied | The functioning feed was selected from NASA’s official RSS directory after general/news feeds returned HTML. Potential discoveries enter review. A feed match alone establishes neither high-school eligibility nor an open cycle. HTML, challenges and unsafe XML are rejected. |
| NASA STEM Gateway | Public page, robots checked, exact reviewed text rules | Name and organization only. Grade, citizenship, cost and dates remain qualified until separately sourced. |
| BLS engineering overview | Public page/robots, bounded change observation | Page health/change review only. No new salary, outlook or individual occupation facts are extracted automatically. |

All 126 unreviewed entries, including ABET program search and university/program
pages, have `enabled: false` and `manual_review_required`. No automated requests are made
to them until a maintainer documents a permitted collection method and reviews
its parser. No supported ABET bulk API or permission to scrape its application
has been established. Career/major educational prose remains unchanged; these
adapters do not automatically rewrite it or refresh the existing career salary
displays. Unknown access is not permission, and robots permission alone is not
a copyright license. This remaining adapter coverage is a real limitation.

## Files and prerequisites

- `content/intelligence/sources.json`: official hosts, permitted paths, access
  policy, cadence, adapter and field rules. Never put credentials in this file.
- `published.json`: one complete checksum-validated public snapshot.
- `record.schema.json`: editor schema; Python validation adds cross-field,
  evidence, identity, age/grade, cycle and privacy constraints.
- `health.json`: source/link outcomes bound to a snapshot. Link reachability
  never advances a field-verification date or clears a failed fact parser.
- `review-queue.json`: pending exact-payload reviews; no private feedback.
- `approved-reviews.json`: explicit approve/reject decisions for exact item
  hashes. The reviewer string is an audit label; GitHub repository permissions
  and reviewed PRs supply authorization, not this label alone.
- `history/<snapshot_id>.json`: previous complete public content versions.
- `scripts/content_intelligence/`: Python **3.12**, standard library only.
- Existing frontend/test setup: Node **22.13+**, `npm ci --no-audit --no-fund`.
  The workflow-structure checker uses the already locked ESLint `js-yaml`
  development dependency. There are no new runtime packages or paid AI calls.

Run from the repository root. A collection run only stages local candidate and
report files in the ignored `.sites-runtime/content-intelligence/run/` directory:

```bash
npm run test:content
npm run test:content:ui
npm run test:content:workflows
npm run content:validate
python3 -B scripts/content-intelligence.py run --mode all --demo-scorecard
```

Exit codes: **0** completed configured automated scope; **2** incomplete/probe
(the report/artifacts still exist); **1** invalid configuration or refused
operation. A real public probe is intentionally incomplete. Never interpret
exit 2 as a fully verified dataset. No API key is needed for the rate-limited
probe; scheduled full Scorecard collection requires the free key below.

The actual initial runs are retained separately under the working candidate's
`evidence/official-dry-run*/` directories, including failures. They are reports
from official sources, not synthetic success statistics. The earlier source
review remains valid historical evidence; its dates were not rolled forward.

## Scheduler and activation (only after explicit approval)

The workflow is `.github/workflows/content-intelligence.yml`. Relevant PRs run
Python/UI/configuration tests without collection or secrets. Do not merge this
separate automation work in a way that changes the main release before review.
Do not enable variables or production publishing without owner approval.

1. Review the branch diff, actual HTML preview, tests and source coverage limits.
   After the owner approves, merge/push through the existing repository process.
   A push to `main` itself deploys the frontend; that requires release approval.
2. Resolve the Scorecard configuration gate before claiming monthly college
   facts refresh is operational. Its selected prior API evidence is retained in
   two existing colleges, explicitly marked as selected fields; this does not
   constitute a complete API refresh. Obtain a free data.gov key via the official College Scorecard/API signup.
   Add it at **Repository Settings → Secrets and variables → Actions → Secrets**
   as `COLLEGE_SCORECARD_API_KEY`. Do not paste it into chat, JSON, `.env` in Git,
   an issue, a browser variable or a preview. This is the sole secret used by the
   public-content workflow; it does not receive Sites/backend secrets.
   Verify a complete keyed collection, its source-field accuracy and preserved
   IDs before setting this source’s `enabled` flag to true in a reviewed change.
   A disabled required monthly source reports BLOCKED, not a successful college
   refresh. Do not treat a metadata/probe response as full pagination evidence.
3. Run **Actions → AltWing public content intelligence → Run workflow** with
   `mode: all`, `dry_run: true`. Inspect the Job Summary and the
   `public-content-review` artifact. This does not publish content. Source
   failures, unsupported pages and review-only discoveries must remain visible.
4. After separate explicit scheduling/publishing approval, add repository
   variables `ALTWING_CONTENT_AUTOMATION_ENABLED=true` (scheduled collection)
   and `ALTWING_CONTENT_PUBLISH_ENABLED=true` (eligible facts/health publication).
   Both are absent/false by default. Manual runs default to `dry_run: true`;
   the publishing variable must also be true even for a non-dry manual run.
5. Enable GitHub Actions failure notifications for this workflow. Incomplete
   collections and stale previously machine-verified records produce a failed
   run with retained artifacts. Jobs have 20-minute limits; artifacts retain
   public results for 30 days. Previously unverified/imported entries are
   counted separately, not misrepresented as fresh or healthy data.

| Task | Local time / IANA timezone | Purpose |
| --- | --- | --- |
| Weekly | Monday **06:17 America/New_York** | Run weekly permitted sources; discover/recheck opportunities. |
| Daily | **05:37 America/New_York** | Recalculate confirmed deadline states; check approved source/application links. Manual-only source links are not fetched. |
| Optional monthly | **Not scheduled at initial launch** | Retained manual verification mode; collector remains disabled until later approved setup. |

GitHub's `schedule.timezone` keeps local time across daylight-saving changes.
Scheduled runs can be delayed by GitHub; exact wall-clock execution is not
promised. GitHub may disable schedules for inactive public repositories; monitor
Actions and re-enable if appropriate. These are GitHub schedules, not a new
Sites automation or hosting service.

**Deployment handoff:** a `GITHUB_TOKEN` push does not trigger ordinary downstream
push workflows. Therefore the publishing job returns its exact commit SHA and
explicitly calls the existing reusable `pages.yml`. Both validation and Pages
build check out that SHA. Existing tests precede the existing Pages deployment.
A failed Pages job leaves the previous deployed site active; inspect Actions
and rerun/roll back after review. This chain is locally validated; it has **not**
been executed in the production repository. Keep required branch protections;
if the bot cannot make a permitted fast-forward push, let it fail and review
via a PR rather than bypassing restrictions or force-pushing.

## Deterministic safety rules

- API pagination totals, identity, URLs, typed fields and checksum must validate.
  A partial, empty, inconsistent or failed run cannot replace published facts,
  even when someone supplies an approval hash. Health/review metadata may be
  published separately while leaving the facts snapshot byte-identical.
- At most **40** records with substantive factual changes and **15%** of the
  dataset can change automatically per run. Evidence-only rechecks do not count
  as changed facts. Larger batches require explicit whole-candidate review; the
  first complete Scorecard import may legitimately need that one-time review.
- New identities, eligibility, citizenship/residency, grades/age, cost/stipend,
  dates/cycles, application destinations, accreditation, admissions requirements
  and program changes enter review. Conflicting sources quarantine the record
  and preserve its previous version. Records are never automatically deleted.
- Field evidence includes the exact official URL, observed timestamp, extraction
  method and SHA-256 of the response. “Verified” applies to those specific fields;
  partially verified records retain qualifications for their other details.
- A previous-year deadline cannot be moved into a new cycle. A real cross-year
  deadline requires explicit matching source evidence for the date and cycle.
  No opening date or timezone is guessed. Date-only deadlines receive a
  conservative boundary; users must check the official application conditions.
- Expired records are archived, still available through “Include archived
  application cycles,” and retained for saved links. Unknown cycles say “Check
  current cycle”; “Next cycle pending” requires an explicit source statement.
- Allowlisted HTTPS, robots checks (including wildcards and redirects), reviewed
  access policies, rate limits (at least two seconds per host; longer published
  Crawl-delay honored), 180-request/1.5MB response budgets, and access-challenge
  rejection prevent bypass behavior. No cookies, student login or private APIs.
- A complete JSON replacement uses same-directory temporary files, fsync and
  atomic rename; a prior full snapshot is retained first. Facts, health and queue
  are deployed together from one Git commit. Interrupted local staging is not
  deployed: revalidate before retry. Concurrent main changes cause the normal
  push to fail rather than overwriting newer source.

## Maintaining sources and reviewing changes

Use the existing GitHub PR workflow as the compact management interface; no
public or private application dashboard was added.

- Read `report.md`, `report.json` and `review-queue.json` in the artifact. Review
  the official source directly; never treat the queue itself as evidence.
- For an exact existing-record change, add a decision to
  `approved-reviews.json` in a reviewed PR, then run a fresh dry collection.
  Example (replace every placeholder with real review evidence):

```json
{"item_hash":"<64-character item hash>","decision":"approve","reviewer":"AlexJang14","evidence_url":"<official HTTPS URL>","reviewed_at":"<actual ISO timestamp with timezone>"}
```

  Use `reject` to dismiss an exact pending item. Changed official content changes
  the hash and requires renewed review; observation time alone does not. If a
  pending item is from a source page without an approved parser, approving the
  item does not invent fields or enable collection.

- For a discovery/new record or manually checked official page, first use a
  fresh dry run from the latest published snapshot if the downloaded artifact
  predates an already-applied update. Do not hand-edit snapshot hashes to bypass
  stale-base protection. Then create a record
  conforming to `record.schema.json`. Keep unavailable fields null. Use
  `opportunity:<stable-slug>` / `college:<stable-slug>` and a matching `legacy_id`,
  supported disciplines, field evidence, true timestamps, history and lifecycle.
  Do not copy article descriptions or images. Grade-unknown records are excluded
  from grade-filtered recommendations, and unknown cost cannot pass a free/paid
  filter. Check duplicates against official application URL and confirmed cycle.
  Then stage the exact queued item:

```bash
python3 -B scripts/content-intelligence.py stage-review --run <artifact-directory> --record <reviewed-record.json> --item <exact-item-hash> --reviewer AlexJang14
```

  This creates a **separate human-reviewed candidate**, not an override that
  publishes a failed automated collection. Existing records remain intact.
  Copy the candidate hash returned by the command, inspect the new report and
  record, then apply it locally only after review:

```bash
python3 -B scripts/content-intelligence.py publish --run <review-directory> --approve-exact-snapshot <exact-candidate-sha256>
python3 -B scripts/content-intelligence.py validate
npm run typecheck
npm run test:submission
npm run build:pages
```

  Review and commit the public content diff through a normal GitHub PR. The
  existing deployment pipeline applies after approval. `publish` here writes
  local public files only; it is not a command to deploy the live site.

- To automate a registry entry currently in manual review: document the actual
  official API/feed/permitted method and source terms, allow only necessary
  hosts/paths, review exact source-specific extraction rules, add a representative
  public/synthetic parser fixture and failure test, then approve the config PR.
  Never scrape gated ABET searches, invent API access, copy protected descriptions
  or relabel a general engineering graduate share as a specific offered major.

## Failure handling and rollback

If collection fails, inspect its summary and retained artifacts. Do not replace
facts with an empty response or acknowledge invented success. A link failure is
not proof of a program's cancellation. Correct the parser/access issue or keep
it manual; rerun using a fresh base snapshot. A denied/bot-challenged source stays
blocked, without proxies, credential sharing or alternate identities.

For a content rollback, choose a previously reviewed hash from `history/`:

```bash
python3 -B scripts/content-intelligence.py rollback --snapshot <previous-snapshot-sha256>
npm run content:validate
npm run test:submission
npm run build:pages
```

This preserves the current public snapshot in history before restoring the prior
one, resets source health, and leaves the application database/progress entirely
alone. Inspect/reconcile pending review decisions after rollback. Review the Git
diff, then revert/commit and deploy through the existing workflow only with the
necessary approval. A public content rollback does not restore a private database.
Disable the publishing variable first if an investigation requires pausing future
content commits; do not edit DNS or the existing production backend.

## Cost and verification limits

Expected incremental cost: **$0** using the existing public repository's standard
GitHub-hosted Actions, GitHub Pages and free official API tier. API rate/terms and
Actions availability still apply; paid/larger runners or new services are not
authorized. The collector has a finite request budget and no AI SDK. Paid AI
configuration is rejected unless implementation and approval are revisited;
`enabled: false`, `spending_limit_usd: 0` are enforced.

No new backend table, SQL, storage binding, administrator credential, private
export, analytics response or feedback API is used. Production persistence and
survey/assessment behavior remain in the preserved application code. Actual
scheduled Actions execution and production Pages deployment are unverified and
intentionally not attempted. Node/jsdom execution tests are not desktop/mobile
browser screenshots, physical touch tests or screen-reader verification.

## Official references

- [GitHub workflow syntax: schedules/timezones](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule)
- [GitHub: triggering workflows and GITHUB_TOKEN restrictions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [College Scorecard data/API documentation](https://collegescorecard.ed.gov/data/api-documentation/)
- [NASA media usage guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/)
- [NASA STEM Gateway](https://www.nasa.gov/stem-content/nasa-stem-gateway/)
- [ABET: find accredited programs](https://www.abet.org/accreditation/find-programs/)
- [BLS engineering occupational resources](https://www.bls.gov/ooh/architecture-and-engineering/)
