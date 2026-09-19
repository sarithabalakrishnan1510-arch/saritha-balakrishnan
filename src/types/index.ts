export type UserRole = 'talent' | 'production' | 'admin';

export type ProductionProfessionalRole = 
  | 'producer'
  | 'director'
  | 'casting_director'
  | 'production_controller'
  | 'production_manager'
  | 'assistant_director';

export type ExperienceLevel =
  | 'fresher'
  | 'junior_artist'
  | 'experienced'
  | 'working_actor'
  | 'theatre_actor'
  | 'senior_artist'
  | 'child_artist'
  | 'teen_artist'
  | 'professional';

export type Gender = 'male' | 'female' | 'non_binary' | 'any';

export type KeralaDistrict =
  | 'Thiruvananthapuram'
  | 'Kollam'
  | 'Pathanamthitta'
  | 'Alappuzha'
  | 'Kottayam'
  | 'Idukki'
  | 'Ernakulam'
  | 'Thrissur'
  | 'Palakkad'
  | 'Malappuram'
  | 'Kozhikode'
  | 'Wayanad'
  | 'Kannur'
  | 'Kasaragod';

export type ProjectType =
  | 'film'
  | 'feature_film'
  | 'serial'
  | 'ott'
  | 'web_series'
  | 'micro_series'
  | 'short_film'
  | 'advertisement'
  | 'ad_film'
  | 'music_video'
  | 'documentary'
  | 'theatre'
  | 'youtube'
  | 'other';

export type ProjectStatus =
  | 'draft'
  | 'preproduction'
  | 'casting'
  | 'production'
  | 'completed'
  | 'archived';

export type CastingCallStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'closed'
  | 'rejected'
  | 'archived';

export type AdminStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ApplicationStatus =
  | 'applied'
  | 'viewed'
  | 'shortlisted'
  | 'audition'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type AuditionStatus =
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'submitted'
  | 'reviewed'
  | 'selected'
  | 'rejected';

export type AuditionType = 'in_person' | 'self_tape' | 'live_video' | 'callback';

export type MatchLevel = 'exact' | 'strong' | 'possible' | 'general';

export type NotificationType =
  | 'casting_exact_match'
  | 'casting_strong_match'
  | 'casting_match'
  | 'location_booking_update'
  | 'location_booking_confirmed'
  | 'location_saved_update'
  | 'application_received'
  | 'application_viewed'
  | 'shortlisted'
  | 'audition_invite'
  | 'selected'
  | 'rejected'
  | 'profile_approved'
  | 'profile_rejected'
  | 'production_verified'
  | 'casting_approved'
  | 'casting_rejected'
  | 'vendor_approved'
  | 'vendor_rejected'
  | 'admin_notice'
  | 'message_received';

export type ReportReason =
  | 'fake_casting'
  | 'fraud'
  | 'payment_scam'
  | 'harassment'
  | 'misleading_information'
  | 'inappropriate_content'
  | 'identity_issue'
  | 'spam'
  | 'other';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed' | 'pending' | 'investigating' | 'action_taken';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  username?: string;
  avatar_url?: string;
  phone_private: string;
  email_private: string;
  district: KeralaDistrict;
  city: string;
  is_active: boolean;
  is_verified: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface TalentProfile {
  id: string;
  user_id: string;
  stage_name?: string;
  date_of_birth: string;
  gender: Gender;
  actual_age: number;
  playing_age_min: number;
  playing_age_max: number;
  height_cm?: number;
  weight_kg?: number;
  bio: string;
  experience_level: ExperienceLevel;
  working_status: 'available' | 'shooting' | 'auditioning' | 'on_break';
  years_experience: number;
  primary_category: string;
  secondary_categories?: string[];
  current_project?: string;
  native_place: string;
  travel_willing: boolean;
  show_public_profile: boolean;
  admin_status: AdminStatus;
  verification_status: VerificationStatus;
  profile_completion_percent: number;
  created_at: string;
  updated_at: string;

  // Joined/denormalized relations
  user?: UserProfile;
  district?: KeralaDistrict;
  city?: string;
  is_child_artist?: boolean;
  guardian_name?: string;
  guardian_relationship?: string;
  showreel_url?: string;
  languages?: string[];
  skills?: string[];
  guardian?: GuardianProfile;
  experience?: TalentExperience[];
  media?: TalentMedia[];
}

