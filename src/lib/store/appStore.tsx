import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  TalentProfile,
  ProductionProfile,
  Project,
  CastingCall,
  CastingRole,
  Application,
  Shortlist,
  Audition,
  Notification,
  Vendor,
  ShootingLocation,
  ContentReport,
  AdminAuditLog,
  ApplicationStatus,
  AuditionStatus,
  ReportStatus,
  UserRole,
  KeralaDistrict,
} from '../../types';
import { DEMO_TALENTS } from '../data/talents';
import { DEMO_PRODUCTION_USERS, DEMO_PRODUCTION_PROFILES, DEMO_PROJECTS } from '../data/productions';
import { DEMO_CASTING_CALLS, DEMO_CASTING_ROLES } from '../data/castings';
import { DEMO_VENDORS, DEMO_LOCATIONS } from '../data/vendorsAndLocations';
import { checkCastingSafety } from '../matching/engine';

export interface RegisteredUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  subtitle: string;
  district: string;
  verified: boolean;
}

export interface AppContextType {
  // Auth state
  currentUser: UserProfile | null;
  currentTalent: TalentProfile | null;
  currentProduction: ProductionProfile | null;
  switchUserRole: (role: UserRole, targetId?: string) => void;
  switchRole: (role: UserRole, targetId?: string) => void;
  loginAs: (email: string, role?: UserRole) => boolean;
  loginUserById: (userId: string) => boolean;
  registerUser: (data: {
    full_name: string;
    email: string;
    phone?: string;
    role: UserRole;
    district?: KeralaDistrict;
    city?: string;
    stage_name?: string;
    company_name?: string;
    primary_category?: string;
    bio?: string;
  }) => { success: boolean; user: UserProfile; error?: string };
  logout: () => void;
  allRegisteredUsers: RegisteredUserItem[];

  // Data collections
  talents: TalentProfile[];
  productionProfiles: ProductionProfile[];
  productions: ProductionProfile[];
  projects: Project[];
  castingCalls: CastingCall[];
  castingRoles: CastingRole[];
  applications: Application[];
  shortlists: Shortlist[];
  auditions: Audition[];
  notifications: Notification[];
  vendors: Vendor[];
  locations: ShootingLocation[];
  reports: ContentReport[];
  auditLogs: AdminAuditLog[];

