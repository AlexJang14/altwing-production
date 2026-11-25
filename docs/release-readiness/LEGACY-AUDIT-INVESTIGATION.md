# Legacy pack and leaderboard audit investigation

Review date **November15,2026 America/New_York**; execution timestamps **2026-11-16 UTC** against local source based on production `443f965f2c5f45b2199c24b0b5db800eb5fee60b`. Read-only investigation and isolated in-memory test execution; no application code, audit policy, production deployment, database or account configuration changed by this investigation.

## Finding

Both failing expectations in `scripts/final-altwing-qa.py` are obsolete **source-text markers**, not observed failures of an implemented pack feature or an implemented account-protected leaderboard. The present audit incorrectly requires two strings in one component:

| Historical marker | Actual current implementation | Finding |
| --- | --- | --- |
| `Deep Space Packs` in `MyUniversePanel.tsx` | `MyUniversePanel` renders `CosmicPackVault` and `CosmicAtlas`; the visible section is titled **Packs & planet discoveries** and has Open packs / My planet collection tabs. | Pack functionality is present. A different title and component composition make this marker fail. Restoring the old title is unnecessary. |
| `VERIFIED ACCOUNTS REQUIRED` in the same file | No current leaderboard route, component, score-submission API, leaderboard table or user-facing account-verification claim was found in `src`, `app`, `lib`, `db` or `worker`. | There is no implemented leaderboard security boundary for this string to verify. A decorative lock label would not establish server authorization. Document that the current product does not offer a competitive leaderboard; do not add one in release-readiness work. |

Current career-field rankings and college matching are recommendations, not a student competition leaderboard. The separate administrator dashboard has real server authentication and is outside this obsolete leaderboard marker's purpose; existing administrator tests must stay intact.

## Runtime evidence

- `src/App.tsx:18` lazily imports `MyUniversePage`. The `route.view === 'universe'` branch at line56 renders it.
- `src/features/progression/MyUniversePage.tsx:73` renders `<MyUniversePanel />` alongside `PlanetShelf`, project progress and the saved-guidance vault.
- `src/features/progression/MyUniversePanel.tsx:2`–5 imports the collection model, pack model and both real child components. Its line13 composes the vault/atlas according to the selected tab. The visible explanatory text says collectibles are not a grade or measure of ability.
- `src/features/progression/CosmicPackVault.tsx:557` renders the real pack vault. Its empty state says `NO PACKS READY`, and its nonempty state offers pack-opening controls. The effect migrates eligible existing local progress into deduplicated rewards.
- `src/features/progression/cosmic-packs.ts` retains `altwing-cosmic-packs-v1` and `altwing-cosmic-atlas-v1`. `awardCosmicPackInternal` deduplicates by `sourceId`; `openCosmicPackInternal` rejects missing/already-opened packs, persists opened state and persists the discovered collection. Public award/open wrappers do not bypass those safeguards.
- Reward triggers are wired into current WingMatch completion (`EngineeringMatch.tsx:151`), starter-project evidence saving (`Projects.tsx:56`) and aerospace experiment/evidence milestones (`BuildEngine.tsx`). Merely changing a label is not the mechanism that grants a reward.
- `app/api/` currently exposes analytics and impact endpoints, not a leaderboard endpoint. `db/schema.ts` contains analytics/impact tables, not a leaderboard or student account score table. No `leaderboard` occurrence was found in runtime source directories. This is inspected-source evidence, not a proof about any unknown external deployment.

## Baseline/history evidence

`git diff --exit-code origin/main --` returned no differences for `MyUniversePanel.tsx`, `MyUniversePage.tsx`, `CosmicPackVault.tsx`, `cosmic-packs.ts` and `scripts/final-altwing-qa.py` during this investigation.

The imported production commit `6113af4` and the available Sites source commit `b0f7071` already contain the same compact MyUniversePanel, current heading and child composition. Searching available history with `git log --all -S` for each old marker returned no adding/removing commit for that file. The fetched production source already has this mismatch; it was not introduced by the proposed assessment update. Available repository history does not establish whether a different, earlier unpublished implementation once used those strings, and this investigation makes no claim about unavailable history.

