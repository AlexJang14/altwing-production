# AltWing research-informed educational impact assessment

Current questionnaire version: **impact-v3**. Usability revision November 17, 2026 (America/New_York), from production revision `443f965f2c5f45b2199c24b0b5db800eb5fee60b`.

This document describes a locally implemented update awaiting preview review and production approval. No production schema, runtime configuration, records or deployment has been changed for this update.

## Purpose and research foundations

This is a custom, research-informed program reflection. It is **not a validated instrument**, an adaptation with transferred psychometric evidence, a test of engineering competence or an endorsed measure from any referenced organization. The founder reports that ChatGPT generated the five questions and reflection wording under their instructions and iterative feedback, informed by concepts rather than intentional copying or translation. The wording is not represented as exclusively human-authored. The earlier impact-v2 wording is retained exactly in `src/features/analytics/assessmentV2.ts`. The current impact-v3 wording simplifies the five questions and several response labels for middle and high school readers; the reflection prompt is unchanged. This is an editorial readability review, not cognitive-interview evidence or a validated reading-level result. The completed bounded AI-assisted public-source comparison inspected the earlier v2 items and accessible methods materials across all seven references; it found no distinctive copied item within that scope. The v3 revision introduces no additional source instrument; its wording changes are documented in [the usability review](release-readiness/ASSESSMENT-V3-USABILITY.md). See [the source/version/item-level review](release-readiness/QUESTIONNAIRE-SIMILARITY-REVIEW.md). Complete current CIS-S forms and current/later Activation revisions remain uninspected; neither universal originality nor independent human/legal clearance is claimed. No research license, endorsement or validation is transferred.

