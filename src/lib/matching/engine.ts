import { CastingRole, TalentProfile, CastingMatch, MatchLevel } from '../../types';
import { SUSPICIOUS_SAFETY_PHRASES } from '../constants';

export interface MatchScoreResult {
  totalScore: number;
  matchLevel: MatchLevel;
  genderScore: number;
  ageScore: number;
  languageScore: number;
  experienceScore: number;
  locationScore: number;
  skillScore: number;
  availabilityScore: number;
  preferenceScore: number;
  isExactEligible: boolean;
  notes: string[];
  reasons?: string[];
  breakdown: {
    genderScore: number;
    ageScore: number;
    languageScore: number;
    experienceScore: number;
    locationScore: number;
    skillsScore: number;
    availabilityScore: number;
    preferenceScore: number;
  };
}

/**
 * Weights configuration for Casting Match
 */
export const MATCH_WEIGHTS = {
  gender: 20,
  playingAge: 20,
  language: 15,
  experience: 15,
  location: 10,
  skills: 10,
  availability: 5,
  preference: 5,
};

/**
 * Computes overlap between two closed integer ranges [min1, max1] and [min2, max2].
 */
export function calculateAgeRangeOverlap(
  roleMin: number,
  roleMax: number,
  talentMin: number,
  talentMax: number
): { overlapSpan: number; hasOverlap: boolean; ratio: number } {
  const overlapStart = Math.max(roleMin, talentMin);
  const overlapEnd = Math.min(roleMax, talentMax);
  const overlapSpan = Math.max(0, overlapEnd - overlapStart + 1);
  const roleSpan = Math.max(1, roleMax - roleMin + 1);

  return {
    overlapSpan,
    hasOverlap: overlapSpan > 0,
    ratio: Math.min(1, overlapSpan / roleSpan),
  };
}

/**
 * Calculates match score between a casting role and talent profile.
 */