## Executed checks and limits

1. **PASS — `npm run test:submission`.** The existing tests exercise an isolated localStorage map. A builder reward is awarded once; repeated source IDs return `awarded:false`; opening creates three valid persisted discoveries; a second opening returns null; the inventory records `openedAt`. Route, model, eligibility and saved-record regression checks also passed. No real production records or administrator identity were used.
2. **PASS — actual React server rendering with isolated reward state.** An in-memory TypeScript/JSX loader rendered the real `MyUniversePanel` with the real vault/atlas and stubbed legacy analytics. With empty storage it displayed the current heading, both tabs and `NO PACKS READY`. After an isolated builder award it displayed one ready pack and an Open pack button. After opening, the three-card collection persisted and the actual atlas rendered. No leaderboard/account-lock claim appeared. This is component rendering evidence, not a browser click, animation, keyboard or touch test.
3. **FAIL — old `python3 scripts/final-altwing-qa.py`.** Its first seven source markers pass; the last two fail exactly as reported. The script's output does not test a user interaction, transaction, identity check or server denial.

Browser interaction, reload behavior in a real browser, reward animations, focus handling and mobile layout remain **UNVERIFIED** until the manual browser checklist is executed. These isolated checks do not substitute for that review.

## Recommended minimal resolution

Do not rename current UI, insert the old phrases as comments, add a fictitious leaderboard lock, or add new account/leaderboard features solely to satisfy this test.

1. Update the obsolete audit's last two entries to inspect the real current composition and product boundary. Assert that the `#/universe` route still renders MyUniversePage; that MyUniversePage still renders MyUniversePanel; and that the panel imports/renders the actual CosmicPackVault and CosmicAtlas. Label the check accurately as pack/collection composition, not a historical title.
2. Retain the existing award/open persistence tests and add meaningful isolated rendering coverage for the empty, unopened-pack and opened-collection states described above. Preserve explicit tests for duplicate source awards, invalid/missing pack IDs, re-opening and valid collection persistence. Test the behavior itself rather than adding a second literal-heading expectation.
3. Replace the inaccurate **Honest leaderboard lock** requirement with a current-product invariant: the student universe must not display global/verified student ranking claims, offer an enabled score-submission control or call a leaderboard API. Cross-check current routes/API/schema and document that no competitive leaderboard is implemented. This is an absence-of-feature/claims check, not security certification of a nonexistent service. If a leaderboard is intentionally added later, it requires its own reviewed server authentication and abuse/integrity tests; a text marker is insufficient.
4. Update `docs/migration/ALTWING-ORG.md` and the final-readiness report so they do not continue promising a leaderboard lock or describe a genuine pack failure after the replacement checks pass. Archive the old advisory and its original evidence as historical context rather than erasing that it previously failed.
5. Remove the `legacy-source-audit` allowance from the active release policy **only after** the corrected audit and actual behavioral/rendering checks pass. Keep it a required release check. A future regression must fail normally, without a blanket label-based waiver. Do not refresh fingerprints simply to excuse changed code.

The evidence supports resolving an audit/documentation discrepancy with current-behavior tests. It does **not** justify claiming browser QA is complete, that scores represent verified students, or that a secure competitive leaderboard exists.

## Applied resolution (after the investigation above)

Root retained the seven other legacy checks, removed only the two obsolete decorative-label expectations, and now runs scripts/check-legacy-rewards.mjs from the required Python audit. That real-module/rendering/transactional check passes, and the complete final suite passes25/25 with zero active allowances. The FAIL result above records the baseline investigation before this correction, not a remaining failure. Original fingerprints/failure descriptions remain in deployment/retired-advisories.json. No universe UI, pack model, competitive leaderboard or authentication behavior was changed. Actual browser acceptance remains UNVERIFIED.