| Conceptual reference | Application and boundary |
| --- | --- |
| [PEAR Common Instrument Suite](https://www.pearinc.org/assessments) | Informs attention to distinct STEM attitudes, engagement and career awareness. This five-item assessment does not reproduce the CIS, its scales, scoring, norms or validation. |
| [STEM Learning Activation, Lawrence Hall of Science](https://activationlab.lawrencehallofscience.org/tools/) | Informs attention to interest and dispositions toward further STEM exploration, particularly Q4. One retrospective interest item cannot substitute for the activation instruments or their multiple constructs. |
| [OECD Teenage Career Readiness Indicators](https://www.oecd.org/en/publications/indicators-of-teenage-career-readiness_6a80e0cc-en.html) | Informs separation of thinking about possible futures, exploration and experience. Q3/Q5 are perceptions; actual field/project/lab actions are separate records. These observations do not establish future employment outcomes. |
| [NGSS HS-ETS1-3 Engineering Design](https://www.nextgenscience.org/pe/hs-ets1-3-engineering-design) | Informs Q2's attention to trade-offs in decisions. Recalled frequency is not a performance task, a scored design artifact or evidence that a learner meets an NGSS standard. |
| [McCowan, McIlveen, McLennan, Perera & Ciccarone (2023), Career Education and Development Framework for senior secondary students](https://doi.org/10.1177/10384162231164572) | Informs self-understanding, awareness of opportunities, decision-making, action and reflection in Q3/Q5 and stories. The article's multi-factor measurement work does not validate AltWing's custom items. |
| [Davies & Dart (2005), Most Significant Change guide](https://www.mande.co.uk/wp-content/uploads/2005/MSCGuide.htm) | Informs an optional account of a specific moment, why it mattered and what might change. AltWing is collecting MSC-informed reflections, not implementing MSC's full stakeholder selection, verification, feedback and learning process. |
| [Pew Research Center, Writing Survey Questions](https://www.pewresearch.org/writing-survey-questions/) | Informs clear wording, ordered response categories, visible uncertainty/not-applicable responses, no preselected choices and neutral invitations. Cognitive interviews and pilot evaluation are still needed. |

The conceptual connections above are the implementation's interpretation of the references. They do not imply institutional sponsorship, endorsement, instrument equivalence or validation of the custom assessment.

## Exact items and response categories

The source registry is `src/features/analytics/assessmentModel.ts`. Any future change to wording, categories, meaning or delivery protocol should receive a new questionnaire version and a comparability review.

1. **Opportunity Access:** “Before today, how many chances did you have to try an engineering activity like this one?” None; Once; Two or three times; Four or five times; More than five times; Not sure.
2. **Engineering Reasoning:** “How often did you think about the pros and cons of your options before making a choice?” Never; Rarely; Sometimes; Often; Almost always. Separate option: This doesn’t apply to me.
3. **Career Self-Discovery:** “How much did your choices help you learn what engineering work you might enjoy or dislike?” Not at all; A little; Some; Quite a bit; A lot. Separate option: This doesn’t apply to me.
4. **Independent Learning Motivation:** “Compared with before this activity, how interested are you in exploring engineering outside your schoolwork?” Much less interested; A little less interested; About the same; A little more interested; Much more interested. Separate option: This doesn’t apply to me.
5. **Action Readiness:** “How clear are you about one activity you could try next to explore engineering?” Not at all clear; A little clear; Fairly clear; Very clear; Completely clear. Separate option: This doesn’t apply to me.

Each question is preceded by “Think about the AltWing activity you just finished.” Student-facing dimension labels also use plain language. Q2 preserves the trade-off reasoning construct through “pros and cons”; it is still a self-report of frequency rather than a test of reasoning quality.

Q1's Not sure handles uncertain prior experience without treating uncertainty as no experience. It has no not-applicable category: comparable prior opportunity can be absent (None in v3, Never in v2) or uncertain. Q2/Q3 may not fit a particular activity; Q4/Q5 may not fit a respondent's school/further-exploration situation. Their separate options are accepted as responses but excluded from applicable ordinal percentages. The categorical order is fixed; no radio response is preselected; the optional quotation checkbox is unchecked when it appears.

## Voluntary participation and delivery

After a newly completed WingMatch, results are saved and the existing reward award runs before the optional modal. A brief mascot celebration advances into the five questions. The accessible close control and Escape remain available throughout; submission is never required to see earned results or rewards. The tutorial remains available from the result buttons, rather than opening simultaneously with the assessment.

All five core items require a valid response **only if the user chooses to submit**. The assessment itself can be closed without answering. Not-applicable/uncertainty responses are not silently replaced or treated as favorable outcomes. The result-page invitation lets a visitor manually reopen an unfinished assessment. Project completion also offers a manual reflection with its own source label; no automatic project modal is added.

Automatic display occurs only for fresh WingMatch completion, once per questionnaire/browser context, with a 30-day browser cooldown after an automatic offer or submission. Dismissed/submitted instances do not automatically reopen on reload. Limited local metadata stores identifiers/status, not survey answers or story drafts. Storage restrictions, clearing storage, private sessions and other devices limit suppression; it is not cross-device identity tracking.

## Beyond the Flight

The optional story asks for a moment that stood out, what happened, why it mattered, and how, if at all, it changed thoughts about engineering or the future. The three optional prompts are BEFORE, THE MOMENT and WHAT COMES NEXT, using the owner's exact questions. No example answer or positive testimonial is offered. A neutral reminder expressly values negative experiences and no change.

The writing area displays a word and character counter, with a 500-whitespace-separated-word / 5000-character limit. Core submission does not require a story. In impact-v3, the explicit final **Submit responses** action records voluntary private-feedback permission after a visible notice: the five answers and any story are shared privately with authorized AltWing administrators. No additional mandatory checkbox is required. The notice makes the optional story, separate usage analytics and retained rewards explicit. Merely answering, opening or closing does not send responses. The backend still requires `feedback_permission:true`; only the final submission action supplies it. Public anonymous quotation remains an independent, unchecked permission, shown only for a nonblank story. Clearing the story clears and hides quotation permission. Five valid answers can be submitted with no story or quotation permission. A success message appears only after the submission is accepted; an error preserves the answers/story for retry. The standalone demo explicitly states that nothing is sent or stored. Contact details/common links are rejected, but free text can still identify someone; administrators must review permitted stories before sharing.

## Reporting rules and denominators

Each dimension is reported as a categorical distribution with its total response count, applicable/known count and excluded count. No overall effectiveness score is calculated. The implementation does not average the five answers or assign numerical scale means to these ordinal categories.

- Q1 first-time explorer percentage = no prior comparable opportunities (`never`: Never in v2, None in v3) / responses with known prior opportunities. Not sure is visible and excluded from that denominator. The result describes reported chances to try a comparable activity among respondents; it does not establish completed participation or population opportunity access/equity.
- Q2 describes recalled trade-off reasoning frequency; it does not measure the quality of reasoning.
- Q3 describes perceived discovery of work preferences, including work the respondent would not enjoy.
- Q4 describes retrospective self-reported interest change. It is not a prospective pre/post measurement, objective gain or evidence of lasting behavior change.
- Q5 describes clarity about one possible next activity; it does not establish that the activity was undertaken.

Response distributions/trends use **submission dates** in the selected UTC window. Offer-based response and behavior rates use **offer dates** for the same version/source cohorts, observed through report generation. A response or later outcome can occur after its offer-date window; the numerator stays attached to its own offer cohort. Monthly tables preserve these different date bases.

An offer cohort is one questionnaire/version/source record in an anonymous visit. A visit can contribute both WingMatch and project sources; combined offers are not unique visits or people. Distinct experience-source cohorts retain their own attribution rather than one source replacing the other. Global detailed behavior counts are a different dataset and must not be added to cohort counts.

Response rate = submitted assessments from recorded offers in the selected offer-date cohort / all those recorded offers. Partial/closed assessments remain in the denominator. Explicitly consented responses without a recorded offer, including tracking opt-outs or network gaps, are retained in the response distribution and reported separately; they do not inflate the offer-rate numerator. This is a **recorded-offer response rate**, not a response rate among every visitor or every completed WingMatch.

Completion rate = submitted assessments with a recorded start in the selected UTC start-date cohort / all recorded starts in that cohort. Both are observed through report generation. Submissions with no recorded start are excluded from this numerator. It is separate from the offer-date response rate and does not use every submission divided by starts.

## Behavioral outcomes

Automatic usage preferences, DNT/GPC and production gating apply to all telemetry. No answer or story text appears in automatic offer/start/close/behavior payloads. Recommended field exploration means opening a field guide for a locally recommended direction; the recommendation list and quiz answers/scores are not uploaded for this measurement.

Project starts are recorded workspace openings. Project completions require the existing evidence-saving action. Aerospace starts are lab workspace openings; Proof of Flight requires the existing evidence-complete save. No simulation value, written project reflection or score is copied into these events.

Conversion pairs a recorded start with a subsequent completion of the **same activity** in the **same offer cohort**. A completion of a different project/lab or an unpaired completion cannot enter the conversion numerator. Offer-cohort project/lab rates count starter cohorts and cohorts with at least one matching completion, rather than mixing all global completions with assessment respondents. Global detailed rates/rollups attribute conversions to the start's UTC date. Event delivery timestamps and telemetry loss can affect attribution.

Detailed global splits begin with this new instrumentation; old retained mission totals remain accessible in earlier reports and are not fabricated into historical field/project/lab splits. One anonymous visit/activity is deduplicated, including reloads. None of these events proves a unique individual, a physical engineering accomplishment or a causal educational effect.

## Versions, stories, exports and privacy

`impact-v1` and legacy records remain in `impact_surveys` and existing reports/exports. The assessment tables retain `impact-v2` with its original wording, response labels and separate-checkbox consent protocol. New clients submit `impact-v3`, with the plain-language wording and explicit-Submit protocol. Both versions remain accepted by the backend. The version/source controls, distributions, trends, private stories, raw/aggregate CSV and print output retain the selected version and corresponding exact wording/labels. No earlier row is relabelled or rewritten. The same categorical codes do not establish equivalent measurement properties; do not pool v2/v3 distributions or interpret changes across versions as impact. The global 30-day prompt cooldown is preserved; v3 session activity keys and attempt contexts are version-specific. No additional database migration is needed for the v3 revision. Earlier satisfaction, recommendation and paired-understanding measures are never pooled with the new five dimensions. Version/source counts remain visible for the response-date window.

The Impact Stories library is private to both authorized administrators. It supports UTC/source filters, quotation-permission filters and stable keyset pagination. There is no automated positive-story selection or sentiment filter. Aggregate CSV and default printable reports contain no unpermitted narrative text or session IDs. Protected exports stream all matching rows in 500-row pages. Private story CSV is clearly private; a separate quote export includes only independently permitted stories. CSV cells guard against spreadsheet formula execution; HTML/print stories are React-escaped.

Printable reports can optionally include up to the ten most recent separately permitted stories, with review requested. That is a presentation convenience, not representative sampling or the participatory selection process of full MSC. Negative/no-change stories are not filtered out. Synthetic preview exports are marked DEMO and never enter production statistics.

Temporary session links/deduplication identifiers are cleared after 90 days, while narrative text/quotation flags are cleared after one year during activity/report cleanup. Numeric responses, source/version metadata, anonymous cohort outcomes and daily aggregates may remain for historical reporting. There is no paid cron or promised hard TTL during inactivity. Saved student progress, existing backend bindings, administrator authentication and runtime secrets are preserved.

## Limitations and evaluation plan

Respondents are self-selected and not representative of all visitors. There is no verified student identity, probability sample, control group or randomized exposure. Question order, the post-celebration context, social desirability, novelty, recall, response shift, repeated respondents, missing telemetry and source/context differences can bias results. Optional stories have further selection and quotation-permission biases. A before/after claim cannot be inferred from Q4's retrospective answer or from cross-month response mixes.

Before stronger use, conduct age-appropriate cognitive interviews and a small usability pilot; check neutral comprehension of trade-offs and applicability, burden and drop-off; examine missingness and distributions; assess reliability/validity of any intended future multi-item constructs; and specify an appropriate independent evaluation design for causal or objective-learning claims. Record wording/protocol changes as new versions.

Use report wording such as: “Among the stated number of voluntary responses to AltWing's custom questionnaire during the stated period, responses were distributed as shown.” State the actual numerator, denominator, version/source and limitations. Never use demo fixtures as impact evidence or describe visits/cohorts as verified unique students.
