// The frontend moves; the existing authenticated backend and database do not.
export const DOMAIN = 'altwing.org';
export const SITE_ORIGIN = `https://${DOMAIN}`;
export const LEGACY_ORIGIN = 'https://junjang06.github.io';
export const LEGACY_BASE = '/altwing/';
export const GITHUB_OWNER = 'AlexJang14';
export const GITHUB_REPOSITORY = 'altwing-production';
export const PREVIEW_ORIGIN = 'https://alexjang14.github.io';
export const PREVIEW_BASE = `/${GITHUB_REPOSITORY}/`;
export const API_ORIGIN = 'https://altwing-engineering-pathways.theanna.chatgpt.site';
export const TITLE = 'AltWing · Your path. Your pace.';
export const DESCRIPTION = 'Find your own way into engineering through interactive missions, guided projects, and student opportunities.';
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/brand/altwing-penguin.png`;
export function pagesTarget(name = 'custom') {
  // Preserve the boolean API used by the original migration checks.
  if (typeof name === 'boolean') name = name ? 'legacy' : 'custom';
  const targets = {
    custom: { base: '/', canonical: `${SITE_ORIGIN}/`, outDir: 'pages-dist', domain: DOMAIN },
    legacy: { base: LEGACY_BASE, canonical: `${LEGACY_ORIGIN}${LEGACY_BASE}`, outDir: 'pages-legacy', domain: null },
    preview: { base: PREVIEW_BASE, canonical: `${PREVIEW_ORIGIN}${PREVIEW_BASE}`, outDir: 'pages-preview', domain: null, noindex: true },
  };
  if (!Object.hasOwn(targets, name)) throw Error(`Unknown Pages target: ${name}`);
  return targets[name];
}
