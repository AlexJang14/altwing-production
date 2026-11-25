-- SELECT-only operator preflight for the existing Sites-managed DB.
-- Prepared for review; NOT executed on production by this release preparation.
-- Run through supported, authorized SQL access; retain output privately.
-- No statement below creates a backup. Confirm recoverability separately.

-- Schema and index/trigger definitions, including migration bookkeeping names.
SELECT type, name, tbl_name, sql
FROM sqlite_master
WHERE name NOT LIKE 'sqlite_%'
ORDER BY type, name;

-- Counts for the eight user tables returned by the real read-only DB overview.
-- These are a timestamped integrity baseline, not publishable impact statistics.
SELECT 'analytics_events' AS table_name, COUNT(*) AS row_count FROM analytics_events
UNION ALL SELECT 'impact_activity', COUNT(*) FROM impact_activity
UNION ALL SELECT 'impact_daily', COUNT(*) FROM impact_daily
UNION ALL SELECT 'impact_meta', COUNT(*) FROM impact_meta
UNION ALL SELECT 'impact_replay', COUNT(*) FROM impact_replay
UNION ALL SELECT 'impact_sessions', COUNT(*) FROM impact_sessions
UNION ALL SELECT 'impact_surveys', COUNT(*) FROM impact_surveys
UNION ALL SELECT 'impact_totals', COUNT(*) FROM impact_totals;

-- Must be zero before first application; an existing object needs investigation.
-- Do not blindly rerun CREATE or delete an object to force the count to zero.
SELECT COUNT(*) AS pending_object_name_collisions
FROM sqlite_master
WHERE name IN (
 'impact_assessment_activity', 'impact_assessment_activity_parent',
 'impact_assessments', 'impact_assessment_visit_version_source',
 'impact_assessment_submitted', 'impact_assessment_offered',
 'impact_behavior_activity', 'impact_behavior_last_seen', 'impact_behavior_daily',
 'impact_behavior_insert', 'impact_behavior_update',
 'analytics_recommended_field_once', 'impact_behavior_capture'
);

-- Must be zero for the pending UNIQUE index on the existing analytics table.
-- Non-null conditions match SQLite uniqueness semantics; no visit IDs are output.
-- Unexpected duplicates are a STOP, not authorization to delete history.
SELECT COUNT(*) AS recommended_field_duplicate_groups
FROM (
 SELECT 1
 FROM analytics_events
 WHERE event = 'Recommended Field Explored'
   AND session_id IS NOT NULL AND major IS NOT NULL
 GROUP BY session_id, major
 HAVING COUNT(*) > 1
);
