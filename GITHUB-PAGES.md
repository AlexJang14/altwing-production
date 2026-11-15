# GitHub Pages deployment

The complete editable application is now managed in **[AlexJang14/altwing-production](https://github.com/AlexJang14/altwing-production)**. Its GitHub Actions workflow deploys the frontend to **https://altwing.org/**. Follow [the current production guide](docs/PRODUCTION.md) for Cloudflare DNS, update commands, backend operations, validation and rollback.

Push reviewed changes to `main` to validate, build and deploy. Pages Source is **GitHub Actions**. Actions builds `/altwing-production/` when using the default GitHub address, and `/` when the repository's custom domain is `altwing.org`. It uploads only the built static frontend, not backend source or environment files. `npm run build:pages` generates `pages-dist/` for the custom domain; `npm run build:pages:preview` generates `pages-preview/` for the default GitHub path.

The existing authenticated backend and D1 database remain at `https://altwing-engineering-pathways.theanna.chatgpt.site`. Its runtime origin allowlist includes the old GitHub origin, `https://alexjang14.github.io`, `https://altwing.org` and `https://www.altwing.org`. The protected dashboard opens on that backend, where owner sign-in works. Pages cannot run the Worker or D1. Runtime secrets stay server-side; anonymous requests omit credentials and private reports have no cross-origin CORS access.

The old `junjang06/altwing` repository still contains its original generated deployment and is not changed, disabled or redirected by the new repository. The older AlexJang14 repositories also remain intact. Backend updates are separate from the frontend's Pages workflow, and preserve the existing Sites project and database bindings.

Browser progress belongs to its origin and needs a private export/import between addresses. The new app includes **Transfer saved progress**. The production guide explains original-origin export without changing the old deployment. Existing aggregate analytics stays in the same backend database.