export function calculateRoleMatchScore(
  role: CastingRole,
  talent: TalentProfile
): MatchScoreResult {
  const notes: string[] = [];
  let isExactEligible = true;

  // 1. GENDER (20 pts)
  let genderScore = 0;
  if (role.gender_requirement === 'any') {
    genderScore = MATCH_WEIGHTS.gender;
    notes.push('Open to any gender');
  } else if (role.gender_requirement.toLowerCase() === talent.gender.toLowerCase()) {
    genderScore = MATCH_WEIGHTS.gender;
    notes.push(`Matches required gender (${talent.gender})`);
  } else {
    // Hard exclusion for exact match
    genderScore = 0;
    isExactEligible = false;
    notes.push(`Gender requirement mismatch (Role: ${role.gender_requirement}, Talent: ${talent.gender})`);
  }

  // 2. PLAYING AGE OVERLAP (20 pts)
  let ageScore = 0;
  const ageOverlap = calculateAgeRangeOverlap(
    role.playing_age_min,
    role.playing_age_max,
    talent.playing_age_min,
    talent.playing_age_max
  );

  if (ageOverlap.hasOverlap) {
    // Degree of overlap
    ageScore = Math.round(MATCH_WEIGHTS.playingAge * (0.6 + 0.4 * ageOverlap.ratio));
    notes.push(`Playing age overlaps: Role ${role.playing_age_min}–${role.playing_age_max} vs Talent ${talent.playing_age_min}–${talent.playing_age_max}`);
  } else {
    // Check if within 2 years margin
    const distance = Math.min(
      Math.abs(talent.playing_age_min - role.playing_age_max),
      Math.abs(talent.playing_age_max - role.playing_age_min)
    );
    if (distance <= 2) {
      ageScore = 6;
      isExactEligible = false;
      notes.push('Close age proximity (+/- 2 years)');
    } else {
      ageScore = 0;
      isExactEligible = false;
      notes.push('No playing age overlap');
    }
  }

  // 3. LANGUAGE MATCH (15 pts)
  let languageScore = 0;
  const talentLangs = (talent.languages || ['Malayalam (Native)']).map(l => l.toLowerCase());
  const roleLangs = (role.language_requirement || ['Malayalam']).map(l => l.toLowerCase());
  
  if (roleLangs.length === 0) {
    languageScore = MATCH_WEIGHTS.language;
  } else {
    const matchedLangs = roleLangs.filter(rl => 
      talentLangs.some(tl => tl.includes(rl) || rl.includes(tl.split(' ')[0]))
    );
    if (matchedLangs.length === roleLangs.length) {
      languageScore = MATCH_WEIGHTS.language;
      notes.push(`Fluent in all required languages: ${matchedLangs.join(', ')}`);
    } else if (matchedLangs.length > 0) {
      languageScore = Math.round(MATCH_WEIGHTS.language * (matchedLangs.length / roleLangs.length));
      notes.push(`Partial language match (${matchedLangs.length}/${roleLangs.length})`);
    } else {
      languageScore = 0;
      notes.push('Missing preferred language');
    }
  }

  // 4. EXPERIENCE LEVEL (15 pts)
  let experienceScore = 0;
  if (!role.experience_requirement || role.experience_requirement === 'any') {
    experienceScore = MATCH_WEIGHTS.experience;
  } else if (role.experience_requirement === talent.experience_level) {
    experienceScore = MATCH_WEIGHTS.experience;
    notes.push(`Direct experience match (${talent.experience_level})`);
  } else {
    // Proportional credit
    const expRanks: Record<string, number> = {
      fresher: 1,
      child_artist: 1,
      teen_artist: 2,
      junior_artist: 2,
      theatre_actor: 3,
      experienced: 3,
      working_actor: 4,
      senior_artist: 4,
      professional: 5,
    };
    const talentRank = expRanks[talent.experience_level] || 2;
    const roleRank = expRanks[role.experience_requirement] || 2;
    if (talentRank >= roleRank) {
      experienceScore = 13;
      notes.push(`Experience tier meets or exceeds requirement`);
    } else {
      experienceScore = 7;
      notes.push(`Junior to requested experience tier`);
    }
  }

  // 5. LOCATION (10 pts)
  let locationScore = 0;
  const talentDistrict = talent.user?.district?.toLowerCase() || talent.native_place?.toLowerCase() || '';
  const roleLoc = (role.shoot_location || role.location_requirement || '').toLowerCase();
  
  if (!roleLoc || roleLoc === 'kerala' || roleLoc.includes('any')) {
    locationScore = MATCH_WEIGHTS.location;
  } else if (talentDistrict && roleLoc.includes(talentDistrict)) {
    locationScore = MATCH_WEIGHTS.location;
    notes.push(`Local district match (${talent.user?.district})`);
  } else if (talent.travel_willing) {
    locationScore = 8;
    notes.push('Willing to travel anywhere in Kerala');
  } else {
    locationScore = 3;
    notes.push('Outside primary shoot district');
  }

  // 6. SKILLS MATCH (10 pts)
  let skillScore = 0;
  const talentSkills = (talent.skills || []).map(s => s.toLowerCase());
  const roleNotes = (role.special_notes || '' + role.role_description).toLowerCase();
  
  const matchedSkills = talentSkills.filter(s => roleNotes.includes(s));
  if (matchedSkills.length > 0) {
    skillScore = MATCH_WEIGHTS.skills;
    notes.push(`Matches specific skill needs: ${matchedSkills.join(', ')}`);
  } else {
    // If no special skills requested or talent has general acting/expression skills
    skillScore = 7;
  }

  // 7. AVAILABILITY (5 pts)
  let availabilityScore = 0;
  if (talent.working_status === 'available') {
    availabilityScore = MATCH_WEIGHTS.availability;
    notes.push('Currently available for call sheets');
  } else if (talent.working_status === 'auditioning') {
    availabilityScore = 4;
  } else {
    availabilityScore = 1;
    notes.push('Currently shooting on project');
  }

  // 8. PROJECT PREFERENCE (5 pts)
  const preferenceScore = talent.show_public_profile ? MATCH_WEIGHTS.preference : 3;

  let totalScore = 
    genderScore +
    ageScore +
    languageScore +
    experienceScore +
    locationScore +
    skillScore +
    availabilityScore +
    preferenceScore;

  // Apply hard exclusion constraints
  if (!isExactEligible && totalScore > 88) {
    totalScore = 88; // Hard cap if gender or age overlap failed
  }

  // Determine Match Level
  let matchLevel: MatchLevel = 'general';
  if (totalScore >= 90 && isExactEligible) {
    matchLevel = 'exact';
  } else if (totalScore >= 70) {
    matchLevel = 'strong';
  } else if (totalScore >= 50) {
    matchLevel = 'possible';
  } else {
    matchLevel = 'general';
  }

  return {
    totalScore,
    matchLevel,
    genderScore,
    ageScore,
    languageScore,
    experienceScore,
    locationScore,
    skillScore,
    availabilityScore,
    preferenceScore,
    isExactEligible,
    notes,
    reasons: notes,
    breakdown: {
      genderScore,
      ageScore,
      languageScore,
      experienceScore,
      locationScore,
      skillsScore: skillScore,
      availabilityScore,
      preferenceScore,
    },
  };
}

/**
 * Checks casting text for safety red flags
 */
export function checkCastingSafety(text: string): { isFlagged: boolean; reasons: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const phrase of SUSPICIOUS_SAFETY_PHRASES) {
    if (lower.includes(phrase)) {
      found.push(`Contains suspicious phrase: "${phrase}"`);
    }
  }

  return {
    isFlagged: found.length > 0,
    reasons: found,
  };
}

/**
 * Generates matches for a talent against all active casting roles
 */
export function generateMatchesForTalent(
  talent: TalentProfile,
  roles: CastingRole[],
  callsMap: Record<string, any>
): CastingMatch[] {
  return roles
    .filter(r => r.status === 'open')
    .map(role => {
      const matchResult = calculateRoleMatchScore(role, talent);
      const castingCall = callsMap[role.casting_call_id];

      return {
        id: `match_${role.id}_${talent.user_id}`,
        casting_role_id: role.id,
        talent_user_id: talent.user_id,
        score: matchResult.totalScore,
        match_level: matchResult.matchLevel,
        gender_score: matchResult.genderScore,
        age_score: matchResult.ageScore,
        language_score: matchResult.languageScore,
        experience_score: matchResult.experienceScore,
        location_score: matchResult.locationScore,
        skill_score: matchResult.skillScore,
        availability_score: matchResult.availabilityScore,
        preference_score: matchResult.preferenceScore,
        breakdown_notes: matchResult.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role,
        casting_call: castingCall,
      };
    })
    .sort((a, b) => b.score - a.score);
}
