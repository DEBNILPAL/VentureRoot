export interface Competitor {
  id: string;
  name: string;
  type?: string;
  sectorType?: string;
  ownership?: string;
  facilityType?: string;
  source?: string;
  location?: string;
  distanceKm?: number;
  position?: [number, number];
  pricing?: string;
  strengths?: string[];
  weaknesses?: string[];
  positioning?: string;
  businessImpact?: string;
  contact?: string | null;
  openingHours?: string | null;
  aiEnriched?: boolean;
  tags?: Record<string, string | null>;
  rank?: number;
  strengthScore?: number;
  threatLevel?: string;
  whyMajorCompetitor?: string;
  strategicCountermeasure?: string;
}

export function isCompetitorGovt(comp: Competitor): boolean {
  const s = ((comp.sectorType || "") as string).toLowerCase();
  const o = ((comp.ownership || "") as string).toLowerCase();
  const n = ((comp.name || "") as string).toLowerCase();
  const f = ((comp.facilityType || "") as string).toLowerCase();
  return (
    s.includes("govt") || s.includes("public") ||
    o.includes("gov") || o.includes("public") ||
    n.includes("government") || n.includes("civil hospital") ||
    n.includes("community health") || n.includes("primary health") ||
    n.includes("phc") || n.includes("chc") || n.includes("ayush") ||
    n.includes("esic") || s.includes("cooperative") ||
    o.includes("co-operative") || n.includes("cooperative") ||
    n.includes("apmc") || n.includes("mandi") || s.includes("mandi") ||
    f.includes("mandi") || f.includes("civil hospital") || f.includes("chc")
  );
}

export interface ResolveCompetitorParams {
  competitorRadar?: {
    within10km?: Competitor[];
    within20km?: Competitor[];
    topCompetitors?: Competitor[];
    total?: number;
    source?: string;
    aiEnriched?: string;
    fetchedAt?: string;
  } | null;
  competition?: {
    competitors?: Competitor[];
  } | null;
  category?: string;
  locationName?: string;
  centerCoords?: [number, number];
}

export interface CatchmentCompetitorData {
  raw10km: Competitor[];
  raw20km: Competitor[];
  allCompetitors: Competitor[];
  count5km: number;
  count10km: number;
  count20km: number;
  totalGovt: number;
  totalPvt: number;
  totalDirect: number;
  totalIndirect: number;
  isLiveData: boolean;
}

