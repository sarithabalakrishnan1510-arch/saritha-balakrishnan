-- ==========================================================
-- CAST KERALA ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Public can view basic active profiles"
  ON profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can edit own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins full access to profiles"
  ON profiles FOR ALL
  USING (is_admin());

-- 2. TALENT PROFILES POLICIES
CREATE POLICY "Public can view approved public talent profiles"
  ON talent_profiles FOR SELECT
  USING (admin_status = 'approved' AND show_public_profile = true);

CREATE POLICY "Talent can manage own talent profile"
  ON talent_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins full access to talent profiles"
  ON talent_profiles FOR ALL
  USING (is_admin());

-- 3. GUARDIAN PROFILES POLICIES (Strict child safety)
CREATE POLICY "Only talent owner or admin can view guardian info"
  ON guardian_profiles FOR SELECT
  USING (auth.uid() = talent_user_id OR is_admin());

CREATE POLICY "Talent owner can insert or update guardian info"
  ON guardian_profiles FOR ALL
  USING (auth.uid() = talent_user_id OR is_admin());

-- 4. PROJECTS POLICIES
CREATE POLICY "Public can view public projects"
  ON projects FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Production owners can CRUD their own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins full access to projects"
  ON projects FOR ALL
  USING (is_admin());

-- 5. CASTING CALLS & ROLES
CREATE POLICY "Public can view published approved casting calls"
  ON casting_calls FOR SELECT
  USING (status = 'published' AND admin_status = 'approved' AND is_public = true);

CREATE POLICY "Production can CRUD own casting calls"
  ON casting_calls FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Admins full access to casting calls"
  ON casting_calls FOR ALL
  USING (is_admin());

CREATE POLICY "Public can view roles of published calls"
  ON casting_roles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM casting_calls 
    WHERE casting_calls.id = casting_roles.casting_call_id
      AND casting_calls.status = 'published'
      AND casting_calls.admin_status = 'approved'
  ));

CREATE POLICY "Production can manage roles in own calls"
  ON casting_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM casting_calls 
    WHERE casting_calls.id = casting_roles.casting_call_id
      AND casting_calls.created_by = auth.uid()
  ));

-- 6. APPLICATIONS POLICIES
CREATE POLICY "Talent can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = talent_user_id);

CREATE POLICY "Talent can insert own application"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = talent_user_id);

CREATE POLICY "Talent can withdraw own application"
  ON applications FOR UPDATE
  USING (auth.uid() = talent_user_id);

CREATE POLICY "Production owners can view applications for their roles"
  ON applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM casting_roles
    JOIN casting_calls ON casting_roles.casting_call_id = casting_calls.id
    WHERE casting_roles.id = applications.casting_role_id
      AND casting_calls.created_by = auth.uid()
  ));

CREATE POLICY "Production owners can update application status and notes"
  ON applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM casting_roles
    JOIN casting_calls ON casting_roles.casting_call_id = casting_calls.id
    WHERE casting_roles.id = applications.casting_role_id
      AND casting_calls.created_by = auth.uid()
  ));

CREATE POLICY "Admins full access to applications"
  ON applications FOR ALL
  USING (is_admin());

-- 7. AUDITIONS POLICIES
CREATE POLICY "Talent can view their own auditions"
  ON auditions FOR SELECT
  USING (auth.uid() = talent_user_id);

CREATE POLICY "Talent can update their audition status (accept/decline/submit tape)"
  ON auditions FOR UPDATE
  USING (auth.uid() = talent_user_id);

CREATE POLICY "Production creators can manage auditions"
  ON auditions FOR ALL
  USING (auth.uid() = created_by);

-- 8. NOTIFICATIONS POLICIES
CREATE POLICY "Users can only view and update own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- 9. VENDORS & LOCATIONS
CREATE POLICY "Public can view approved vendors"
  ON vendors FOR SELECT
  USING (admin_status = 'approved');

CREATE POLICY "Public can view approved locations"
  ON shooting_locations FOR SELECT
  USING (admin_status = 'approved');

CREATE POLICY "Admins can manage vendors and locations"
  ON vendors FOR ALL
  USING (is_admin());

CREATE POLICY "Admins can manage locations"
  ON shooting_locations FOR ALL
  USING (is_admin());

-- 10. REPORTS
CREATE POLICY "Users can submit reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can view and manage reports"
  ON reports FOR ALL
  USING (is_admin());
