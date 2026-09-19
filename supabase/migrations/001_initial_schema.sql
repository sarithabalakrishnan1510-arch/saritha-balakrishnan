-- ==========================================================
-- CAST KERALA DATABASE SCHEMA MIGRATION 001
-- Targets: PostgreSQL / Supabase
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom ENUMs
CREATE TYPE user_role AS ENUM ('talent', 'production', 'admin');

CREATE TYPE production_role AS ENUM (
  'producer',
  'director',
  'casting_director',
  'production_controller',
  'production_manager',
  'assistant_director'
);

CREATE TYPE experience_level_enum AS ENUM (
  'fresher',
  'junior_artist',
  'experienced',
  'working_actor',
  'theatre_actor',
  'senior_artist',
  'child_artist',
  'teen_artist',
  'professional'
);

CREATE TYPE gender_enum AS ENUM ('male', 'female', 'non_binary', 'any');
CREATE TYPE admin_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE application_status_enum AS ENUM ('applied', 'viewed', 'shortlisted', 'audition', 'selected', 'rejected', 'withdrawn');
CREATE TYPE audition_status_enum AS ENUM ('invited', 'accepted', 'declined', 'submitted', 'reviewed', 'selected', 'rejected');
CREATE TYPE match_level_enum AS ENUM ('exact', 'strong', 'possible', 'general');

-- 1. PROFILES (Base user account linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'talent',
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  phone_private TEXT,
  email_private TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. TALENT PROFILES
CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name TEXT,
  date_of_birth DATE NOT NULL,
  gender gender_enum NOT NULL,
  actual_age INT GENERATED ALWAYS AS (date_part('year', age(date_of_birth))) STORED,
  playing_age_min INT NOT NULL,
  playing_age_max INT NOT NULL,
  height_cm INT,
  weight_kg INT,
  bio TEXT,
  experience_level experience_level_enum NOT NULL DEFAULT 'fresher',
  working_status TEXT NOT NULL DEFAULT 'available',
  years_experience INT DEFAULT 0,
  primary_category TEXT NOT NULL,
  current_project TEXT,
  native_place TEXT NOT NULL,
  travel_willing BOOLEAN DEFAULT true,
  show_public_profile BOOLEAN DEFAULT true,
  admin_status admin_status_enum DEFAULT 'approved',
  verification_status verification_status_enum DEFAULT 'unverified',
  profile_completion_percent INT DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GUARDIAN PROFILES (For minor safety)
CREATE TABLE IF NOT EXISTS guardian_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  guardian_phone_private TEXT NOT NULL,
  guardian_email_private TEXT NOT NULL,
  consent_confirmed BOOLEAN NOT NULL DEFAULT false,
  verification_status verification_status_enum DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TALENT MEDIA
CREATE TABLE IF NOT EXISTS talent_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- profile_photo, gallery_photo, introduction_video, showreel, acting_clip, self_tape
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TALENT EXPERIENCE
CREATE TABLE IF NOT EXISTS talent_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  role_name TEXT NOT NULL,
  production_name TEXT NOT NULL,
  year INT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCTION PROFILES
CREATE TABLE IF NOT EXISTS production_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_role production_role NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  company_description TEXT,
  website TEXT,
  instagram TEXT,
  previous_projects TEXT[],
  verification_status verification_status_enum DEFAULT 'pending',
  admin_status admin_status_enum DEFAULT 'approved',
  company_address_private TEXT,
  gst_or_registration_optional TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  project_type TEXT NOT NULL,
  production_house TEXT NOT NULL,
  director_name TEXT NOT NULL,
  description TEXT NOT NULL,
  shoot_start_date DATE,
  shoot_end_date DATE,
  primary_location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preproduction',
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 8. CASTING CALLS
CREATE TABLE IF NOT EXISTS casting_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  application_deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  admin_status admin_status_enum DEFAULT 'approved',
  is_public BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9. CASTING ROLES
CREATE TABLE IF NOT EXISTS casting_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  casting_call_id UUID NOT NULL REFERENCES casting_calls(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  role_description TEXT NOT NULL,
  gender_requirement gender_enum NOT NULL DEFAULT 'any',
  playing_age_min INT NOT NULL,
  playing_age_max INT NOT NULL,
  experience_requirement TEXT DEFAULT 'any',
  location_requirement TEXT,
  language_requirement TEXT[] DEFAULT ARRAY['Malayalam'],
  number_needed INT DEFAULT 1,
  paid_status TEXT DEFAULT 'paid',
  compensation_text TEXT,
  shoot_location TEXT,
  shoot_start_date DATE,
  shoot_end_date DATE,
  audition_type TEXT DEFAULT 'in_person',
  showreel_required BOOLEAN DEFAULT false,
  self_tape_required BOOLEAN DEFAULT false,
  photo_required BOOLEAN DEFAULT true,
  special_notes TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CASTING MATCHES
CREATE TABLE IF NOT EXISTS casting_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  casting_role_id UUID NOT NULL REFERENCES casting_roles(id) ON DELETE CASCADE,
  talent_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL,
  match_level match_level_enum NOT NULL,
  age_score INT DEFAULT 0,
  gender_score INT DEFAULT 0,
  language_score INT DEFAULT 0,
  experience_score INT DEFAULT 0,
  location_score INT DEFAULT 0,
  skill_score INT DEFAULT 0,
  availability_score INT DEFAULT 0,
  preference_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(casting_role_id, talent_user_id)
);

-- 11. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  casting_role_id UUID NOT NULL REFERENCES casting_roles(id) ON DELETE CASCADE,
  talent_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status application_status_enum DEFAULT 'applied',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  self_tape_url TEXT,
  acting_clip_url TEXT,
  production_notes TEXT,
  UNIQUE(casting_role_id, talent_user_id)
);