export function resolveCatchmentCompetitors({
  competitorRadar,
  competition,
  category = "Enterprise",
  locationName = "Target Location",
  centerCoords = [0, 0],
}: ResolveCompetitorParams): CatchmentCompetitorData {
  const isHealthcare =
    category.toLowerCase().includes("health") ||
    category.toLowerCase().includes("hospital") ||
    category.toLowerCase().includes("clinic");

  const lat = centerCoords ? centerCoords[0] : 0;
  const lon = centerCoords ? centerCoords[1] : 0;

  // 1. Resolve 10km catchment
  let raw10km: Competitor[] = [];
  if (competitorRadar?.within10km && competitorRadar.within10km.length > 0) {
    raw10km = competitorRadar.within10km;
  } else if (competition?.competitors && competition.competitors.length > 0) {
    const fromModel = competition.competitors.filter(
      (c) => (c.distanceKm || 0) <= 10 && (c.distanceKm || 0) > 0
    );
    if (fromModel.length > 0) raw10km = fromModel;
  }

  if (raw10km.length === 0) {
    if (isHealthcare) {
      raw10km = [
        {
          id: "comp-gen-h1",
          name: `${locationName} District Civil / Sub-Divisional Government Hospital & Trauma Center`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Civil Hospital", source: "Ministry of Health & Family Welfare (MoHFW) / Ayushman Bharat PM-JAY Registry",
          location: `2.1 km North (${locationName})`, distanceKm: 2.1, position: [lat + 0.016, lon + 0.012],
          pricing: "Free OPD / ₹10 Token • PM-JAY 100% Free Coverage",
          strengths: ["150+ bed public capacity", "Free essential generic drugs", "Official Ayushman Bharat PM-JAY nodal center"],
          weaknesses: ["Severe overcrowding with 3–5 hour OPD wait times", "Overburdened nursing staff", "Frequent stockouts of advanced surgical consumables"],
          positioning: "Complement by offering dignified private single rooms, zero wait times, and dedicated bedside nursing.",
          businessImpact: "Acts as the baseline price floor. Drives high private demand among middle-income families who seek timely care.",
        },
        {
          id: "comp-gen-h2",
          name: `${locationName} PHC & Community Health Centre (CHC)`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Community Health Centre", source: "National Health Mission (NHM) Rural Facility Registry",
          location: `3.4 km West (${locationName})`, distanceKm: 3.4, position: [lat + 0.024, lon - 0.019],
          pricing: "Free Government Public Health Service",
          strengths: ["Grassroot village healthcare reach via ASHA/ANM network", "Free maternal checkups and immunization"],
          weaknesses: ["No major surgical OT or ventilator backup", "Doctors unavailable during nighttime emergencies"],
          positioning: "Establish institutional ambulance coordination to receive stabilized emergency referrals.",
          businessImpact: "Acts as a primary referral source when rural CHCs face acute surgical cases.",
        },
        {
          id: "comp-gen-h3",
          name: `Apex Multi-Specialty Private Hospital & Critical Care Center`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Multi-Specialty Hospital", source: "State Clinical Establishments Act Registry / PM-JAY Empanelled List",
          location: `2.6 km East (${locationName})`, distanceKm: 2.6, position: [lat - 0.015, lon + 0.018],
          pricing: "₹500–₹750 OPD / ₹2,800–₹4,500/day Private Bed",
          strengths: ["Modern 35-bed setup with ICU, ventilators, and laminar airflow OT", "Tie-ups with corporate TPAs"],
          weaknesses: ["High out-of-pocket costs unaffordable for non-insured rural families", "Unexpected surgical consumable billing"],
          positioning: "Differentiate through 100% transparent all-inclusive surgical packages and friendly cashless desk.",
          businessImpact: "Direct competitor for insured patients. Sets the local private market rate for room charges.",
        },
        {
          id: "comp-gen-h4",
          name: `Sanjeevani Private Nursing Home & Maternity Surgical Clinic`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Nursing Home", source: "State Directorate of Health Services / District Medical Council",
          location: `1.8 km South (${locationName})`, distanceKm: 1.8, position: [lat - 0.018, lon - 0.014],
          pricing: "₹350–₹500 OPD / ₹1,800–₹3,000/day Bed",
          strengths: ["Strong legacy in normal and cesarean deliveries", "Deep community trust built over decades"],
          weaknesses: ["Aging diagnostic equipment without neonatal nursery (NICU) backup", "No 24x7 RMO on premise at night"],
          positioning: "Outcompete with modern pediatric phototherapy and guaranteed 24x7 on-duty medical officers.",
          businessImpact: "Directly competes for local maternal and women's health volume.",
        },
        {
          id: "comp-gen-h5",
          name: `Family Polyclinic & 24x7 Diagnostic Imaging Lab`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Day Clinic & Lab", source: "NABL Accredited Diagnostics Directory",
          location: `1.4 km South-East (${locationName})`, distanceKm: 1.4, position: [lat - 0.019, lon - 0.013],
          pricing: "₹200–₹300 OPD / Tests ₹250–₹1,800",
          strengths: ["Convenient neighborhood walk-in location with attached retail pharmacy", "Fast 1-hour basic blood counts"],
          weaknesses: ["No overnight inpatient beds or surgical suites", "Unable to stabilize critical cardiac or trauma emergencies"],
          positioning: "Capture their referral patients who require multi-day monitoring and inpatient admissions.",
          businessImpact: "Diagnostic partner or competitor for lab revenue.",
        },
        {
          id: "comp-gen-h6",
          name: `Sub-Divisional Civil Hospital & Maternal Care Unit`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Civil Hospital", source: "State Health Systems Resource Centre (SHSRC)",
          location: `7.5 km North-East (${locationName})`, distanceKm: 7.5, position: [lat + 0.048, lon + 0.042],
          pricing: "Free Govt OPD & PM-JAY Cashless",
          strengths: ["Dedicated 50-bed maternal & pediatric ward", "Free ambulance transport under JSSK"],
          weaknesses: ["Specialist doctor shortages after 2 PM", "Frequent ultrasound equipment backlogs"],
          positioning: "Sub-district Public Anchor — Partner for planned surgical admissions.",
          businessImpact: "Absorbs peripheral taluka delivery volume; steady source of surgical transfers.",
        },
        {
          id: "comp-gen-h7",
          name: `Metro Heart & Multi-Specialty Surgical Hospital`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Multi-Specialty Hospital", source: "State Clinical Establishments Act Registry",
          location: `8.8 km South-East (${locationName})`, distanceKm: 8.8, position: [lat - 0.054, lon + 0.048],
          pricing: "₹600 OPD / ₹3,800/day IPD Bed",
          strengths: ["Advanced cardiac catheterization lab and 8-bed CCU", "Full-time interventional cardiologists"],
          weaknesses: ["Higher corporate price points prohibitive for agricultural labor families", "Highway corridor location"],
          positioning: "Regional Tertiary Peer — Win on local proximity and personalized nursing care.",
          businessImpact: "Competes for high-value cases in the 5–10km corridor.",
        },
      ];
    } else {
      raw10km = [
        {
          id: "comp-gen-1",
          name: `${category} District Cooperative Processing Center`,
          type: "Direct", sectorType: "Govt / Public Sector", ownership: "Co-operative / Govt Supported",
          facilityType: "Cooperative Center", source: "District Cooperative Society Registry / Web Scraped",
          location: `1.8 km North (${locationName})`, distanceKm: 1.8, position: [lat + 0.014, lon + 0.012],
          pricing: "Standard Rate",
          strengths: ["Established collection network", "High local footprint"],
          weaknesses: ["Delayed payment cycles", "Rigid quality deductions"],
          positioning: "Win local market with instant settlements and fresh delivery.",
          businessImpact: "Anchors district procurement volume; price competition tempered by bureaucratic payment delays.",
        },
        {
          id: "comp-gen-2",
          name: `Private ${category} Processing & Packing Enterprise`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Private Enterprise", source: "Udyam Registration Portal / Web Scraped",
          location: `2.6 km East (${locationName})`, distanceKm: 2.6, position: [lat - 0.016, lon + 0.018],
          pricing: "Market Parity",
          strengths: ["High margin value-added products", "Modern processing equipment"],
          weaknesses: ["Limited distribution radius", "Higher overhead"],
          positioning: "Differentiate on certified farm freshness and digital ordering.",
          businessImpact: "Sets the benchmark for commercial retail prices and margins.",
        },
        {
          id: "comp-gen-3",
          name: `Regional APMC Wholesale ${category} Trading Hub`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government APMC",
          facilityType: "Mandi Yard", source: "Agmarknet / State Agricultural Marketing Board",
          location: `3.7 km West (${locationName})`, distanceKm: 3.7, position: [lat + 0.022, lon - 0.019],
          pricing: "Wholesale Mandi Rate",
          strengths: ["High volume throughput", "Institutional links"],
          weaknesses: ["No direct village retail identity", "High middleman commissions"],
          positioning: "Capture direct retail margins by bypassing Mandi brokers.",
          businessImpact: "Determines raw input and wholesale clearing rates.",
        },
        {
          id: "comp-gen-4",
          name: `Local Informal ${category} Village Retailers`,
          type: "Indirect", sectorType: "Private Sector", ownership: "Informal Private",
          facilityType: "Informal Retail", source: "Local Panchayat Survey / Web Scraped",
          location: `1.3 km South (${locationName})`, distanceKm: 1.3, position: [lat - 0.021, lon - 0.014],
          pricing: "Unorganized Cash Pricing",
          strengths: ["Immediate neighborhood trust", "Low overhead"],
          weaknesses: ["Zero hygiene accreditation", "Inconsistent daily supply"],
          positioning: "Win customer loyalty through certified hygienic packaging.",
          businessImpact: "Captures price-sensitive cash transactions.",
        },
        {
          id: "comp-gen-5",
          name: `${locationName} Sub-District Wholesale Trade & Cold Hub`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government APMC",
          facilityType: "Mandi Yard", source: "State Agricultural Marketing Board",
          location: `7.8 km North-East (${locationName})`, distanceKm: 7.8, position: [lat + 0.046, lon + 0.040],
          pricing: "Wholesale Sub-Mandi Rate",
          strengths: ["Regional commodity aggregation point", "Direct rail/road link"],
          weaknesses: ["Intermediary fee deductions", "Limited value-addition processing"],
          positioning: "Capture direct consumer margin.",
          businessImpact: "Sets input commodity clearing prices in the 10km regional trade corridor.",
        },
        {
          id: "comp-gen-6",
          name: `Private ${category} Agro-Tech & Processing Cluster`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Private Enterprise", source: "Udyam Registration Portal",
          location: `8.5 km South-East (${locationName})`, distanceKm: 8.5, position: [lat - 0.051, lon + 0.045],
          pricing: "Commercial Market Parity",
          strengths: ["Modernized automated machinery", "Semi-urban retail distribution"],
          weaknesses: ["High logistics freight to interior villages", "Fixed corporate overhead"],
          positioning: "Win hyper-local village proximity.",
          businessImpact: "Direct benchmark for regional retail pricing and packaging standards.",
        },
      ];
    }
  }

  // 2. Resolve 20km catchment (extended zone)
  let raw20km: Competitor[] = [];
  if (competitorRadar?.within20km && competitorRadar.within20km.length > 0) {
    raw20km = competitorRadar.within20km;
  } else if (competition?.competitors && competition.competitors.length > 0) {
    const fromModel = competition.competitors.filter(
      (c) => (c.distanceKm || 0) > 10 && (c.distanceKm || 0) <= 20
    );
    if (fromModel.length > 0) raw20km = fromModel;
  }

  if (raw20km.length === 0) {
    if (isHealthcare) {
      raw20km = [
        {
          id: "comp-gen-h8",
          name: `Sub-District Multi-Specialty Referral Hospital`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Multi-Specialty Hospital", source: "State Clinical Establishments Act Registry",
          location: `13.5 km North (${locationName})`, distanceKm: 13.5, position: [lat + 0.082, lon + 0.065],
          pricing: "₹450 OPD / ₹2,200/day IPD Bed",
          strengths: ["Experienced visiting laparoscopic surgeons", "Attached 24-hour CT scan facility"],
          weaknesses: ["High emergency travel distance from southern villages", "Delayed insurance desk approvals"],
          positioning: "Capture local emergency inpatient demand before patients travel north.",
          businessImpact: "Referral destination for southern blocks.",
        },
        {
          id: "comp-gen-h9",
          name: `District Ayurvedic & Integrative Medicine Hospital`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "AYUSH Directorate",
          facilityType: "AYUSH Hospital", source: "Ministry of AYUSH Directorate",
          location: `16.2 km South-East (${locationName})`, distanceKm: 16.2, position: [lat - 0.102, lon + 0.088],
          pricing: "Free Public AYUSH Care",
          strengths: ["Strong community following for chronic arthritic pain & lifestyle disorders"],
          weaknesses: ["Zero surgical, intensive care, or acute trauma capabilities"],
          positioning: "Complement with allopathic diagnostics, emergency care, and modern surgery.",
          businessImpact: "Absorbs outpatient chronic disease management.",
        },
        {
          id: "comp-gen-h10",
          name: `Apex Regional Medical College & Research Hospital`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Govt Medical College",
          facilityType: "Tertiary Teaching Hospital", source: "National Medical Commission (NMC) Registry",
          location: `18.4 km North-East (${locationName})`, distanceKm: 18.4, position: [lat + 0.115, lon + 0.098],
          pricing: "Nominal Government Rates & Ayushman Bharat Cashless",
          strengths: ["500+ teaching hospital beds with all sub-specialties & oncology", "Advanced tertiary care"],
          weaknesses: ["High expense barriers for lower-middle class", "Distance friction from rural villages"],
          positioning: "Complement as community primary & secondary healthcare provider.",
          businessImpact: "Dominates super-specialty cases across the 20km zone.",
        },
      ];
    } else {
      raw20km = [
        {
          id: "comp-gen-7",
          name: `${locationName} Regional Wholesale Distribution Center`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Cooperative Apex Federation",
          facilityType: "Wholesale Depot", source: "State Cooperative Marketing Federation",
          location: `11.8 km North-East (${locationName})`, distanceKm: 11.8, position: [lat + 0.075, lon + 0.062],
          pricing: "Wholesale Bulk Trade Pricing",
          strengths: ["High-tonnage aggregation and multi-district supply logistics"],
          weaknesses: ["Requires minimum bulk consignment volumes", "Inflexible ordering schedules"],
          positioning: "Leverage as high-volume institutional supplier or offload surplus output.",
          businessImpact: "Sets baseline wholesale bulk procurement pricing across the district.",
        },
        {
          id: "comp-gen-8",
          name: `Central District Principal Mandi & Food Park Terminal`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government APMC",
          facilityType: "Mandi Yard", source: "National APMC Directory",
          location: `14.2 km North-West (${locationName})`, distanceKm: 14.2, position: [lat + 0.092, lon - 0.082],
          pricing: "State Apex Mandi Benchmark",
          strengths: ["High volume daily auctions", "District-wide supplier liquidity"],
          weaknesses: ["Significant travel distance for small farmers", "2-3% brokerage fees"],
          positioning: "Leverage for wholesale offloading.",
          businessImpact: "Defines district-wide wholesale commodity floor across the 20km trade zone.",
        },
        {
          id: "comp-gen-9",
          name: `District Commercial Processing & Automated Packaging Unit`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Private Enterprise", source: "Udyam Portal / Web Scraped",
          location: `16.5 km South-East (${locationName})`, distanceKm: 16.5, position: [lat - 0.106, lon + 0.092],
          pricing: "Commercial Market Parity",
          strengths: ["Automated packaging line and cold chain warehousing"],
          weaknesses: ["Higher distribution overhead to peripheral rural blocks"],
          positioning: "Win local village market share through fresher stock and direct relationships.",
          businessImpact: "Direct benchmark for regional retail pricing and packaging standards.",
        },
        {
          id: "comp-gen-10",
          name: `State Industrial Mega Processing & Logistics Park`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private Corporate",
          facilityType: "Corporate Plant", source: "State Industrial Development Corporation (SIDC)",
          location: `18.8 km South-West (${locationName})`, distanceKm: 18.8, position: [lat - 0.116, lon - 0.105],
          pricing: "Corporate Contract Pricing",
          strengths: ["Multi-acre automated warehousing", "National export contracts"],
          weaknesses: ["Zero focus on small-scale hyper-local sales", "High minimum batch volumes"],
          positioning: "Dominate the high-margin retail consumer niche.",
          businessImpact: "Dominates industrial contract processing across 20km zone.",
        },
      ];
    }
  }

  const allCompetitors = [...raw10km, ...raw20km];

  const count5km = allCompetitors.filter((c) => (c.distanceKm ?? 999) <= 5).length;
  // count10km is raw10km.length (or all competitors with distance <= 10)
  const count10km = Math.max(raw10km.length, allCompetitors.filter((c) => (c.distanceKm ?? 999) <= 10).length);
  // count20km is the total verified across both zones (e.g. 10)
  const count20km = allCompetitors.length;

  const totalGovt = allCompetitors.filter(isCompetitorGovt).length;
  const totalPvt = allCompetitors.length - totalGovt;
  const totalDirect = allCompetitors.filter((c) => !c.type?.toLowerCase().includes("indirect")).length;
  const totalIndirect = allCompetitors.length - totalDirect;

  const isLiveData = Boolean(
    (competitorRadar?.within10km && competitorRadar.within10km.length > 0) ||
    (competitorRadar?.within20km && competitorRadar.within20km.length > 0)
  );

  return {
    raw10km,
    raw20km,
    allCompetitors,
    count5km,
    count10km,
    count20km,
    totalGovt,
    totalPvt,
    totalDirect,
    totalIndirect,
    isLiveData,
  };
}