export interface GuardianProfile {
  id: string;
  talent_user_id: string;
  guardian_name: string;
  relationship: string;
  guardian_phone_private: string;
  guardian_email_private: string;
  consent_confirmed: boolean;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface TalentExperience {
  id: string;
  talent_user_id: string;
  project_name: string;
  title?: string;
  director?: string;
  project_type: ProjectType;
  role_name: string;
  production_name: string;
  year: number;
  description?: string;
  verified: boolean;
}

export interface TalentMedia {
  id: string;
  talent_user_id: string;
  media_type: 'profile_photo' | 'gallery_photo' | 'introduction_video' | 'showreel' | 'acting_clip' | 'self_tape';
  url: string;
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  is_primary?: boolean;
  is_private?: boolean;
  created_at: string;
}

export interface ProductionProfile {
  id: string;
  user_id: string;
  professional_role: ProductionProfessionalRole;
  company_name: string;
  company_logo?: string;
  company_description: string;
  website?: string;
  instagram?: string;
  previous_projects?: string[];
  verification_status: VerificationStatus;
  admin_status: AdminStatus;
  company_address_private?: string;
  gst_or_registration_optional?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface Project {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  project_type: ProjectType;
  production_house: string;
  director_name: string;
  description: string;
  shoot_start_date?: string;
  shoot_end_date?: string;
  primary_location: string;
  status: ProjectStatus;
  visibility: 'public' | 'unlisted' | 'private';
  created_at: string;
  updated_at: string;
}

export interface CastingCall {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  description: string;
  application_deadline: string;
  status: CastingCallStatus;
  admin_status: AdminStatus;
  is_public: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  project?: Project;
  roles?: CastingRole[];
  creator_profile?: UserProfile;
  company_name?: string;
  has_safety_flag?: boolean;
  safety_flag_reasons?: string[];
}

export interface CastingRole {
  id: string;
  casting_call_id: string;
  role_name: string;
  role_description: string;
  gender_requirement: Gender;
  playing_age_min: number;
  playing_age_max: number;
  experience_requirement: ExperienceLevel | 'any';
  location_requirement?: string;
  language_requirement: string[];
  number_needed: number;
  paid_status: 'paid' | 'expenses_only' | 'unpaid';
  compensation_text?: string;
  shoot_location?: string;
  shoot_start_date?: string;
  shoot_end_date?: string;
  audition_type: AuditionType;
  showreel_required: boolean;
  self_tape_required: boolean;
  photo_required: boolean;
  special_notes?: string;
  status: 'open' | 'closed' | 'filled';
}

export interface CastingMatch {
  id: string;
  casting_role_id: string;
  talent_user_id: string;
  score: number;
  match_level: MatchLevel;
  age_score: number;
  gender_score: number;
  language_score: number;
  experience_score: number;
  location_score: number;
  skill_score: number;
  availability_score: number;
  preference_score: number;
  breakdown_notes?: string[];
  created_at: string;
  updated_at: string;

  // Joined
  role?: CastingRole;
  casting_call?: CastingCall;
  talent?: TalentProfile;
}

export interface Application {
  id: string;
  casting_role_id: string;
  talent_user_id: string;
  message: string;
  status: ApplicationStatus;
  submitted_at: string;
  viewed_at?: string;
  updated_at: string;
  self_tape_url?: string;
  acting_clip_url?: string;
  production_notes?: string; // Private to production

