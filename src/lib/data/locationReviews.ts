import { LocationReview } from '../../types';

export const INITIAL_LOCATION_REVIEWS: LocationReview[] = [
  // --- Varikkasseri Mana (loc_1) ---
  {
    id: 'rev_loc1_1',
    location_id: 'loc_1',
    author_user_id: 'prod_user_friday',
    author_name: 'Noble Babu Thomas',
    author_role: 'Line Producer',
    production_house: 'Friday Film House',
    project_title: 'Period Family Drama',
    overall_rating: 5,
    accessibility_rating: 4,
    power_backup_rating: 5,
    amenities_rating: 5,
    noise_acoustics_rating: 4,
    caretaker_cooperation_rating: 5,
    shoot_date: 'July 2026',
    shoot_duration: '7-Day Schedule',
    review_text: 'Varikkasseri Mana continues to be the gold standard for period Kerala cinematic grandeur. The wooden Nadumuttam and sweeping front porch provide natural anamorphic depth. The trust provided 2 dedicated AC rooms for lead cast. Just ensure you lay heavy rubber protective mats for camera trolleys over the ancient teak wood floors as mandated by the trust.',
    pros: [
      'Unmatched architectural grandeur and Nadumuttam light',
      'Dedicated sync-generator parking compound with 3-phase supply',
      'Extremely supportive trust management and quick panchayat sign-off',
      'Clean dining shed accommodation for 120-person unit'
    ],
    cons: [
      'Narrow village approach road during school hours (plan unit transit accordingly)',
      'High ceiling acoustics in inner hall require close mic placement'
    ],
    recommend_to_crews: true,
    helpful_votes: 18,
    voted_user_ids: ['user_talent_1', 'user_talent_2'],
    created_at: '2026-07-28T14:30:00Z',
    verified_production: true
  },
  {
    id: 'rev_loc1_2',
    location_id: 'loc_1',
    author_user_id: 'prod_user_dop_jomon',
    author_name: 'Jomon T. John ISC',
    author_role: 'Cinematographer (DoP)',
    production_house: 'Plan J Studios',
    project_title: 'Historical Thriller',
    overall_rating: 5,
    accessibility_rating: 4,
    power_backup_rating: 5,
    amenities_rating: 4,
    noise_acoustics_rating: 5,
    caretaker_cooperation_rating: 5,
    shoot_date: 'May 2026',
    shoot_duration: '4-Day Night Shoot',
    review_text: 'The natural courtyard diffusion during early morning golden hour (6:30 AM – 8:00 AM) is breathtaking. For night shoots, there are solid high anchor points in the upper wooden gallery to rig soft grid overhead lights. Generator sound did not bleed into the courtyard.',
    pros: [
      'Generous overhead rigging options in wooden rafters',
      'Total acoustic isolation at night from highway traffic',
      'Spacious pond side (Kulam) for crane setups'
    ],
    cons: [
      'Strict fire safety rules — no open flame or smoke machines inside without prior NOC'
    ],
    recommend_to_crews: true,
    helpful_votes: 12,
    voted_user_ids: ['user_talent_3'],
    created_at: '2026-05-18T10:15:00Z',
    verified_production: true
  },
  {
    id: 'rev_loc1_3',
    location_id: 'loc_1',
    author_user_id: 'prod_user_anwar',
    author_name: 'Anwar Rasheed',
    author_role: 'Director',
    production_house: 'Anwar Rasheed Entertainments',
    project_title: 'Anthology Feature',
    overall_rating: 4,
    accessibility_rating: 4,
    power_backup_rating: 5,
    amenities_rating: 4,
    noise_acoustics_rating: 4,
    caretaker_cooperation_rating: 5,
    shoot_date: 'March 2026',
    shoot_duration: '3-Day Shoot',
    review_text: 'A legendary canvas that instantly elevates production value. The caretaker team is seasoned and knows film shoot protocols inside out. Keep an extra set of sound blankets for the tiled corridors if shooting sync sound dialog.',
    pros: [
      'Experienced on-site caretaker who coordinates with Ottapalam police',
      'Adequate parking space for 35+ crew cars and unit vans'
    ],
    cons: [
      'Summer shoots can get humid inside the wooden attics'
    ],
    recommend_to_crews: true,
    helpful_votes: 9,
    voted_user_ids: [],
    created_at: '2026-03-22T09:00:00Z',
    verified_production: true
  },

  // --- Fort Kochi Dutch Heritage Villa & Wharf (loc_2) ---
  {
    id: 'rev_loc2_1',
    location_id: 'loc_2',
    author_user_id: 'prod_user_wayfarer',
    author_name: 'Alex E. Kurian',
    author_role: 'Production Controller',
    production_house: 'Wayfarer Films',
    project_title: 'Urban Crime Neo-Noir',
    overall_rating: 5,
    accessibility_rating: 3,
    power_backup_rating: 4,
    amenities_rating: 5,
    noise_acoustics_rating: 4,
    caretaker_cooperation_rating: 5,
    shoot_date: 'August 2026',
    shoot_duration: '6-Day Schedule',
    review_text: 'The Dutch colonial aesthetics, lime-plastered arches, and direct water inlet frontage provided stunning texture for our night sequences. Note on logistics: large 40-foot equipment trucks cannot enter the narrow Princess Street alley. We parked the primary truck at the Parade Ground and used mini tempo shuttles, which worked seamlessly.',
    pros: [
      'Exquisite colonial architecture and vintage wooden French doors',
      'Water frontage allows night boat docking sequences',
      'Walking distance to top Fort Kochi hotels for talent convenience'
    ],
    cons: [
      'Narrow heritage street restricts heavy 40ft trailer access directly to gate',
      'Tourist foot-traffic during weekends requires extra crowd marshals'
    ],
    recommend_to_crews: true,
    helpful_votes: 15,
    voted_user_ids: ['user_talent_1'],
    created_at: '2026-08-14T16:20:00Z',
    verified_production: true
  },
  {
    id: 'rev_loc2_2',
    location_id: 'loc_2',
    author_user_id: 'prod_user_art_manoj',
    author_name: 'Manoj Kumar',
    author_role: 'Art Director / Production Designer',
    production_house: 'Independent Production',
    project_title: 'Romance Feature',
    overall_rating: 4,
    accessibility_rating: 4,
    power_backup_rating: 4,
    amenities_rating: 5,
    noise_acoustics_rating: 4,
    caretaker_cooperation_rating: 4,
    shoot_date: 'June 2026',
    shoot_duration: '2-Day Patch Shoot',
    review_text: 'The owner was gracious about temporarily repainting one interior wall to match our color palette, provided we restored it before unit wrap. Beautiful high ceilings allowed us to rig 4x4 diffusion frames comfortably.',
    pros: [
      'High ceilings (16 ft) for lighting grid placement',
      'Well-maintained heritage floor tiles and wooden staircases'
    ],
    cons: [
      'Harbor foghorn noise occasionally picked up during early morning sync sound'
    ],
    recommend_to_crews: true,
    helpful_votes: 7,
    voted_user_ids: [],
    created_at: '2026-06-19T11:45:00Z',
    verified_production: true
  },

  // --- Munnar High-Range Tea Estate Bungalow (loc_3) ---
  {
    id: 'rev_loc3_1',
    location_id: 'loc_3',
    author_user_id: 'prod_user_magic_frames',
    author_name: 'Justin Stephen',
    author_role: 'Line Producer',
    production_house: 'Magic Frames',
    project_title: 'High Altitude Thriller',
    overall_rating: 5,
    accessibility_rating: 4,
    power_backup_rating: 5,
    amenities_rating: 5,
    noise_acoustics_rating: 5,
    caretaker_cooperation_rating: 5,
    shoot_date: 'August 2026',
    shoot_duration: '10-Day Schedule',
    review_text: 'Spectacular misty vistas and 360-degree tea plantation topography. The private estate road is well tarred all the way to the bungalow porch. Generator parking spot is well isolated by tea bushes, so zero acoustic hum inside the wooden fireplace drawing room.',
    pros: [
      'Private 40-acre estate with total isolation and zero public crowd disruption',
      'Cozy working fireplace and British colonial woodwork in pristine condition',
      'Hot water and heated makeup suites were crucial in 12°C chilly weather'
    ],
    cons: [
      'Weather can shift rapidly from bright sunshine to dense mist within 20 minutes',
      'Limited mobile connectivity — rely on estate high-speed Wi-Fi'
    ],
    recommend_to_crews: true,
    helpful_votes: 21,
    voted_user_ids: ['user_talent_2'],
    created_at: '2026-08-05T08:30:00Z',
    verified_production: true
  },
  {
    id: 'rev_loc3_2',
    location_id: 'loc_3',
    author_user_id: 'prod_user_sound_harikumar',
    author_name: 'Harikumar M.',
    author_role: 'Sound Recordist / Sync Sound Engineer',
    production_house: 'Aashirvad Cinemas',
    project_title: 'Drama',
    overall_rating: 5,
    accessibility_rating: 4,
    power_backup_rating: 4,
    amenities_rating: 5,
    noise_acoustics_rating: 5,
    caretaker_cooperation_rating: 5,
    shoot_date: 'May 2026',
    shoot_duration: '5-Day Schedule',
    review_text: 'A sync sound paradise. Ambient noise is essentially zero except for gentle pine wind and birds. The wooden interiors have clean absorption without annoying flutter echoes.',
    pros: [
      'Pin-drop silence for delicate sync-sound dialogue capture',
      'Ample estate staff support for tea and warm meals on set'
    ],
    cons: [
      'Need to book early during autumn and winter months due to high demand'
    ],
    recommend_to_crews: true,
    helpful_votes: 11,
    voted_user_ids: [],
    created_at: '2026-05-30T17:10:00Z',
    verified_production: true
  },

  // --- Alappuzha Backwater Heritage Tharavadu (loc_4) ---
  {
    id: 'rev_loc4_1',
    location_id: 'loc_4',
    author_user_id: 'prod_user_antony',
    author_name: 'Antony Perumbavoor',
    author_role: 'Production Controller',
    production_house: 'Aashirvad Cinemas',
    project_title: 'Mass Action Thriller',
    overall_rating: 5,
    accessibility_rating: 4,
    power_backup_rating: 5,
    amenities_rating: 4,
    noise_acoustics_rating: 4,
    caretaker_cooperation_rating: 5,
    shoot_date: 'August 2026',
    shoot_duration: '4-Day Shift',
    review_text: 'The boat jetty directly adjoining the Tharavadu verandah allowed us to shoot boat arrival scenes and courtyard interactions simultaneously. The local boatmen association was organized by the property manager so water traffic was regulated during takes.',
    pros: [
      'Direct canal waterfront access with private jetty',
      'Traditional architecture with intact granary (Pathayam)',
      'Local liaison manager handled irrigation and tourism boat coordination'
    ],
    cons: [
      'Monsoon high tides can dampen the lower lawn edge — carry rubber decking'
    ],
    recommend_to_crews: true,
    helpful_votes: 14,
    voted_user_ids: [],
    created_at: '2026-08-10T12:00:00Z',
    verified_production: true
  },

  // --- Cliffside Glass Villa (loc_5) ---
  {
    id: 'rev_loc5_1',
    location_id: 'loc_5',
    author_user_id: 'prod_user_scout_vinod',
    author_name: 'Vinod Shornur',
    author_role: 'Location Manager / Scout',
    production_house: 'E4 Entertainment',
    project_title: 'Stylish Ad Film & Music Video',
    overall_rating: 5,
    accessibility_rating: 4,
    power_backup_rating: 5,
    amenities_rating: 5,
    noise_acoustics_rating: 4,
    caretaker_cooperation_rating: 5,
    shoot_date: 'July 2026',
    shoot_duration: '2-Day Commercial Shoot',
    review_text: 'For modern high-fashion, corporate, or luxury villa sequences, this cliffside property is unmatched in Kerala. Infinity pool reflection with Arabian sea horizon created high-end cinematic visuals without needing green screen.',
    pros: [
      'Flawless floor-to-ceiling glass architecture with sea horizon',
      'Infinity pool is pre-cleaned with underwater lighting controls',
      'Luxury air-conditioned suites double as ultra-modern green rooms'
    ],
    cons: [
      'Reflections in large glass panels require experienced lighting gaffer to avoid bounce'
    ],
    recommend_to_crews: true,
    helpful_votes: 16,
    voted_user_ids: [],
    created_at: '2026-07-15T15:40:00Z',
    verified_production: true
  },

  // --- Kozhikode Colonial Beach House (loc_7) ---
  {
    id: 'rev_loc7_1',
    location_id: 'loc_7',
    author_user_id: 'prod_user_fahadh',
    author_name: 'Syam Pushkaran',
    author_role: 'Line Producer',
    production_house: 'Fahadh Faasil and Friends',
    project_title: 'Realistic Drama',
    overall_rating: 4,
    accessibility_rating: 5,
    power_backup_rating: 4,
    amenities_rating: 4,
    noise_acoustics_rating: 3,
    caretaker_cooperation_rating: 5,
    shoot_date: 'August 2026',
    shoot_duration: '5-Day Schedule',
    review_text: 'The ocean view and French windows provide romantic, atmospheric coastal mood. Easy truck access along the Kozhikode beach road. Sea breeze and wave sound mean you will need wind-muffs and lavalier mics if recording dialogue outdoors.',
    pros: [
      'Direct beach frontage with wide sandy clearing for camera tracks',
      'Wide double-gate parking for heavy lighting vans',
      'Delicious local Malabar catering available right next door'
    ],
    cons: [
      'Continuous ocean wave roar requires dialogue post-sync (dubbing) or tight lapel mics'
    ],
    recommend_to_crews: true,
    helpful_votes: 8,
    voted_user_ids: [],
    created_at: '2026-08-02T13:10:00Z',
    verified_production: true
  },

  // --- Kuttanad Paddy Field Wooden Pump House (loc_8) ---
  {
    id: 'rev_loc8_1',
    location_id: 'loc_8',
    author_user_id: 'prod_user_dop_girish',
    author_name: 'Girish Gangadharan ISC',
    author_role: 'Cinematographer (DoP)',
    production_house: 'Lijo Jose Pellissery Productions',
    project_title: 'Rural Drama',
    overall_rating: 4,
    accessibility_rating: 3,
    power_backup_rating: 4,
    amenities_rating: 3,
    noise_acoustics_rating: 5,
    caretaker_cooperation_rating: 5,
    shoot_date: 'June 2026',
    shoot_duration: '3-Day Natural Light Shoot',
    review_text: 'Unfiltered, raw rustic charm. The endless green paddy panorama under open monsoon skies gave us legendary framing. Unit trucks must be parked on the main bund road 150 meters away, and crew equipment is transported via flat wooden punt boats.',
    pros: [
      'Unspoiled 360-degree green paddy fields with no modern electric poles in frame',
      'Golden hour reflection across water channels is pure magic'
    ],
    cons: [
      'Requires boat transfer for camera gears from the road bund',
      'Basic washrooms — we brought a mobile vanity van on the main road'
    ],
    recommend_to_crews: true,
    helpful_votes: 19,
    voted_user_ids: [],
    created_at: '2026-06-25T18:00:00Z',
    verified_production: true
  }
];
