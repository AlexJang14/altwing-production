// Portable student data only. Authentication, analytics IDs and browser sessions
// are deliberately outside this format; they are not progression.
const EXACT_KEYS = new Set([
  'altwing-analytics-consent-v1', 'altwing-cosmic-atlas-v1',
  'altwing-cosmic-packs-v1', 'altwing-engineering-match-v1',
  'altwing-explorer-profile-v1', 'altwing-flight-plan-scroll',
  'altwing-guidance-profile-v1', 'altwing-guidance-saved-v1',
  'altwing-guidance-selected-major-v1', 'altwing-home-tour-v2',
  'altwing-match-draft-v1', 'altwing-my-college-list',
  'altwing-opportunity-state', 'altwing-player-progress-v1',
  'altwing-post-wing-guide-pending-v1', 'altwing-post-wing-guide-v1',
  'altwing-propulsion-build-v1', 'altwing-readiness-profile',
  'altwing-readiness-rpg-sync-v1', 'altwing-readiness-target-college',
  'altwing-selected-wing', 'altwing-selected-wing-saved-at-v1',
  'altwing-selected-wing-v1', 'altwing-wingmatch-feedback-pending-v1',
  'altwing-wingmatch-v3-state', 'altwing-wingmatch-v5-state',
  'altwing-wingmatch-v7-result',
]);
const PREFIXES = [
  'altwing-build-draft-v1:', 'altwing-build-proof-', 'altwing-build-quest-',
  'altwing-evidence-v1-', 'altwing-project-meta-v1-', 'altwing-project-v1:',
  'altwing-project-versions-v1-', 'altwing-wing-path-build-v1:',
  'altwing-wing-path-proof-v1:', 'altwing-wing-path-v1:',
  'altwing-wingmatch-feedback-deferred-v1:', 'altwing-wingmatch-feedback-opened-v1:',
  'altwing-wingmatch-feedback-submitted-v1:',
];
export const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
export type ProgressBackup = {
  format: 'altwing-progress'; version: 1; createdAt: string;
  sourceOrigin: string; entries: Record<string, string>;
};
export function isProgressKey(key: string) {
  return EXACT_KEYS.has(key) || PREFIXES.some(prefix => key.startsWith(prefix)
    && /^[a-zA-Z0-9_.:-]{1,200}$/.test(key.slice(prefix.length)));
}
export function snapshotProgress(storage: Pick<Storage, 'length' | 'key' | 'getItem'>) {
  const entries: Record<string, string> = Object.create(null);
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && isProgressKey(key)) {
      const value = storage.getItem(key);
      if (value !== null) entries[key] = value;
    }
  }
  return entries;
}
export function createProgressBackup(values: Record<string, string>, sourceOrigin: string): ProgressBackup {
  const entries: Record<string, string> = Object.create(null);
  for (const [key, value] of Object.entries(values)) if (isProgressKey(key)) entries[key] = value;
  const backup: ProgressBackup = {format:'altwing-progress',version:1,createdAt:new Date().toISOString(),sourceOrigin,entries};
  // Apply the same validation to exports and imports, including size limits.
  return parseProgressBackup(JSON.stringify(backup));
}
export function parseProgressBackup(text: string): ProgressBackup {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw Error('This backup is too large. The limit is 8 MB.');
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw Error('Choose a valid AltWing JSON backup.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Invalid AltWing backup.');
  const value = data as Partial<ProgressBackup>;
  if (value.format !== 'altwing-progress' || value.version !== 1) throw Error('This is not a supported AltWing progress backup.');
  if (typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))
    || typeof value.sourceOrigin !== 'string' || value.sourceOrigin.length > 300) throw Error('The backup metadata is invalid.');
  if (!value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) throw Error('The backup has no saved-data list.');
  const pairs = Object.entries(value.entries);
  if (pairs.length > 256 || pairs.some(([key, item]) => !isProgressKey(key) || typeof item !== 'string' || item.length > 2 * 1024 * 1024)) {
    throw Error('The backup contains unsupported data. Nothing was changed.');
  }
  return {format:'altwing-progress',version:1,createdAt:value.createdAt,sourceOrigin:value.sourceOrigin,entries:Object.assign(Object.create(null),value.entries)};
}