  // Relations
  role?: CastingRole;
  casting_call?: CastingCall;
  talent?: TalentProfile;
}

export interface Shortlist {
  id: string;
  owner_user_id: string;
  project_id?: string;
  name: string;
  description?: string;
  talent_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Audition {
  id: string;
  project_id: string;
  casting_role_id: string;
  talent_user_id: string;
  created_by: string;
  audition_type: AuditionType;
  date: string;
  time: string;
  location?: string;
  meeting_link?: string;
  instructions: string;
  script_file_url?: string;
  deadline?: string;
  status: AuditionStatus;
  talent_self_tape_url?: string;
  talent_notes?: string;
  created_at: string;
  updated_at: string;

  // Joined
  role?: CastingRole;
  project?: Project;
  talent?: TalentProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  entity_type?: 'casting_role' | 'casting_call' | 'application' | 'audition' | 'profile' | 'vendor' | 'location' | 'location_booking' | 'system';
  entity_id?: string;
  is_read: boolean;
  created_at: string;
  // Rich alert metadata
  match_score?: number;
  match_role_name?: string;
  match_project_name?: string;
  match_reasons?: string[];
  location_id?: string;
  location_name?: string;
  location_district?: string;
  location_image?: string;
  booking_ref?: string;
  booking_status?: 'confirmed' | 'permit_cleared' | 'caretaker_approved' | 'rescheduled' | 'quote_ready' | 'pending';
  shift_dates?: string;
  action_url?: string;
}

export interface Vendor {
  id: string;
  category_id: string;
  category_name: string;
  business_name: string;
  slug: string;
  contact_person: string;
  phone_private: string;
  email_private: string;
  district: KeralaDistrict;
  city: string;
  service_area: string;
  description: string;
  website?: string;
  instagram?: string;
  pricing_text: string;
  image_url?: string;
  verification_status: VerificationStatus;
  admin_status: AdminStatus;
  created_at: string;
  updated_at: string;
}

export type LocationCategoryType = 'indoor' | 'outdoor' | 'historical' | 'modern';

export interface ShootingLocation {
  id: string;
  title: string;
  slug: string;
  category_name: string;
  location_types?: LocationCategoryType[];
  district: KeralaDistrict;
  city: string;
  approximate_location: string;
  description: string;
  indoor_allowed: boolean;
  outdoor_allowed: boolean;
  night_shoot_allowed: boolean;
  parking_capacity: number;
  crew_capacity: number;
  power_available: boolean;
  changing_room: boolean;
  restroom: boolean;
  generator_access: boolean;
  pricing_text: string;
  owner_contact_private: string;
  admin_status: AdminStatus;
  verification_status: VerificationStatus;
  image_urls: string[];
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export type ProductionCrewRole =
  | 'Line Producer'
  | 'Production Controller'
  | 'Cinematographer (DoP)'
  | 'Art Director / Production Designer'
  | 'Location Manager / Scout'
  | 'Director'
  | 'Associate Director'
  | 'Sound Recordist / Sync Sound Engineer'
  | 'Gaffer / Chief Light Technician'
  | 'Other Crew';

export interface LocationReview {
  id: string;
  location_id: string;
  author_user_id: string;
  author_name: string;
  author_role: ProductionCrewRole | string;
  production_house?: string;
  project_title?: string;
  overall_rating: number; // 1 - 5 stars
  accessibility_rating: number; // 1 - 5 (heavy unit trucks, crane, generator access)
  power_backup_rating: number; // 1 - 5 (3-phase power, sync generator placement)
  amenities_rating: number; // 1 - 5 (green rooms, AC makeup, restrooms)
  noise_acoustics_rating: number; // 1 - 5 (ambient sound, sync-sound viability)
  caretaker_cooperation_rating: number; // 1 - 5 (panchayat liaison, gate access)
  shoot_date: string; // e.g. "August 2026"
  shoot_duration: string; // e.g. "5-Day Schedule", "3-Day Night Shift"
  review_text: string;
  pros: string[];
  cons: string[];
  recommend_to_crews: boolean;
  helpful_votes: number;
  voted_user_ids: string[];
  created_at: string;
  verified_production: boolean;
}

export interface LocationRatingSummary {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: Record<number, number>; // 1: n, 2: n, 3: n, 4: n, 5: n
  subRatings: {
    accessibility: number;
    power: number;
    amenities: number;
    acoustics: number;
    cooperation: number;
  };
  recommendPercentage: number;
}


export interface ContentReport {
  id: string;
  reporter_user_id: string;
  reporter_name: string;
  target_type: 'casting_call' | 'talent' | 'talent_profile' | 'production' | 'vendor' | 'other';
  target_id: string;
  target_title: string;
  reason: ReportReason;
  reason_category?: string;
  description: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  admin_name: string;
  action_type: string;
  target_type: string;
  target_id: string;
  reason: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type IndustryUpdateCategory = 
  | 'press_release' 
  | 'guild_directive' 
  | 'government_subsidy' 
  | 'trade_boxoffice' 
  | 'festival_awards';

export interface IndustryUpdate {
  id: string;
  title: string;
  category: IndustryUpdateCategory;
  source_organization: string;
  source_organization_short: string;
  official_reference_no: string;
  published_at: string;
  published_relative: string;
  summary: string;
  full_content: string;
  key_takeaways: string[];
  urgent?: boolean;
  signatory?: {
    name: string;
    designation: string;
  };
  image_url?: string;
  official_url?: string;
  verified: boolean;
  tags: string[];
}
