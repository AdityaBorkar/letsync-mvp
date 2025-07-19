export const clearDb = `
-- Disable foreign key checks temporarily to avoid drop order issues
SET session_replication_role = 'replica';

-- Drop all tables in the current schema
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all sequences in the current schema
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP SEQUENCE ' || quote_ident(r.sequencename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all views in the current schema
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP VIEW ' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all materialized views in the current schema
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT matviewname FROM pg_matviews WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP MATERIALIZED VIEW ' || quote_ident(r.matviewname) || ' CASCADE';
    END LOOP;
END $$;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
`;
