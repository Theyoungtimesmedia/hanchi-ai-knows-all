-- Remove study/education-related tables
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;

-- Remove related functions
DROP FUNCTION IF EXISTS upsert_user_progress(uuid, text, text, text, boolean);
DROP FUNCTION IF EXISTS award_xp(uuid, integer);