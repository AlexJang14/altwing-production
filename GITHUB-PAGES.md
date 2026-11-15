# GitHub Pages deployment

The public student website is deployed from `https://github.com/junjang06/altwing`, which contains generated deployment files only. The editable source, Worker backend, database migrations, and runtime configuration remain in this source project.

Run `npm run build:pages` to generate `pages-dist/`. The Pages build uses relative assets so project subpaths work, and sends anonymous events to the existing AltWing API. The protected analytics dashboard opens as a top-level navigation on the backend host, where owner sign-in works. GitHub Pages itself cannot run the Worker or D1 database.

The server allows anonymous ingestion from the exact configured `ANALYTICS_ALLOWED_ORIGINS` entry `https://junjang06.github.io`. CORS applies only to session authorization and event ingestion, never the private report API. Credentials are omitted from anonymous requests; signed session capabilities, privacy opt-out, DNT/GPC, payload validation and rate limits remain enforced. Runtime secret values stay in Sites.

To update the public site, rebuild, replace generated files in the deployment repository while preserving its `.git`, `.nojekyll`, and README, then commit and push `main`. Pages publishes the repository root with Jekyll disabled. Do not copy the server source or local environment files into that public artifact repository.

Browser progress is tied to the website origin. Existing work saved at the previous address remains there and does not automatically transfer to GitHub Pages. The backend's aggregate statistics stay in the existing database.