  // Mutations
  applyForRole: (roleId: string, message: string, selfTapeUrl?: string) => { success: boolean; error?: string };
  withdrawApplication: (applicationId: string) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, notes?: string) => void;
  createProject: (project: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  createCastingCall: (callData: Partial<CastingCall>, roles: Partial<CastingRole>[]) => { success: boolean; id: string };
  createVendor: (vendorData: Partial<Vendor>) => Vendor;
  createLocation: (locationData: Partial<ShootingLocation>) => ShootingLocation;
  createAudition: (auditionData: Partial<Audition>) => Audition;
  updateAuditionStatus: (auditionId: string, status: AuditionStatus, selfTapeUrl?: string, talentNotes?: string) => void;
  createShortlist: (name: string, talentIds: string[]) => Shortlist;
  toggleShortlistTalent: (shortlistId: string, talentId: string) => void;
  submitReport: (report: Partial<ContentReport>) => void;
  updateTalentProfile: (updates: Partial<TalentProfile>) => void;

  // Admin moderation
  approveTalent: (talentId: string) => void;
  rejectTalent: (talentId: string, reason: string) => void;
  verifyTalent: (talentId: string) => void;
  suspendTalent: (talentId: string, reason: string) => void;
  approveCastingCall: (callId: string) => void;
  rejectCastingCall: (callId: string, reason: string) => void;
  approveVendor: (vendorId: string) => void;
  rejectVendor: (vendorId: string, reason: string) => void;
  approveLocation: (locationId: string) => void;
  verifyProduction: (productionId: string) => void;
  resolveReport: (reportId: string, notes?: string) => void;
  dismissReport: (reportId: string) => void;
  updateReportStatus: (reportId: string, status: ReportStatus, notes?: string) => void;

  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Partial<Notification>) => Notification;
  deleteNotification: (id: string) => void;
  triggerNewCastingMatchAlert: () => void;
  triggerNewLocationBookingAlert: () => void;
  recordLocationBooking: (bookingData: {
    location: ShootingLocation;
    projectTitle: string;
    productionCompany: string;
    lineProducerName: string;
    shootStartDate: string;
    shootEndDate: string;
    shiftType: string;
    numberOfShifts: number;
    bookingRef: string;
  }) => void;
  unreadNotificationsCount: number;

  // Helpers
  calculateTalentProfileCompletion: (talent: TalentProfile) => number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'cast_kerala_db_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial Admin User
  const ADMIN_USER: UserProfile = {
    id: 'admin_1',
    role: 'admin',
    full_name: 'Kerala Film Chamber Admin',
    username: 'film_chamber_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop',
    phone_private: '+91 484 2367890',
    email_private: 'admin@castkerala.org',
    district: 'Ernakulam',
    city: 'Kochi',
    is_active: true,
    is_verified: true,
    last_active_at: new Date().toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  // State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('castkerala_active_user_id');
      if (saved === 'logged_out') {
        return null;
      }
      if (saved) {
        if (saved === 'admin_1') return ADMIN_USER;
        const prod = DEMO_PRODUCTION_USERS.find(p => p.id === saved);
        if (prod) return prod;
        const tal = DEMO_TALENTS.find(t => t.user_id === saved || t.user?.id === saved);
        if (tal?.user) return tal.user;
        const customUsers = JSON.parse(localStorage.getItem('castkerala_custom_users') || '[]');
        const custom = customUsers.find((u: UserProfile) => u.id === saved);
        if (custom) return custom;
      }
    } catch (e) {
      console.error('Failed reading session', e);
    }
    return DEMO_TALENTS[0].user || null;
  });
  const [talents, setTalents] = useState<TalentProfile[]>(DEMO_TALENTS);
  const [productionProfiles, setProductionProfiles] = useState<ProductionProfile[]>(DEMO_PRODUCTION_PROFILES);
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>(DEMO_CASTING_CALLS);
  const [castingRoles, setCastingRoles] = useState<CastingRole[]>(DEMO_CASTING_ROLES);
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'app_1',
      casting_role_id: 'role_1',
      talent_user_id: 'user_talent_1',
      message: 'I have deep classical dance training and have led an indie feature. Very excited about Fort Kochi backdrop!',
      status: 'shortlisted',
      submitted_at: '2026-08-20T10:00:00Z',
      viewed_at: '2026-08-21T14:00:00Z',
      updated_at: '2026-08-22T09:00:00Z',
      production_notes: 'Strong screen test, suitable for emotional arc in act 2.',
    },
    {
      id: 'app_2',
      casting_role_id: 'role_2',
      talent_user_id: 'user_talent_2',
      message: 'Method actor with police procedural experience in Kadha Parayumbol S2. Ready for physical stunts.',
      status: 'audition',
      submitted_at: '2026-08-21T11:30:00Z',
      viewed_at: '2026-08-22T08:00:00Z',
      updated_at: '2026-08-23T11:00:00Z',
      production_notes: 'Invited for live audition on Sept 25.',
    },
    {
      id: 'app_3',
      casting_role_id: 'role_4',
      talent_user_id: 'user_talent_4',
      message: 'Guardian approved application for Master Niranjan. Experience in 2 feature films.',
      status: 'applied',
      submitted_at: '2026-08-25T15:00:00Z',
      updated_at: '2026-08-25T15:00:00Z',
    },
  ]);
  const [shortlists, setShortlists] = useState<Shortlist[]>([
    {
      id: 'short_1',
      owner_user_id: 'prod_user_1',
      project_id: 'proj_1',
      name: 'Kochi Blue Lead Finalists',
      description: 'Top contenders for Anjali and Inspector roles',
      talent_ids: ['user_talent_1', 'user_talent_6', 'user_talent_2'],
      created_at: '2026-08-22T00:00:00Z',
      updated_at: '2026-08-22T00:00:00Z',
    },
  ]);
  const [auditions, setAuditions] = useState<Audition[]>([
    {
      id: 'aud_1',
      project_id: 'proj_1',
      casting_role_id: 'role_2',
      talent_user_id: 'user_talent_2',
      created_by: 'prod_user_1',
      audition_type: 'in_person',
      date: '2026-10-02',
      time: '11:00 AM',
      location: 'Anwar Rasheed Entertainments, Kaloor Studio, Kochi',
      instructions: 'Please prepare scenes 14 and 15 (Inspector Kurian interrogation). Script attached.',
      script_file_url: 'https://example.com/scripts/kochi_blue_scene14.pdf',
      status: 'accepted',
      created_at: '2026-08-23T00:00:00Z',
      updated_at: '2026-08-24T00:00:00Z',
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif_match_1',
      user_id: 'user_talent_1',
      type: 'casting_exact_match',
      title: 'New 96% Match: Mohiniyattam Lead in "Malabar Monsoon"',
      body: 'Friday Film House published a featured character role matching your classical dance training, age range (20-28), and Ernakulam location preference.',
      entity_type: 'casting_role',
      entity_id: 'role_1',
      match_score: 96,
      match_role_name: 'Anjali (Lead Character)',
      match_project_name: 'Malabar Monsoon',
      match_reasons: ['Age bracket (20-28) matched', 'Classical Mohiniyattam skills verified', 'Malayalam native speaker', 'Shoot location: Kochi / Alappuzha'],
      action_url: '/casting',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'notif_loc_1',
      user_id: 'user_talent_1',
      type: 'location_booking_confirmed',
      title: 'Caretaker Approved: Varikkasseri Mana Nalukettu',
      body: 'Booking request (REF: CK-BK-749210) for 3-day filming shift has been approved by Mana Trust caretaker Sri Narayanan. 3-phase generator access cleared.',
      entity_type: 'location_booking',
      entity_id: 'loc_1',
      location_id: 'loc_1',
      location_name: 'Varikkasseri Mana Traditional Nalukettu',
      location_district: 'Palakkad (Ottapalam)',
      location_image: 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?auto=format&fit=crop&w=600&q=85',
      booking_ref: 'CK-BK-749210',
      booking_status: 'caretaker_approved',
      shift_dates: 'Oct 15 - Oct 18, 2026 (3 Day Shifts)',
      action_url: '/locations',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    },
    {
      id: 'notif_match_2',
      user_id: 'user_talent_1',
      type: 'casting_strong_match',
      title: 'New 88% Match: University Lecturer in "Campus Diaries"',
      body: 'Anto Joseph Film Company opened auditions for a dialogue-heavy lecturer role matching your theatre background and Malayalam diction.',
      entity_type: 'casting_role',
      entity_id: 'role_3',
      match_score: 88,
      match_role_name: 'Prof. Maya Nambiar',
      match_project_name: 'Campus Diaries',
      match_reasons: ['Playing age 26-34 matched', 'Formal Malayalam dialogue delivery', 'Self-tape accepted online'],
      action_url: '/casting',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'notif_loc_2',
      user_id: 'user_talent_1',
      type: 'location_booking_update',
      title: 'Night Shoot Permit Cleared: Kuttanad Lakefront Tharavadu',
      body: 'Night shooting and heavy floodlight permit approved by Alappuzha District Police & Port Officer (REF: CK-BK-829314) for your saved location booking.',
      entity_type: 'location_booking',
      entity_id: 'loc_4',
      location_id: 'loc_4',
      location_name: 'Kuttanad Lakefront Backwater Tharavadu',
      location_district: 'Alappuzha (Champakulam)',
      location_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=85',
      booking_ref: 'CK-BK-829314',
      booking_status: 'permit_cleared',
      shift_dates: 'Nov 02 - Nov 05, 2026 (Night Shifts)',
      action_url: '/locations',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'notif_1',
      user_id: 'user_talent_1',
      type: 'shortlisted',
      title: 'Shortlisted for Kochi Blue Chronicles',
      body: 'Anwar Rasheed Entertainments shortlisted you for the role of Anjali (Lead Character).',
      entity_type: 'application',
      entity_id: 'app_1',
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'notif_prod_1',
      user_id: 'prod_user_1',
      type: 'location_booking_confirmed',
      title: 'Location Shift Confirmed: Varikkasseri Mana',
      body: 'Advance shift booking (REF: CK-BK-749210) confirmed for project "Kochi Blue Chronicles" with Mana Trust.',
      entity_type: 'location_booking',
      entity_id: 'loc_1',
      location_id: 'loc_1',
      location_name: 'Varikkasseri Mana Traditional Nalukettu',
      location_district: 'Palakkad (Ottapalam)',
      location_image: 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?auto=format&fit=crop&w=600&q=85',
      booking_ref: 'CK-BK-749210',
      booking_status: 'confirmed',
      shift_dates: 'Oct 15 - Oct 18, 2026',
      action_url: '/locations',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'notif_prod_2',
      user_id: 'prod_user_1',
      type: 'casting_match',
      title: 'New Audition Submission: Inspector Thomas Kurian',
      body: '2 new matching talent profiles submitted self-tapes for review with 90%+ fit.',
      entity_type: 'casting_role',
      entity_id: 'role_2',
      match_score: 92,
      match_role_name: 'Inspector Thomas Kurian',
      match_project_name: 'Kochi Blue Chronicles',
      action_url: '/casting',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'notif_3',
      user_id: 'user_talent_2',
      type: 'audition_invite',
      title: 'Audition Call: Inspector Thomas Kurian',
      body: 'You have been invited for an in-person audition at Kaloor Studio on Oct 2nd.',
      entity_type: 'audition',
      entity_id: 'aud_1',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);
  const [vendors, setVendors] = useState<Vendor[]>(DEMO_VENDORS);
  const [locations, setLocations] = useState<ShootingLocation[]>(DEMO_LOCATIONS);
  const [reports, setReports] = useState<ContentReport[]>([
    {
      id: 'rep_1',
      reporter_user_id: 'user_talent_10',
      reporter_name: 'Sneha Susan',
      target_type: 'casting_call',
      target_id: 'call_fake_sample',
      target_title: 'Unverified Ad Shoot in Thrissur',
      reason: 'payment_scam',
      description: 'The poster sent an unauthorized WhatsApp message requesting ₹1,500 registration deposit before script dispatch.',
      status: 'open',
      created_at: '2026-08-25T00:00:00Z',
      updated_at: '2026-08-25T00:00:00Z',
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([
    {
      id: 'log_1',
      admin_user_id: 'admin_1',
      admin_name: 'Kerala Film Chamber Admin',
      action_type: 'APPROVE_CASTING_CALL',
      target_type: 'casting_call',
      target_id: 'call_1',
      reason: 'Verified production credentials with Kerala Film Producers Association',
      created_at: '2026-08-15T00:00:00Z',
    },
    {
      id: 'log_2',
      admin_user_id: 'admin_1',
      admin_name: 'Kerala Film Chamber Admin',
      action_type: 'VERIFY_TALENT',
      target_type: 'talent_profile',
      target_id: 'talent_1',
      reason: 'Verified previous screen work and theatre credential submissions',
      created_at: '2026-08-16T00:00:00Z',
    },
  ]);

  // Derive Current Talent Profile / Production Profile
  const currentTalent = talents.find(t => t.user_id === currentUser?.id) || null;
  const currentProduction = productionProfiles.find(p => p.user_id === currentUser?.id) || null;

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter(
    n => n.user_id === currentUser?.id && !n.is_read
  ).length;

  // Profile completion calculator
  const calculateTalentProfileCompletion = (talent: TalentProfile): number => {
    let score = 0;
    if (talent.user?.full_name && talent.date_of_birth && talent.gender) score += 20; // Basic
    if (talent.playing_age_min && talent.playing_age_max) score += 15; // Playing age
    if (talent.primary_category) score += 10; // Category
    if (talent.languages && talent.languages.length > 0) score += 10; // Languages
    if (talent.skills && talent.skills.length > 0) score += 10; // Skills
    if (talent.experience && talent.experience.length > 0) score += 10; // Experience
    if (talent.user?.avatar_url) score += 10; // Photo
    if (talent.bio && talent.bio.length > 50) score += 5; // Bio
    if (talent.media && talent.media.length > 0) score += 5; // Media
    if (talent.working_status) score += 5; // Availability
    return Math.min(100, score);
  };

  // Sync active user session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('castkerala_active_user_id', currentUser.id);
      } else {
        localStorage.setItem('castkerala_active_user_id', 'logged_out');
      }
    } catch (e) {
      console.error('Failed to persist session to localStorage', e);
    }
  }, [currentUser]);

  // All switchable registered users across Mollywood
  const allRegisteredUsers = useMemo<RegisteredUserItem[]>(() => {
    const list: RegisteredUserItem[] = [];

    // 1. Admin Desk
    list.push({
      id: ADMIN_USER.id,
      name: ADMIN_USER.full_name,
      email: ADMIN_USER.email_private,
      role: 'admin',
      avatar: ADMIN_USER.avatar_url || '',
      subtitle: 'KFPA & FEFKA Regulatory Desk • State Safety Cell',
      district: `${ADMIN_USER.city}, ${ADMIN_USER.district}`,
      verified: true,
    });

    // 2. Production Houses & Casting Directors
    DEMO_PRODUCTION_USERS.forEach(prod => {
      const profile = productionProfiles.find(p => p.user_id === prod.id);
      list.push({
        id: prod.id,
        name: prod.full_name,
        email: prod.email_private,
        role: 'production',
        avatar: prod.avatar_url || '',
        subtitle: profile?.company_name || 'Production Studio / Casting Office',
        district: `${prod.city}, ${prod.district}`,
        verified: prod.is_verified,
      });
    });

    // 3. Talents / Artists
    talents.forEach(tal => {
      if (!tal.user) return;
      list.push({
        id: tal.user.id,
        name: tal.stage_name || tal.user.full_name,
        email: tal.user.email_private,
        role: 'talent',
        avatar: tal.user.avatar_url || '',
        subtitle: `${tal.primary_category} • ${tal.experience_level?.replace('_', ' ')} • Age ${tal.actual_age || `${tal.playing_age_min}-${tal.playing_age_max}`}`,
        district: `${tal.user.city || 'Kochi'}, ${tal.user.district || 'Ernakulam'}`,
        verified: tal.verification_status === 'verified',
      });
    });

    // 4. Custom Registered Users (if any in localStorage)
    try {
      const customUsers: UserProfile[] = JSON.parse(localStorage.getItem('castkerala_custom_users') || '[]');
      customUsers.forEach(custom => {
        if (!list.some(item => item.id === custom.id)) {
          list.push({
            id: custom.id,
            name: custom.full_name,
            email: custom.email_private,
            role: custom.role,
            avatar: custom.avatar_url || '',
            subtitle: `Custom ${custom.role === 'talent' ? 'Artist' : custom.role === 'production' ? 'Production Studio' : 'Admin'} Profile`,
            district: `${custom.city}, ${custom.district}`,
            verified: custom.is_verified,
          });
        }
      });
    } catch (e) {}

    return list;
  }, [talents, productionProfiles]);

  // Switch role / demo account
  const switchUserRole = (role: UserRole, targetId?: string) => {
    if (role === 'admin') {
      setCurrentUser(ADMIN_USER);
    } else if (role === 'production') {
      const prod = targetId 
        ? DEMO_PRODUCTION_USERS.find(p => p.id === targetId) || DEMO_PRODUCTION_USERS[0]
        : DEMO_PRODUCTION_USERS[0];
      setCurrentUser(prod);
    } else {
      const tal = targetId 
        ? talents.find(t => t.user_id === targetId)?.user || talents[0].user
        : talents[0].user;
      setCurrentUser(tal || null);
    }
  };

  const loginUserById = (userId: string): boolean => {
    if (userId === ADMIN_USER.id) {
      setCurrentUser(ADMIN_USER);
      return true;
    }
    const prod = DEMO_PRODUCTION_USERS.find(p => p.id === userId);
    if (prod) {
      setCurrentUser(prod);
      return true;
    }
    const tal = talents.find(t => t.user_id === userId || t.user?.id === userId);
    if (tal?.user) {
      setCurrentUser(tal.user);
      return true;
    }
    try {
      const customUsers: UserProfile[] = JSON.parse(localStorage.getItem('castkerala_custom_users') || '[]');
      const custom = customUsers.find(u => u.id === userId);
      if (custom) {
        setCurrentUser(custom);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const loginAs = (email: string, role?: UserRole): boolean => {
    const normalized = email.trim().toLowerCase();

    // Check admin
    if (
      normalized === 'admin@castkerala.org' || 
      normalized === 'admin.safety@castkerala.com' || 
      normalized === 'admin' ||
      role === 'admin'
    ) {
      setCurrentUser(ADMIN_USER);
      return true;
    }

    // Check production users by email
    const foundProd = DEMO_PRODUCTION_USERS.find(p => p.email_private.toLowerCase() === normalized);
    if (foundProd) {
      setCurrentUser(foundProd);
      return true;
    }

    // Check talents by email
    const foundTal = talents.find(t => t.user?.email_private.toLowerCase() === normalized);
    if (foundTal?.user) {
      setCurrentUser(foundTal.user);
      return true;
    }

    // Check custom registered users by email
    try {
      const customUsers: UserProfile[] = JSON.parse(localStorage.getItem('castkerala_custom_users') || '[]');
      const custom = customUsers.find(u => u.email_private.toLowerCase() === normalized);
      if (custom) {
        setCurrentUser(custom);
        return true;
      }
    } catch (e) {}

    // Check by name / stage name partial match
    const foundByName = talents.find(t => 
      (t.stage_name && t.stage_name.toLowerCase().includes(normalized)) ||
      (t.user && t.user.full_name.toLowerCase().includes(normalized))
    );
    if (foundByName?.user) {
      setCurrentUser(foundByName.user);
      return true;
    }

    const foundProdByName = DEMO_PRODUCTION_USERS.find(p =>
      p.full_name.toLowerCase().includes(normalized) ||
      p.username?.toLowerCase().includes(normalized)
    );
    if (foundProdByName) {
      setCurrentUser(foundProdByName);
      return true;
    }

    // Fallbacks if a role was explicitly provided
    if (role === 'production') {
      setCurrentUser(DEMO_PRODUCTION_USERS[0]);
      return true;
    } else if (role === 'talent') {
      if (talents[0]?.user) {
        setCurrentUser(talents[0].user);
        return true;
      }
    }

    // If still not found, default to first talent
    if (talents[0]?.user) {
      setCurrentUser(talents[0].user);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.setItem('castkerala_active_user_id', 'logged_out');
    } catch (e) {}
  };

  const registerUser = (data: {
    full_name: string;
    email: string;
    phone?: string;
    role: UserRole;
    district?: KeralaDistrict;
    city?: string;
    stage_name?: string;
    company_name?: string;
    primary_category?: string;
    bio?: string;
  }) => {
    const newUserId = `user_${data.role}_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      role: data.role,
      full_name: data.full_name,
      username: data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&crop=face`,
      phone_private: data.phone || '+91 94470 11223',
      email_private: data.email,
      district: data.district || 'Ernakulam',
      city: data.city || 'Kochi',
      is_active: true,
      is_verified: true,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (data.role === 'talent') {
      const newTalent: TalentProfile = {
        id: `talent_${Date.now()}`,
        user_id: newUserId,
        stage_name: data.stage_name || data.full_name,
        date_of_birth: '1998-05-15',
        gender: 'male',
        actual_age: 28,
        playing_age_min: 22,
        playing_age_max: 34,
        height_cm: 172,
        weight_kg: 68,
        bio: data.bio || 'Experienced artist ready for feature films, serials, and OTT productions in Malayalam cinema.',
        experience_level: 'working_actor',
        working_status: 'available',
        years_experience: 3,
        primary_category: data.primary_category || 'Actor',
        secondary_categories: ['Dubbing Artist'],
        native_place: `${data.city || 'Kochi'}, ${data.district || 'Ernakulam'}`,
        travel_willing: true,
        show_public_profile: true,
        admin_status: 'approved',
        verification_status: 'verified',
        profile_completion_percent: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        languages: ['Malayalam (Native)', 'English'],
        skills: ['Method Acting', 'Dialogue Modulation', 'Action/Stunts'],
        user: newUser,
      };
      setTalents(prev => [newTalent, ...prev]);
    } else if (data.role === 'production') {
      const newProd: ProductionProfile = {
        id: `prod_${Date.now()}`,
        user_id: newUserId,
        professional_role: 'producer',
        company_name: data.company_name || `${data.full_name} Productions`,
        company_description: data.bio || 'Active film and media production banner in Kerala cinema.',
        website: 'https://castkerala.org',
        verification_status: 'verified',
        admin_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: newUser,
      };
      setProductionProfiles(prev => [newProd, ...prev]);
    }

    try {
      const customUsers: UserProfile[] = JSON.parse(localStorage.getItem('castkerala_custom_users') || '[]');
      customUsers.push(newUser);
      localStorage.setItem('castkerala_custom_users', JSON.stringify(customUsers));
    } catch (e) {}

    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // Application Actions
  const applyForRole = (roleId: string, message: string, selfTapeUrl?: string) => {
    if (!currentUser) return { success: false, error: 'Please log in to apply' };
    if (currentUser.role !== 'talent') return { success: false, error: 'Only talent accounts can apply for roles' };

    // Duplicate prevention
    const existing = applications.find(
      a => a.casting_role_id === roleId && a.talent_user_id === currentUser.id && a.status !== 'withdrawn'
    );
    if (existing) {
      return { success: false, error: 'You have already applied for this role' };
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      casting_role_id: roleId,
      talent_user_id: currentUser.id,
      message,
      status: 'applied',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      self_tape_url: selfTapeUrl,
    };

    setApplications(prev => [newApp, ...prev]);

    // Send notification to production owner
    const role = castingRoles.find(r => r.id === roleId);
    const call = castingCalls.find(c => c.id === role?.casting_call_id);
    if (call) {
      const notif: Notification = {
        id: `notif_${Date.now()}`,
        user_id: call.created_by,
        type: 'application_received',
        title: `New Application: ${role?.role_name}`,
        body: `${currentUser.full_name} submitted an application for ${role?.role_name}.`,
        entity_type: 'application',
        entity_id: newApp.id,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return { success: true };
  };

  const withdrawApplication = (applicationId: string) => {
    setApplications(prev =>
      prev.map(a => (a.id === applicationId ? { ...a, status: 'withdrawn', updated_at: new Date().toISOString() } : a))
    );
  };

  const updateApplicationStatus = (applicationId: string, status: ApplicationStatus, notes?: string) => {
    setApplications(prev =>
      prev.map(a => {
        if (a.id === applicationId) {
          const updated: Application = {
            ...a,
            status,
            updated_at: new Date().toISOString(),
            viewed_at: a.viewed_at || new Date().toISOString(),
            production_notes: notes !== undefined ? notes : a.production_notes,
          };

          // Notify talent
          const notifType = status === 'shortlisted' ? 'shortlisted' : status === 'selected' ? 'selected' : status === 'rejected' ? 'rejected' : 'application_viewed';
          const notif: Notification = {
            id: `notif_${Date.now()}`,
            user_id: a.talent_user_id,
            type: notifType as any,
            title: `Application Status: ${status.toUpperCase()}`,
            body: `Your application status has been updated to "${status}".`,
            entity_type: 'application',
            entity_id: a.id,
            is_read: false,
            created_at: new Date().toISOString(),
          };
          setNotifications(n => [notif, ...n]);

          return updated;
        }
        return a;
      })
    );
  };

  // Projects & Casting Calls
  const createProject = (projectData: Partial<Project>): Project => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      owner_user_id: currentUser?.id || 'prod_user_1',
      name: projectData.name || 'Untitled Project',
      slug: (projectData.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      project_type: projectData.project_type || 'film',
      production_house: projectData.production_house || 'Independent Banner',
      director_name: projectData.director_name || 'Director',
      description: projectData.description || '',
      primary_location: projectData.primary_location || 'Kochi, Kerala',
      status: projectData.status || 'preproduction',
      visibility: projectData.visibility || 'public',
      shoot_start_date: projectData.shoot_start_date,
      shoot_end_date: projectData.shoot_end_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)));
  };

  const createCastingCall = (callData: Partial<CastingCall>, roles: Partial<CastingRole>[]) => {
    const callId = `call_${Date.now()}`;
    const safetyCheck = checkCastingSafety((callData.description || '') + ' ' + (callData.title || ''));

    const newCall: CastingCall = {
      id: callId,
      project_id: callData.project_id || projects[0]?.id || 'proj_1',
      created_by: currentUser?.id || 'prod_user_1',
      title: callData.title || 'New Casting Call',
      description: callData.description || '',
      application_deadline: callData.application_deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'published',
      admin_status: safetyCheck.isFlagged ? 'pending' : 'approved',
      is_public: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company_name: currentProduction?.company_name || 'Production Banner',
      has_safety_flag: safetyCheck.isFlagged,
      safety_flag_reasons: safetyCheck.reasons,
    };

    const newRoles: CastingRole[] = roles.map((r, i) => ({
      id: `role_${Date.now()}_${i}`,
      casting_call_id: callId,
      role_name: r.role_name || 'Character Role',
      role_description: r.role_description || '',
      gender_requirement: r.gender_requirement || 'any',
      playing_age_min: r.playing_age_min || 20,
      playing_age_max: r.playing_age_max || 30,
      experience_requirement: r.experience_requirement || 'any',
      location_requirement: r.location_requirement || 'Kerala',
      language_requirement: r.language_requirement || ['Malayalam (Native)'],
      number_needed: r.number_needed || 1,
      paid_status: r.paid_status || 'paid',
      compensation_text: r.compensation_text || 'Standard industry scale',
      shoot_location: r.shoot_location || 'Kerala',
      audition_type: r.audition_type || 'in_person',
      showreel_required: Boolean(r.showreel_required),
      self_tape_required: Boolean(r.self_tape_required),
      photo_required: true,
      special_notes: r.special_notes,
      status: 'open',
    }));

    setCastingCalls(prev => [newCall, ...prev]);
    setCastingRoles(prev => [...newRoles, ...prev]);

    return { success: true, id: callId };
  };

  const createVendor = (vendorData: Partial<Vendor>): Vendor => {
    const newVendor: Vendor = {
      id: `vend_${Date.now()}`,
      category_id: (vendorData.category_name || 'Other').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      category_name: vendorData.category_name || 'Production Assistance',
      business_name: vendorData.business_name || 'New Vendor Services',
      slug: (vendorData.business_name || 'new-vendor').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      contact_person: vendorData.contact_person || 'Contact',
      phone_private: vendorData.phone_private || '',
      email_private: vendorData.email_private || '',
      district: vendorData.district || 'Ernakulam',
      city: vendorData.city || 'Kochi',
      service_area: vendorData.service_area || 'Kerala',
      description: vendorData.description || '',
      pricing_text: vendorData.pricing_text || 'Competitive package',
      image_url: vendorData.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&fit=crop',
      verification_status: 'pending',
      admin_status: 'pending', // Requires admin approval
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setVendors(prev => [newVendor, ...prev]);
    return newVendor;
  };

  const createLocation = (locationData: Partial<ShootingLocation>): ShootingLocation => {
    const newLoc: ShootingLocation = {
      id: `loc_${Date.now()}`,
      title: locationData.title || 'Shooting Location',
      slug: (locationData.title || 'location').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_name: locationData.category_name || 'House',
      district: locationData.district || 'Ernakulam',
      city: locationData.city || 'Kochi',
      approximate_location: locationData.approximate_location || 'Kochi',
      description: locationData.description || '',
      indoor_allowed: locationData.indoor_allowed ?? true,
      outdoor_allowed: locationData.outdoor_allowed ?? true,
      night_shoot_allowed: locationData.night_shoot_allowed ?? false,
      parking_capacity: locationData.parking_capacity || 10,
      crew_capacity: locationData.crew_capacity || 50,
      power_available: locationData.power_available ?? true,
      changing_room: locationData.changing_room ?? true,
      restroom: locationData.restroom ?? true,
      generator_access: locationData.generator_access ?? true,
      pricing_text: locationData.pricing_text || '₹25,000 / day',
      owner_contact_private: locationData.owner_contact_private || '',
      admin_status: 'pending',
      verification_status: 'pending',
      image_urls: locationData.image_urls || ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&fit=crop'],
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocations(prev => [newLoc, ...prev]);
    return newLoc;
  };

  const createAudition = (auditionData: Partial<Audition>): Audition => {
    const newAud: Audition = {
      id: `aud_${Date.now()}`,
      project_id: auditionData.project_id || projects[0]?.id || 'proj_1',
      casting_role_id: auditionData.casting_role_id || castingRoles[0]?.id || 'role_1',
      talent_user_id: auditionData.talent_user_id || 'user_talent_1',
      created_by: currentUser?.id || 'prod_user_1',
      audition_type: auditionData.audition_type || 'in_person',
      date: auditionData.date || new Date().toISOString().split('T')[0],
      time: auditionData.time || '10:00 AM',
      location: auditionData.location,
      meeting_link: auditionData.meeting_link,
      instructions: auditionData.instructions || 'Audition scene test',
      script_file_url: auditionData.script_file_url,
      status: 'invited',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAuditions(prev => [newAud, ...prev]);

    // Send notification to talent
    const notif: Notification = {
      id: `notif_${Date.now()}`,
      user_id: newAud.talent_user_id,
      type: 'audition_invite',
      title: 'New Audition Invitation',
      body: `You have been invited for an audition on ${newAud.date} at ${newAud.time}.`,
      entity_type: 'audition',
      entity_id: newAud.id,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    return newAud;
  };

  const updateAuditionStatus = (auditionId: string, status: AuditionStatus, selfTapeUrl?: string, talentNotes?: string) => {
    setAuditions(prev =>
      prev.map(aud => {
        if (aud.id === auditionId) {
          return {
            ...aud,
            status,
            talent_self_tape_url: selfTapeUrl || aud.talent_self_tape_url,
            talent_notes: talentNotes || aud.talent_notes,
            updated_at: new Date().toISOString(),
          };
        }
        return aud;
      })
    );
  };

  const createShortlist = (name: string, talentIds: string[]): Shortlist => {
    const newShort: Shortlist = {
      id: `short_${Date.now()}`,
      owner_user_id: currentUser?.id || 'prod_user_1',
      project_id: projects[0]?.id,
      name,
      talent_ids: talentIds,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setShortlists(prev => [newShort, ...prev]);
    return newShort;
  };

  const toggleShortlistTalent = (shortlistId: string, talentId: string) => {
    setShortlists(prev =>
      prev.map(s => {
        if (s.id === shortlistId) {
          const exists = s.talent_ids.includes(talentId);
          return {
            ...s,
            talent_ids: exists ? s.talent_ids.filter(id => id !== talentId) : [...s.talent_ids, talentId],
            updated_at: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  const submitReport = (report: Partial<ContentReport>) => {
    const newRep: ContentReport = {
      id: `rep_${Date.now()}`,
      reporter_user_id: currentUser?.id || 'anon_user',
      reporter_name: currentUser?.full_name || 'Anonymous User',
      target_type: report.target_type || 'casting_call',
      target_id: report.target_id || '',
      target_title: report.target_title || 'Reported Content',
      reason: report.reason || 'other',
      description: report.description || '',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReports(prev => [newRep, ...prev]);
  };

  const updateTalentProfile = (updates: Partial<TalentProfile>) => {
    if (!currentUser) return;
    setTalents(prev =>
      prev.map(t => {
        if (t.user_id === currentUser.id) {
          const updated = { ...t, ...updates, updated_at: new Date().toISOString() };
          updated.profile_completion_percent = calculateTalentProfileCompletion(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Admin Moderation
  const logAdminAction = (action: string, type: string, targetId: string, reason: string) => {
    const log: AdminAuditLog = {
      id: `log_${Date.now()}`,
      admin_user_id: currentUser?.id || 'admin_1',
      admin_name: currentUser?.full_name || 'Admin',
      action_type: action,
      target_type: type,
      target_id: targetId,
      reason,
      created_at: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const approveTalent = (talentId: string) => {
    setTalents(prev => prev.map(t => (t.id === talentId ? { ...t, admin_status: 'approved' } : t)));
    logAdminAction('APPROVE_TALENT', 'talent_profile', talentId, 'Verified credentials approved by moderation team.');
  };

  const rejectTalent = (talentId: string, reason: string) => {
    setTalents(prev => prev.map(t => (t.id === talentId ? { ...t, admin_status: 'rejected' } : t)));
    logAdminAction('REJECT_TALENT', 'talent_profile', talentId, reason);
  };

  const verifyTalent = (talentId: string) => {
    setTalents(prev =>
      prev.map(t => (t.id === talentId ? { ...t, verification_status: 'verified', user: t.user ? { ...t.user, is_verified: true } : t.user } : t))
    );
    logAdminAction('VERIFY_TALENT', 'talent_profile', talentId, 'Official identity & verified prior work verified.');
  };

  const suspendTalent = (talentId: string, reason: string) => {
    setTalents(prev => prev.map(t => (t.id === talentId ? { ...t, admin_status: 'suspended' } : t)));
    logAdminAction('SUSPEND_TALENT', 'talent_profile', talentId, reason);
  };

  const approveCastingCall = (callId: string) => {
    setCastingCalls(prev => prev.map(c => (c.id === callId ? { ...c, admin_status: 'approved', has_safety_flag: false } : c)));
    logAdminAction('APPROVE_CASTING_CALL', 'casting_call', callId, 'Casting notice reviewed and cleared for broadcast.');
  };

  const rejectCastingCall = (callId: string, reason: string) => {
    setCastingCalls(prev => prev.map(c => (c.id === callId ? { ...c, admin_status: 'rejected' } : c)));
    logAdminAction('REJECT_CASTING_CALL', 'casting_call', callId, reason);
  };

  const approveVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => (v.id === vendorId ? { ...v, admin_status: 'approved', verification_status: 'verified' } : v)));
    logAdminAction('APPROVE_VENDOR', 'vendor', vendorId, 'Vendor service registered and verified.');
  };

  const rejectVendor = (vendorId: string, reason: string) => {
    setVendors(prev => prev.map(v => (v.id === vendorId ? { ...v, admin_status: 'rejected' } : v)));
    logAdminAction('REJECT_VENDOR', 'vendor', vendorId, reason);
  };

  const approveLocation = (locationId: string) => {
    setLocations(prev => prev.map(l => (l.id === locationId ? { ...l, admin_status: 'approved', verification_status: 'verified' } : l)));
    logAdminAction('APPROVE_LOCATION', 'shooting_location', locationId, 'Location vetted and verified for production shoots.');
  };

  const verifyProduction = (productionId: string) => {
    setProductionProfiles(prev =>
      prev.map(p => (p.id === productionId ? { ...p, verification_status: 'verified', admin_status: 'approved' } : p))
    );
    logAdminAction('VERIFY_PRODUCTION', 'production_profile', productionId, 'Production banner verified with registration proof.');
  };

  const updateReportStatus = (reportId: string, status: ReportStatus, notes?: string) => {
    setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status, admin_notes: notes || r.admin_notes } : r)));
    logAdminAction('UPDATE_REPORT', 'report', reportId, notes || `Report status updated to ${status}`);
  };

  const resolveReport = (reportId: string, notes?: string) => {
    setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: 'resolved', admin_notes: notes || 'Reviewed and resolved' } : r)));
    logAdminAction('RESOLVE_REPORT', 'report', reportId, notes || 'Action taken and resolved');
  };

  const dismissReport = (reportId: string) => {
    setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: 'dismissed' } : r)));
    logAdminAction('DISMISS_REPORT', 'report', reportId, 'Report dismissed as non-violating');
  };

  // Notification Helpers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => (n.user_id === currentUser.id ? { ...n, is_read: true } : n)));
  };

  const addNotification = (notifData: Partial<Notification>): Notification => {
    const newNotif: Notification = {
      id: notifData.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: notifData.user_id || currentUser?.id || 'user_talent_1',
      type: notifData.type || 'admin_notice',
      title: notifData.title || 'New Notification',
      body: notifData.body || '',
      entity_type: notifData.entity_type,
      entity_id: notifData.entity_id,
      is_read: false,
      created_at: notifData.created_at || new Date().toISOString(),
      match_score: notifData.match_score,
      match_role_name: notifData.match_role_name,
      match_project_name: notifData.match_project_name,
      match_reasons: notifData.match_reasons,
      location_id: notifData.location_id,
      location_name: notifData.location_name,
      location_district: notifData.location_district,
      location_image: notifData.location_image,
      booking_ref: notifData.booking_ref,
      booking_status: notifData.booking_status,
      shift_dates: notifData.shift_dates,
      action_url: notifData.action_url,
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const triggerNewCastingMatchAlert = () => {
    const matchRoles = [
      {
        title: 'New 98% Match: Mohiniyattam Classical Dancer',
        project: 'Katha Parayumbol S2',
        role: 'Malavika (Lead Dancer)',
        body: 'Aashirvad Cinemas released a high-priority audition matching your classical dance training, age (20-28), and Kochi shoot base.',
        score: 98,
        reasons: ['Age bracket (20-28) matched', 'Classical Mohiniyattam verified', 'Immediate screen test schedule'],
      },
      {
        title: 'New 94% Match: Investigative Crime Reporter',
        project: 'Fort Kochi Midnight Chronicles',
        role: 'Rhea Kurian (Journalist)',
        body: 'Friday Film House opened audition call for an investigative reporter requiring strong Malayalam dialogue delivery and screen presence.',
        score: 94,
        reasons: ['Fluent Malayalam diction', 'Playing age 24-32 matched', 'Self-tape submission enabled'],
      },
      {
        title: 'New 91% Match: Heritage Family Daughter',
        project: 'Valluvanad Vasantham',
        role: 'Kalyani',
        body: 'E4 Entertainment is casting lead artist for a period feature film set in Ottapalam with native dialogue nuances.',
        score: 91,
        reasons: ['Ottapalam / Palakkad local dialect fit', 'Traditional look requirement', 'Feature film contract'],
      },
    ];

    const pick = matchRoles[Math.floor(Math.random() * matchRoles.length)];
    addNotification({
      user_id: currentUser?.id || 'user_talent_1',
      type: 'casting_exact_match',
      title: pick.title,
      body: pick.body,
      entity_type: 'casting_role',
      entity_id: 'role_1',
      match_score: pick.score,
      match_role_name: pick.role,
      match_project_name: pick.project,
      match_reasons: pick.reasons,
      action_url: '/casting',
      is_read: false,
    });
  };

  const triggerNewLocationBookingAlert = () => {
    const sampleUpdates = [
      {
        title: 'Caretaker Clearance: Varikkasseri Mana Nalukettu',
        location: 'Varikkasseri Mana Traditional Nalukettu',
        locId: 'loc_1',
        district: 'Palakkad',
        image: 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?auto=format&fit=crop&w=600&q=85',
        ref: `CK-BK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'caretaker_approved' as const,
        body: 'Mana Trust caretaker confirmed your 3-day shoot schedule. 125 kVA generator parking and night lighting access cleared.',
        dates: 'Oct 20 - Oct 23, 2026 (Day & Night Shifts)',
      },
      {
        title: 'Port Authority Filming Permit: Fort Kochi Warehouse',
        location: 'Fort Kochi Colonial Dutch Warehouse',
        locId: 'loc_2',
        district: 'Ernakulam',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=85',
        ref: `CK-BK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'permit_cleared' as const,
        body: 'Cochin Port Trust single-window clearance certificate issued for outdoor jetty shoot and loading bay access.',
        dates: 'Nov 05 - Nov 08, 2026',
      },
      {
        title: 'Shift Schedule Confirmed: Vagamon Pine Valley Villa',
        location: 'Vagamon Mist & Pine Valley Glass Villa',
        locId: 'loc_3',
        district: 'Idukki',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=85',
        ref: `CK-BK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'confirmed' as const,
        body: 'Property manager approved dates and synchronized with local panchayat for drone photography permits.',
        dates: 'Nov 14 - Nov 18, 2026',
      },
    ];

    const pick = sampleUpdates[Math.floor(Math.random() * sampleUpdates.length)];
    addNotification({
      user_id: currentUser?.id || 'user_talent_1',
      type: 'location_booking_update',
      title: pick.title,
      body: pick.body,
      entity_type: 'location_booking',
      entity_id: pick.locId,
      location_id: pick.locId,
      location_name: pick.location,
      location_district: pick.district,
      location_image: pick.image,
      booking_ref: pick.ref,
      booking_status: pick.status,
      shift_dates: pick.dates,
      action_url: '/locations',
      is_read: false,
    });
  };

  const recordLocationBooking = (bookingData: {
    location: ShootingLocation;
    projectTitle: string;
    productionCompany: string;
    lineProducerName: string;
    shootStartDate: string;
    shootEndDate: string;
    shiftType: string;
    numberOfShifts: number;
    bookingRef: string;
  }) => {
    addNotification({
      user_id: currentUser?.id || 'user_talent_1',
      type: 'location_booking_confirmed',
      title: `Booking Update: ${bookingData.location.title}`,
      body: `Shift request (REF: ${bookingData.bookingRef}) for "${bookingData.projectTitle}" submitted to caretaker Sri Narayanan. Dates: ${bookingData.shootStartDate} to ${bookingData.shootEndDate} (${bookingData.numberOfShifts} shifts).`,
      entity_type: 'location_booking',
      entity_id: bookingData.location.id,
      location_id: bookingData.location.id,
      location_name: bookingData.location.title,
      location_district: bookingData.location.district,
      location_image: bookingData.location.image_urls?.[0],
      booking_ref: bookingData.bookingRef,
      booking_status: 'caretaker_approved',
      shift_dates: `${bookingData.shootStartDate} - ${bookingData.shootEndDate} (${bookingData.numberOfShifts} Shifts)`,
      action_url: '/locations',
      is_read: false,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentTalent,
        currentProduction,
        switchUserRole,
        switchRole: switchUserRole,
        loginAs,
        loginUserById,
        registerUser,
        logout,
        allRegisteredUsers,
        talents,
        productionProfiles,
        productions: productionProfiles,
        projects,
        castingCalls,
        castingRoles,
        applications,
        shortlists,
        auditions,
        notifications,
        vendors,
        locations,
        reports,
        auditLogs,
        applyForRole,
        withdrawApplication,
        updateApplicationStatus,
        createProject,
        updateProject,
        createCastingCall,
        createVendor,
        createLocation,
        createAudition,
        updateAuditionStatus,
        createShortlist,
        toggleShortlistTalent,
        submitReport,
        updateTalentProfile,
        approveTalent,
        rejectTalent,
        verifyTalent,
        suspendTalent,
        approveCastingCall,
        rejectCastingCall,
        approveVendor,
        rejectVendor,
        approveLocation,
        verifyProduction,
        resolveReport,
        dismissReport,
        updateReportStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        deleteNotification,
        triggerNewCastingMatchAlert,
        triggerNewLocationBookingAlert,
        recordLocationBooking,
        unreadNotificationsCount,
        calculateTalentProfileCompletion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
