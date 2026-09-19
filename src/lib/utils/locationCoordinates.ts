import { ShootingLocation, KeralaDistrict } from '../../types';

export const KERALA_DISTRICT_COORDINATES: Record<KeralaDistrict, [number, number]> = {
  Alappuzha: [9.4981, 76.3388],
  Ernakulam: [9.9816, 76.2999],
  Idukki: [9.8494, 76.9806],
  Kannur: [11.8745, 75.3704],
  Kasaragod: [12.5102, 74.9852],
  Kollam: [8.8932, 76.6141],
  Kottayam: [9.5916, 76.5222],
  Kozhikode: [11.2588, 75.7804],
  Malappuram: [11.0510, 76.0711],
  Palakkad: [10.7867, 76.6548],
  Pathanamthitta: [9.2648, 76.7870],
  Thiruvananthapuram: [8.5241, 76.9366],
  Thrissur: [10.5276, 76.2144],
  Wayanad: [11.6854, 76.1320],
};

// Default center for Kerala film scouting
export const KERALA_MAP_CENTER: [number, number] = [10.25, 76.45];
export const KERALA_DEFAULT_ZOOM = 7.5;

/**
 * Returns [latitude, longitude] for any ShootingLocation.
 * If exact coords are set, uses them. Otherwise computes a deterministic,
 * jitter-free position near the district centroid based on location ID.
 */
export function getLocationCoordinates(loc: ShootingLocation): [number, number] {
  if (
    typeof loc.latitude === 'number' &&
    typeof loc.longitude === 'number' &&
    !isNaN(loc.latitude) &&
    !isNaN(loc.longitude)
  ) {
    return [loc.latitude, loc.longitude];
  }

  const base = KERALA_DISTRICT_COORDINATES[loc.district] || [10.0, 76.3];
  
  // Deterministic offset based on loc.id so cards don't stack directly on top of each other
  let hash = 0;
  const idStr = loc.id || loc.title || 'kerala';
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const distance = 0.015 + (Math.abs(hash >> 3) % 20) * 0.002; // approx 1.5 - 5km offset
  
  const latOffset = Math.sin(angle) * distance;
  const lngOffset = Math.cos(angle) * distance;

  return [base[0] + latOffset, base[1] + lngOffset];
}