-- 12. SHORTLISTS
CREATE TABLE IF NOT EXISTS shortlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shortlist_talent (
  shortlist_id UUID REFERENCES shortlists(id) ON DELETE CASCADE,
  talent_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (shortlist_id, talent_user_id)
);

-- 13. AUDITIONS
CREATE TABLE IF NOT EXISTS auditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  casting_role_id UUID NOT NULL REFERENCES casting_roles(id) ON DELETE CASCADE,
  talent_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  audition_type TEXT NOT NULL DEFAULT 'in_person',
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  meeting_link TEXT,
  instructions TEXT NOT NULL,
  script_file_url TEXT,
  deadline TIMESTAMPTZ,
  status audition_status_enum DEFAULT 'invited',
  talent_self_tape_url TEXT,
  talent_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  contact_person TEXT NOT NULL,
  phone_private TEXT NOT NULL,
  email_private TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  service_area TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  instagram TEXT,
  pricing_text TEXT NOT NULL,
  image_url TEXT,
  verification_status verification_status_enum DEFAULT 'pending',
  admin_status admin_status_enum DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SHOOTING LOCATIONS
CREATE TABLE IF NOT EXISTS shooting_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_name TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  approximate_location TEXT NOT NULL,
  description TEXT NOT NULL,
  indoor_allowed BOOLEAN DEFAULT true,
  outdoor_allowed BOOLEAN DEFAULT true,
  night_shoot_allowed BOOLEAN DEFAULT false,
  parking_capacity INT DEFAULT 10,
  crew_capacity INT DEFAULT 50,
  power_available BOOLEAN DEFAULT true,
  changing_room BOOLEAN DEFAULT true,
  restroom BOOLEAN DEFAULT true,
  generator_access BOOLEAN DEFAULT true,
  pricing_text TEXT NOT NULL,
  owner_contact_private TEXT NOT NULL,
  admin_status admin_status_enum DEFAULT 'approved',
  verification_status verification_status_enum DEFAULT 'verified',
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. REPORTS & MODERATION
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_talent_playing_age ON talent_profiles(playing_age_min, playing_age_max);
CREATE INDEX IF NOT EXISTS idx_talent_gender ON talent_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_talent_exp ON talent_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_casting_status ON casting_calls(status, admin_status);
CREATE INDEX IF NOT EXISTS idx_roles_age ON casting_roles(playing_age_min, playing_age_max);
CREATE INDEX IF NOT EXISTS idx_apps_role_talent ON applications(casting_role_id, talent_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_vendors_district ON vendors(district);
CREATE INDEX IF NOT EXISTS idx_locations_district ON shooting_locations(district);

-- ==========================================================
-- PUBLIC-SAFE VIEWS
-- ==========================================================
CREATE OR REPLACE VIEW public_talent_profiles AS
SELECT 
  p.id AS user_id,
  p.full_name,
  tp.stage_name,
  p.avatar_url,
  p.district,
  p.city,
  p.is_verified,
  tp.gender,
  tp.playing_age_min,
  tp.playing_age_max,
  tp.height_cm,
  tp.bio,
  tp.experience_level,
  tp.working_status,
  tp.years_experience,
  tp.primary_category,
  tp.travel_willing,
  tp.profile_completion_percent
FROM profiles p
JOIN talent_profiles tp ON p.id = tp.user_id
WHERE p.is_active = true 
  AND tp.admin_status = 'approved'
  AND tp.show_public_profile = true;
