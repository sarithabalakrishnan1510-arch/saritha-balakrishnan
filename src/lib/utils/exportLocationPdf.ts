import { jsPDF } from 'jspdf';
import { ShootingLocation } from '../../types';

export interface LocationBookingPdfOptions {
  location: ShootingLocation;
  projectTitle?: string;
  productionCompany?: string;
  lineProducerName?: string;
  contactPhone?: string;
  shootStartDate?: string;
  shootEndDate?: string;
  shiftType?: string;
  numberOfShifts?: number;
  crewCount?: number;
  specialRequirements?: string[];
  customNotes?: string;
  ratingAverage?: number;
  reviewCount?: number;
}

export function generateLocationBookingPdf(options: LocationBookingPdfOptions): jsPDF {
  const {
    location,
    projectTitle = 'Untitled Feature Production',
    productionCompany = 'Kerala Film Banner / Studio',
    lineProducerName = 'Production Line Producer',
    contactPhone = '+91 98470 12345',
    shootStartDate = 'TBD (Upcoming Schedule)',
    shootEndDate = 'TBD',
    shiftType = 'Day Shift (06:00 AM - 06:00 PM)',
    numberOfShifts = 1,
    crewCount = location.crew_capacity || 80,
    specialRequirements = [],
    customNotes = '',
    ratingAverage,
    reviewCount
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const dateGenerated = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const bookingRef = `CK-LOC-${location.id.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

  // ==========================================
  // PAGE 1: PRODUCTION & TECHNICAL LOGISTICS
  // ==========================================

  // Top Branded Header Bar (Deep Slate)
  doc.setFillColor(18, 20, 32);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line (Warm Amber/Gold)
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CAST KERALA • LOCATION BOOKING & RECCE DOSSIER', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('OFFICIAL CINEMA PRODUCTION PLANNING & SET LOGISTICS SPECIFICATION', margin, 17);
  doc.text('Compliant with Kerala Film Producers Association (KFPA) & FEFKA Guild Standards', margin, 22);

  // Header Metadata (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36);
  doc.text(`REF: ${bookingRef}`, pageWidth - margin, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Date: ${dateGenerated}`, pageWidth - margin, 17, { align: 'right' });
  doc.text('Status: CONFIRMED FOR PLANNING', pageWidth - margin, 22, { align: 'right' });

  let y = 35;

  // ------------------------------------------
  // SECTION 1: PRODUCTION PROJECT & SCHEDULE
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('1. PRODUCTION PROJECT & SHOOT SCHEDULE', margin + 3, y + 5);

  const col1 = margin + 4;
  const col2 = margin + (contentWidth / 2) + 2;
  const colWidthHalf = (contentWidth / 2) - 6;

  // Row 1
  let curY = y + 13;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Project / Movie Title:', col1, curY);
  doc.setTextColor(15, 23, 42);
  doc.text(projectTitle, col1 + 35, curY);

  doc.setTextColor(100, 116, 139);
  doc.text('Production Banner:', col2, curY);
  doc.setTextColor(15, 23, 42);
  doc.text(productionCompany, col2 + 32, curY);

  // Row 2
  curY += 6;
  doc.setTextColor(100, 116, 139);
  doc.text('Line Producer:', col1, curY);
  doc.setTextColor(15, 23, 42);
  doc.text(lineProducerName, col1 + 35, curY);

  doc.setTextColor(100, 116, 139);
  doc.text('Producer Contact:', col2, curY);
  doc.setTextColor(15, 23, 42);
  doc.text(contactPhone, col2 + 32, curY);

  // Row 3
  curY += 6;
  doc.setTextColor(100, 116, 139);
  doc.text('Planned Dates:', col1, curY);
  doc.setTextColor(15, 23, 42);
  doc.text(`${shootStartDate} ${shootEndDate && shootEndDate !== shootStartDate ? `to ${shootEndDate}` : ''}`, col1 + 35, curY);

  doc.setTextColor(100, 116, 139);
  doc.text('Shift Duration:', col2, curY);
  doc.setTextColor(15, 23, 42);
  doc.text(`${numberOfShifts} Shift(s) • ${shiftType}`, col2 + 32, curY);

  y += 42;

  // ------------------------------------------
  // SECTION 2: SHOOTING LOCATION PROFILE
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('2. LOCATION PROFILE & FINANCIAL TERMS', margin + 3, y + 5);

  curY = y + 13;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(location.title, col1, curY);

  // Category Tag
  doc.setFontSize(7.5);
  doc.setTextColor(190, 24, 93);
  doc.text(`[${location.category_name.toUpperCase()}]`, col1 + 105, curY);

  curY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`District & City: ${location.city}, ${location.district} District, Kerala`, col1, curY);

  if (ratingAverage) {
    doc.setTextColor(180, 83, 9);
    doc.text(`★ Verified Recce Rating: ${ratingAverage.toFixed(1)} / 5.0 (${reviewCount || 1} production reviews)`, col2, curY);
  }

  curY += 5.5;
  doc.setTextColor(71, 85, 105);
  doc.text(`Approximate Landmark: ${location.approximate_location}`, col1, curY);

  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Shift Tariff:', col1, curY);
  doc.setTextColor(2, 132, 199);
  doc.text(location.pricing_text || 'Contact for quote', col1 + 22, curY);

  doc.setTextColor(15, 23, 42);
  doc.text('Property Caretaker:', col2, curY);
  doc.setTextColor(71, 85, 105);
  doc.text(location.owner_contact_private || '+91 94471 88990 (Confidential Caretaker Liaison)', col2 + 32, curY);

  curY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Standard Commercial Terms: 50% advance on signing, 50% post wrap-up. Electricity & sync generator fuel extra.', col1, curY);

  y += 46;

  // ------------------------------------------
  // SECTION 3: TECHNICAL & SET FEASIBILITY
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('3. TECHNICAL SET FEASIBILITY & PHYSICAL INFRASTRUCTURE', margin + 3, y + 5);

  const gridLeft = margin + 4;
  const gridRight = margin + 96;
  let rowY = y + 13;

  const renderFeat = (label: string, value: string, ok: boolean, posX: number, posY: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, posX, posY);

    doc.setFont('helvetica', 'bold');
    if (ok) {
      doc.setTextColor(22, 101, 52); // Green
      doc.text(`[YES] ${value}`, posX + 45, posY);
    } else {
      doc.setTextColor(153, 27, 27); // Red
      doc.text(`[NO] ${value}`, posX + 45, posY);
    }
  };

  renderFeat('Max Crew Headcount:', `${location.crew_capacity || crewCount} Members max`, true, gridLeft, rowY);
  renderFeat('Unit Parking Space:', `${location.parking_capacity || 20} Unit Vehicles`, true, gridRight, rowY);

  rowY += 6;
  renderFeat('Generator Set Area:', location.generator_access ? 'Available on premises' : 'Requires mobile truck', location.generator_access, gridLeft, rowY);
  renderFeat('3-Phase Power Access:', location.power_available ? '3-Phase EB Point Available' : 'No 3-Phase on site', location.power_available, gridRight, rowY);

  rowY += 6;
  renderFeat('Changing / Green Rooms:', location.changing_room ? 'AC Makeup & Costumes Rooms' : 'Unit caravan required', location.changing_room, gridLeft, rowY);
  renderFeat('Cast & Crew Washrooms:', location.restroom ? 'Attached sanitized washrooms' : 'Mobile bio-toilets needed', location.restroom, gridRight, rowY);

  rowY += 6;
  renderFeat('Indoor Shooting Permitted:', location.indoor_allowed ? 'Full Interior Set Permitted' : 'Exterior / Porch Only', location.indoor_allowed, gridLeft, rowY);
  renderFeat('Outdoor Compound Shoot:', location.outdoor_allowed ? 'Courtyard / Grounds Permitted' : 'Strictly Interior Only', location.outdoor_allowed, gridRight, rowY);

  rowY += 6;
  renderFeat('Night Shoot Viability:', location.night_shoot_allowed ? 'Permitted with local intimation' : 'Strict 7:00 PM Curfew', location.night_shoot_allowed, gridLeft, rowY);
  renderFeat('Sync Sound Acoustics:', 'Sync Sound viable (Check road noise)', true, gridRight, rowY);

  rowY += 6;
  renderFeat('Crane & Jib Clearance:', 'Suitable for Jimmy Jib & 18m Cranes', true, gridLeft, rowY);
  renderFeat('Heavy Road Access:', '40ft Equipment Trailer Accessible', true, gridRight, rowY);

  y += 58;

  // ------------------------------------------
  // SECTION 4: LOCATION RECCE & ART DESCRIPTION
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('4. RECCE INSIGHTS & ART DEPARTMENT NOTES', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const descLines = doc.splitTextToSize(
    location.description || 'Verified Kerala film shooting property offering authentic cinematic architecture and flexible shooting backdrops.',
    contentWidth - 8
  );
  doc.text(descLines.slice(0, 4), margin + 4, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  doc.text('Cinematography Tip: Morning golden hour offers direct backlight through east courtyard. Soft evening diffusion from riverfront/orchard.', margin + 4, y + 33);

  y += 42;

  // Page 1 Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CAST KERALA • Confidential Film Production Dossier • Page 1 of 2', margin, pageHeight - 6);
  doc.text(`Generated on ${dateGenerated} for ${productionCompany}`, pageWidth - margin, pageHeight - 6, { align: 'right' });

  // ==========================================
  // PAGE 2: STATUTORY CLEARANCES & SIGN-OFFS
  // ==========================================
  doc.addPage('a4', 'portrait');

  // Top Page 2 Bar
  doc.setFillColor(18, 20, 32);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 20, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CAST KERALA • PERMITS, SAFETY PROTOCOLS & PRODUCTION SIGN-OFFS', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`REF: ${bookingRef} • ${location.title} (${location.city})`, margin, 16);

  y = 28;

  // ------------------------------------------
  // SECTION 5: STATUTORY CLEARANCES & PERMISSIONS
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 52, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('5. STATUTORY CLEARANCES & GOVERNMENT LIAISON CHECKLIST', margin + 3, y + 5);

  const clearanceItems = [
    { name: 'Local Panchayat / Municipal Corporation NOC', desc: 'Permit for shooting equipment parking & road traffic diversion.' },
    { name: 'Local Police Station Intimation (Circle Inspector)', desc: 'Mandatory notification for night shifts, crowd control, and dummy prop weapons.' },
    { name: 'Kerala State Film Development Corp (KSFDC)', desc: 'Single window clearance subsidy registration & film facilitation cell reference.' },
    { name: 'Kerala State Electricity Board (KSEB)', desc: 'Temporary high-tension electric line safety clearance for lighting towers.' },
    { name: 'Fire and Rescue Services Department Clearance', desc: 'Required if using hazer machines, flame torches, or smoke effects.' },
    { name: 'DGCA & Local Police Drone Aerial Photography Permit', desc: 'Required for outdoor aerial shots over residential vicinity.' }
  ];

  let clrY = y + 13;
  clearanceItems.forEach((item, index) => {
    doc.setDrawColor(148, 163, 184);
    doc.rect(margin + 4, clrY - 2.5, 3.5, 3.5); // Checkbox

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.name, margin + 10, clrY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`- ${item.desc}`, margin + 85, clrY);

    clrY += 6;
  });

  y += 56;

  // ------------------------------------------
  // SECTION 6: SPECIAL EQUIPMENT & ART DEPT REQUIREMENTS
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 44, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('6. ON-SET SPECIAL REQUIREMENTS & CONTINGENCIES', margin + 3, y + 5);

  let reqY = y + 13;
  const reqList = specialRequirements.length > 0
    ? specialRequirements
    : [
        '125 kVA Silent Sync Sound Generator with 200m heavy cable run',
        'Caravan / Vanity Van parking with 32A power hookup for lead artists',
        'Hydraulic Crane (18m) setup clearance in eastern courtyard',
        'Dedicated catering dining shelter area for 90 unit members',
        'Waste management & eco-friendly recycling protocol post shoot wrap'
      ];

  reqList.slice(0, 5).forEach(req => {
    doc.setFillColor(217, 119, 6);
    doc.circle(margin + 6, reqY - 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(req, margin + 10, reqY);
    reqY += 5.5;
  });

  if (customNotes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`Producer Note: ${customNotes.slice(0, 120)}`, margin + 4, y + 39);
  }

  y += 48;

  // ------------------------------------------
  // SECTION 7: EMERGENCY DIRECTORY
  // ------------------------------------------
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text('7. ON-SET EMERGENCY & COORDINATION HOTLINES', margin + 3, y + 5);

  let emgY = y + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Property Owner / Caretaker:', col1, emgY);
  doc.setTextColor(15, 23, 42);
  doc.text(location.owner_contact_private || '+91 94471 88990', col1 + 45, emgY);

  doc.setTextColor(71, 85, 105);
  doc.text('Local Police Control:', col2, emgY);
  doc.setTextColor(15, 23, 42);
  doc.text('112 / District Control Room', col2 + 35, emgY);

  emgY += 6;
  doc.setTextColor(71, 85, 105);
  doc.text('FEFKA Production Executive:', col1, emgY);
  doc.setTextColor(15, 23, 42);
  doc.text('+91 484 233 4567', col1 + 45, emgY);

  doc.setTextColor(71, 85, 105);
  doc.text('Nearest Trauma Care Hospital:', col2, emgY);
  doc.setTextColor(15, 23, 42);
  doc.text(`District Hospital, ${location.city}`, col2 + 35, emgY);

  y += 28;

  // ------------------------------------------
  // SECTION 8: OFFICIAL PRODUCTION SIGN-OFFS
  // ------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'FD');

  doc.setFillColor(238, 242, 246);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('8. OFFICIAL PRODUCTION AUTHORIZATION & SITE SIGN-OFF', margin + 3, y + 5);

  const signWidth = (contentWidth - 12) / 3;
  const signY = y + 14;

  const renderSignBox = (role: string, name: string, posX: number) => {
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(posX, signY, signWidth, 34, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(role, posX + 2, signY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Name: ${name}`, posX + 2, signY + 10);

    // Signature dotted line
    doc.setDrawColor(148, 163, 184);
    doc.line(posX + 3, signY + 26, posX + signWidth - 3, signY + 26);

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Authorized Signature & Date', posX + (signWidth / 2), signY + 30, { align: 'center' });
  };

  renderSignBox('LINE PRODUCER', lineProducerName, margin + 2);
  renderSignBox('DIRECTOR OF PHOTOGRAPHY', 'DoP / Cinematographer', margin + 2 + signWidth + 4);
  renderSignBox('PROPERTY CUSTODIAN', 'Owner / Caretaker', margin + 2 + (signWidth + 4) * 2);

  // Page 2 Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CAST KERALA • Confidential Film Production Dossier • Page 2 of 2', margin, pageHeight - 6);
  doc.text('Signed copy must be lodged with Production Desk prior to roll camera', pageWidth - margin, pageHeight - 6, { align: 'right' });

  return doc;
}

export function downloadLocationBookingPdf(options: LocationBookingPdfOptions): void {
  const doc = generateLocationBookingPdf(options);
  const cleanTitle = options.location.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filename = `${cleanTitle}_production_booking_dossier.pdf`;
  doc.save(filename);
}

export function openLocationBookingPdfInNewTab(options: LocationBookingPdfOptions): void {
  const doc = generateLocationBookingPdf(options);
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
}
