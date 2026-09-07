-- ====================================================================
-- MediKiosk SIH 2026: Row Level Security (RLS) & Multi-Role Policy Migration
-- ====================================================================
-- Tables covered:
-- 1. patients
-- 2. intake_sessions
-- 3. conversations
-- 4. conversation_messages
-- 5. medical_facts
-- 6. documents
-- 7. document_pages
-- 8. ocr_blocks
-- 9. document_entities
-- 10. evidence_sources
-- 11. risk_assessments
-- 12. timeline_events
-- 13. consents
-- 14. clinical_handoffs
-- 15. audit_events
-- 16. interoperability_exports
-- 17. demo_interoperability_transactions
-- 18. verifications
-- 19. queue_items
-- ====================================================================

-- 1. Enable RLS on all clinical and patient tables
ALTER TABLE IF EXISTS patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS medical_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ocr_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clinical_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS interoperability_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS demo_interoperability_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS queue_items ENABLE ROW LEVEL SECURITY;

-- 2. Define Helper Functions for Authentication Claims in Supabase
CREATE OR REPLACE FUNCTION current_user_role() RETURNS text AS \$\$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claim.role', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
        'anon'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN 'anon';
END;
\$\$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_user_id() RETURNS text AS \$\$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claim.sub', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'sub'),
        ''
    );
EXCEPTION WHEN OTHERS THEN
    RETURN '';
END;
\$\$ LANGUAGE plpgsql STABLE;

-- 3. Service Role Bypass Policies (Allows backend FastAPI with SERVICE_ROLE key full access)
DO \$\$
DECLARE
    t text;
    tables text[] := ARRAY[
        'patients', 'intake_sessions', 'conversations', 'conversation_messages',
        'medical_facts', 'documents', 'document_pages', 'ocr_blocks',
        'document_entities', 'evidence_sources', 'risk_assessments',
        'timeline_events', 'consents', 'clinical_handoffs', 'audit_events',
        'interoperability_exports', 'demo_interoperability_transactions',
        'verifications', 'queue_items'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS service_role_all ON %I;', t);
        EXECUTE format('
            CREATE POLICY service_role_all ON %I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        ', t);
    END LOOP;
END;
\$\$;

-- 4. Clinician & Staff Access Policies (Doctor, Nurse, Admin read/review clinical records)
DO \$\$
DECLARE
    t text;
    clinical_tables text[] := ARRAY[
        'patients', 'intake_sessions', 'conversations', 'conversation_messages',
        'medical_facts', 'documents', 'document_pages', 'ocr_blocks',
        'document_entities', 'evidence_sources', 'risk_assessments',
        'timeline_events', 'consents', 'clinical_handoffs', 'verifications',
        'queue_items', 'interoperability_exports'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS staff_access_policy ON %I;', t);
        EXECUTE format('
            CREATE POLICY staff_access_policy ON %I
            FOR ALL
            TO authenticated
            USING (
                current_user_role() IN (''DOCTOR'', ''NURSE'', ''ADMIN'', ''authenticated'')
            )
            WITH CHECK (
                current_user_role() IN (''DOCTOR'', ''NURSE'', ''ADMIN'', ''authenticated'')
            );
        ', t);
    END LOOP;
END;
\$\$;

-- 5. Audit Events Security Policy (Append-only by staff and backend; read-only for Admins)
DROP POLICY IF EXISTS audit_insert_policy ON audit_events;
CREATE POLICY audit_insert_policy ON audit_events
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

DROP POLICY IF EXISTS audit_select_policy ON audit_events;
CREATE POLICY audit_select_policy ON audit_events
FOR SELECT
TO authenticated
USING (current_user_role() IN ('ADMIN', 'service_role'));

-- 6. Public Kiosk Patient Intake Registration (Allow anonymous kiosk intakes to insert initial session)
DROP POLICY IF EXISTS kiosk_patient_insert ON patients;
CREATE POLICY kiosk_patient_insert ON patients
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS kiosk_intake_insert ON intake_sessions;
CREATE POLICY kiosk_intake_insert ON intake_sessions
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS kiosk_consent_insert ON consents;
CREATE POLICY kiosk_consent_insert ON consents
FOR INSERT
TO anon
WITH CHECK (true);

-- Verification Query
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
