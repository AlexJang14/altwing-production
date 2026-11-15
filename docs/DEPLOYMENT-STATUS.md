# AltWing ownership handoff

- **Website:** https://altwing.org/
- **Production source:** https://github.com/AlexJang14/altwing-production
- **Default branch:** `main`; pushes run `.github/workflows/pages.yml` automatically.
- **Detailed operations and exact Cloudflare records:** [Production guide](PRODUCTION.md).

The full editable source, public assets, mission and simulation code, progression/storage code, backend source and database migrations are in the new repository. The GitHub source was verified by a fresh independent clone and an exact source-tree comparison. The internal Sites history was a shallow checkout, so the new repository starts with a complete audited source snapshot; subsequent updates use ordinary fast-forward commits. No force push or unrelated repository replacement was used. Local `origin` and the `main` tracking branch now point to AlexJang14's repository; the Sites source remote is retained separately.

The initial unmodified source matches all 29 application files in the previous deployment. The old website still serves its unchanged index and `junjang06/altwing` remains at commit `ffc5ccf9eb6ae23d722fdf36ab204a9c9c8d363c`. The existing AlexJang14 `Altwing`, `altwing-v2` and video repositories were not changed.

GitHub Actions successfully ran validation, production builds and deployment. The local/CI strict checks have **16 passes and two unchanged pre-existing failures**: the 42-record source-verification freshness audit and the historical source-label audit. Their exact reviewed input hashes and failure output are documented; they remain explicit warnings in the release check. Unexpected failures or changed still-failing inputs block deployment. No verification dates or original simulation/mission logic were changed to obtain a pass.

Live HTTP checks passed on the independent GitHub deployment before custom-domain activation and then on **https://altwing.org/**: every one of 32 published static files matched the tested local build, the old site remained available, all four exact analytics-origin preflights worked, lookalike origins were rejected, and private reports remained denied. These total **41 live checks**. `https://www.altwing.org/` redirects to the HTTPS apex. The homepage uses the clean root address; existing feature hash routes remain supported. Browser interaction/visual QA was not available in this session and is not implied by these checks.

The existing backend was redeployed from the same saved **version 9**, applying environment revision **4** with only the expanded origin allowlist. Authentication, backend source, D1 data and runtime secrets were retained. GitHub deploys the frontend only; the backend remains a separate Sites deployment under the connected owner's account.

Cloudflare DNS now returns all four GitHub Pages A addresses and the `www` CNAME to `alexjang14.github.io`, in DNS-only mode. The new repository's custom domain is `altwing.org` and its deployment uses root asset paths. The old repository's Pages settings were not changed.

**Pending platform setting:** GitHub currently reports `https_enforced: false`, and the owner confirmed that **Enforce HTTPS** is unavailable while GitHub provisions its certificate. HTTPS requests and the www-to-HTTPS-apex redirect already work. When GitHub enables the checkbox at [repository Pages settings](https://github.com/AlexJang14/altwing-production/settings/pages), turn it on and verify HTTP redirects to HTTPS. Certificate readiness can take up to 24 hours; see the production guide. Account-level domain verification using GitHub's generated TXT challenge is also recommended; its unique value must come from the owner's GitHub settings.

Progress does not move automatically between browser origins. Use the private backup/restore page and the original-origin exporter described in the production guide; no account/session identifiers are moved with progress. Keep the old site available until returning users have had an export opportunity. Do not remove or redirect it as part of this handoff.
