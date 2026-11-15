import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { API_ORIGIN, TITLE, DESCRIPTION, pagesTarget } from './deployment/domain.mjs';

const target = pagesTarget(process.env.ALTWING_PAGES_TARGET || 'custom');
const socialImage = `${target.canonical}brand/altwing-penguin.png`;
export default defineConfig({
  base: target.base,
  define: { __ALTWING_API_ORIGIN__: JSON.stringify(API_ORIGIN) },
  plugins: [{
    name: 'altwing-pages-domain',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('/src/') && /\.[jt]sx$/.test(id)) {
        return code.replaceAll('"/brand/', `"${target.base}brand/`)
          .replaceAll("'/brand/", `'${target.base}brand/`);
      }
      return null;
    },
    transformIndexHtml(html) {
      return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />${'noindex' in target ? '<meta name="robots" content="noindex,nofollow" />' : ''}`)
        .replaceAll('__SITE_CANONICAL__', target.canonical)
        .replaceAll('__SITE_IMAGE__', socialImage)
        .replaceAll('__SITE_TITLE__', TITLE)
        .replaceAll('__SITE_DESCRIPTION__', DESCRIPTION);
    },
  }, react()],
  build: { outDir: target.outDir, emptyOutDir: true },
});
