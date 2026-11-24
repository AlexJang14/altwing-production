This isolated branch runs browser acceptance against the frozen AltWing Launch
candidate. It is not a production release branch.

`qa/frozen-candidate.tar.gz` contains all 486 source files, exactly as recorded in
`qa/SOURCE-MANIFEST.json`. `qa/browser-inputs.br` contains the previously built
actual application, existing acceptance workflow, and normal served preview.
The job verifies their hashes and the product source fingerprint before testing.

The only active workflow in this branch has read-only repository permissions and
no deployment, database, DNS, publishing or account-login operation. Changing
`qa/READY.json` starts the browser suite. Chromium and Firefox run locally on the
GitHub-hosted runner. External application requests are recorded and blocked.

Artifacts include report.html, results.json, the populated existing acceptance
guide, screenshots, captured console/network errors, timing/persistence evidence,
CSV downloads, and generated PDFs. Synthetic values are not real student data.
Unperformed or inconclusive requirements stay UNVERIFIED. The existing mascot
retention exception is approved; this workflow does not assert copyright clearance.
