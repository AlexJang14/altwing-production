# Assessment usability revision: impact-v3

Prepared November 17, 2026 (America/New_York). This is a scoped wording/submission change to the existing release candidate, not a production deployment. Earlier work is preserved. No feature, database migration, dependency, branding, account permission or backend binding is added or removed by this follow-up.

## Readability and measurement

All five student-facing stems use familiar words, shorter constructions and plain dimension labels. Each question is anchored by “Think about the AltWing activity you just finished.” The exact current registry is `src/features/analytics/assessmentModel.ts`. The exact earlier registry is archived without edits at `src/features/analytics/assessmentV2.ts`.

| Dimension | impact-v3 wording | Construct and changes |
| --- | --- | --- |
| Opportunity Access | Before today, how many chances did you have to try an engineering activity like this one? | “Chances” replaces “opportunities”; counts chances to try, not verified participation. None replaces Never; uncertainty stays separate. |
| Engineering Reasoning | How often did you think about the pros and cons of your options before making a choice? | User-requested exact stem. Pros/cons retains attention to benefits and costs/trade-offs before deciding, not performance quality. Frequency options unchanged; separate plain-language not-applicable option. |
| Career Self-Discovery | How much did your choices help you learn what engineering work you might enjoy or dislike? | Retains perceived discovery of preferences, including dislike. Some/A lot replace A moderate amount/A great deal. |
| Independent Learning Motivation | Compared with before this activity, how interested are you in exploring engineering outside your schoolwork? | Retains retrospective interest relative to the same experience and independent exploration. A little less/more replaces Somewhat less/more. |
| Action Readiness | How clear are you about one activity you could try next to explore engineering? | Retains clarity about a specific possible action, without asserting actual action. A little/Fairly clear replaces Slightly/Moderately clear. |

Q2–Q5 retain separate “This doesn’t apply to me” options. No responses are preselected. This is an editorial plain-language review for middle and high school readers, not a measured reading grade, student pilot, psychometric validation or guarantee of comprehension. Category codes remain compatible for storage; that does not prove equivalent measurement properties. Do not pool versions or infer improved outcomes from changed wording/labels.

The previously completed bounded public-source similarity review covers the exact archived impact-v2 wording. Its hash is retained and its source pointer now identifies that archive. No proprietary items or new source instruments were imported for this revision. The Beyond the Flight question and prompts remain unchanged. The prior review is not relabelled as a new copyright clearance for revised wording, and restricted/current-form gaps remain explicit.

## Submission and privacy

- Five valid core responses are required only when a visitor chooses to submit. The accessible close control, earned result and rewards remain available.
- The story is entirely optional. A blank or whitespace-only story shows no quotation checkbox. A nonblank story shows one unchecked optional quotation checkbox. Clearing the story clears quotation permission; re-entering text does not restore it.
- A visible notice beside **Submit responses** explains that the action voluntarily shares the five answers and any story privately with authorized AltWing administrators. It also states that the story is optional, usage analytics is separate, and results/rewards remain available. Submit is associated with this notice for assistive technology.
- The final explicit Submit action records `feedback_permission:true`; no separate mandatory checkbox is required by the existing application/backend requirements. The backend continues to reject missing/false permission. Opening, answering or closing does not submit responses. This implementation finding is not a legal opinion about every jurisdiction's consent rules.
- Public quotation still requires its own optional permission, never inferred from Submit. Analytics preferences, DNT/GPC and preview/development exclusions remain separate and unchanged.
- A pending request disables duplicate submissions. A successful real response shows **Your responses were saved.** only after the backend accepts it. Errors retain answers/story for retry. A standalone demo says nothing was sent or stored.

## Version and data safety

The server accepts both impact-v2 and impact-v3 in the existing assessment tables. Earlier v1/legacy validation and reports remain available. No existing record is changed, migrated to v3 or relabelled. No further schema change is needed: the pending CREATE-only research migration already has version fields and version-scoped uniqueness. New reports, story filters and CSV/print exports select one version and show its exact wording/labels and consent protocol. Global behavioral totals remain separately defined; they are not questionnaire-version-specific outcomes or pooled survey responses.

New v3 attempt contexts and active-session cohort keys are version-specific; older keys/records remain intact. The shared 30-day automatic-prompt cooldown is preserved. No student progress key, database binding, secret or authorization rule is changed.

## Verification and review

Regression checks use isolated SQLite, synthetic identities/data, actual request handlers, rendered React markup and a controlled component-state harness. They cover both versions, unchanged v2 rows, five required answers, blank/whitespace story, conditional unchecked quotation, explicit Submit payload, duplicate clicks, accepted/error receipts, opt-out separation, versioned reports/exports and authorization before data access. No synthetic test is sent to production.

The refreshed interactive preview includes the existing 38-case acceptance guide, assessment and synthetic report. D04–D07, A03 and P01 now cover the revised wording/consent/version behavior. Candidate-bound progress cannot silently inherit passes from a different build or plan. All unperformed manual cases remain UNVERIFIED. Browser keyboard/screen-reader/mobile and visual PDF checks still require the reviewer; no browser-control facility is available in this session.

Run `npm run verify:release` for the full suite. The review bundle includes the actual result log and source manifest. A passing automated suite does not resolve manual acceptance, original-mascot permission or production-only reception checks. No commit, push, migration or deployment is authorized by this document. Obtain final release approval after the existing pre-deployment gates are resolved.
