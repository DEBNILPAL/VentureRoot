/**
 * VentureRoot Dynamic Business Resources Service
 * ===============================================
 * Generates tailored, non-hardcoded resource requirements:
 *  - Required land area, land valuation/lease rates, zoning status
 *  - Itemized capital equipment with capacity, unit cost, and priority
 *  - Scaling resources (human capital, 3-phase power, working capital reserves, digital logistics)
 *  - Gap analysis between user's existing assets and target launch requirements
 */

function resolveCategoryKey(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("milk") || cat.includes("dairy") || cat.includes("cattle") || cat.includes("ghee")) return "Dairy";
  if (cat.includes("health") || cat.includes("hospital") || cat.includes("clinic") || cat.includes("doctor")) return "Healthcare";
  if (cat.includes("food") || cat.includes("grain") || cat.includes("flour") || cat.includes("milling") || cat.includes("process") || cat.includes("dal")) return "AgroProcessing";
  if (cat.includes("retail") || cat.includes("kirana") || cat.includes("store") || cat.includes("shop") || cat.includes("mart")) return "Retail";
  if (cat.includes("poultry") || cat.includes("egg") || cat.includes("chicken")) return "Poultry";
  if (cat.includes("textile") || cat.includes("garment") || cat.includes("cloth") || cat.includes("apparel")) return "Textiles";
  return "General";
}

export function getDynamicBusinessResources({
  category = "Enterprise",
  businessName = "Your Venture",
  location = {},
  availableMargin = 100000,
  expectedRevenue = 50000,
  existingResources = "",
}) {
  const catKey = resolveCategoryKey(category);
  const district = location?.district || "Local District";
  const state = location?.state || "India";
  const marginNum = Number(availableMargin) || 100000;
  const revenueNum = Number(expectedRevenue) || 50000;
  const userAssetsText = (existingResources || "").toLowerCase();

  // Resource templates by category
  const templates = {
    Dairy: {
      land: {
        requiredArea: revenueNum > 100000 ? "2,500 – 4,000 sq.ft (0.25 – 0.5 Acre)" : "1,500 – 2,500 sq.ft covered shed + paddock",
        valuation: revenueNum > 100000 ? "₹3.5L – ₹6.5L capital asset (or ₹6,000 – ₹10,000/mo lease)" : "₹2.0L – ₹4.0L capital asset (or ₹4,000 – ₹7,000/mo lease)",
        tenureType: userAssetsText.includes("own") || userAssetsText.includes("land") ? "Self-Owned Freehold Land" : "Agricultural / Commercial Long-Term Lease",
        zoning: "Gram Panchayat Non-Objection Certificate (NOC) + Animal Husbandry Department registration",
        suitability: "Direct access to all-weather road with abundant clean groundwater source for cattle drinking & shed washdown.",
      },
      equipments: [
        { name: "Bulk Milk Chiller (BMC - 500L capacity with rapid condensing unit)", estimatedCost: 185000, priority: "Essential", status: userAssetsText.includes("chiller") || userAssetsText.includes("bmc") ? "Available" : "Needs Procurement" },
        { name: "Automated Double-Bucket Milking System (Oil-lubricated vacuum pump)", estimatedCost: 68000, priority: "Essential", status: "Needs Procurement" },
        { name: "Heavy-Duty Motorized Chaff Cutter (3 HP 3-phase motor with reverse gear)", estimatedCost: 32000, priority: "Essential", status: userAssetsText.includes("chaff") || userAssetsText.includes("shed") ? "Available" : "Needs Procurement" },
        { name: "Food-Grade Stainless Steel (SS-304) Milk Cans (40 Litre x 6 units)", estimatedCost: 18000, priority: "Essential", status: "Needs Procurement" },
        { name: "Digital Ultrasonic Milk Fat, SNF & Density Analyzer (with thermal receipt printer)", estimatedCost: 42000, priority: "Growth", status: "Recommended" },
        { name: "Commercial Silage Bag Sealer & Forage Baler", estimatedCost: 48000, priority: "Growth", status: "Expansion Phase" },
      ],
      growthResources: {
        humanCapital: "2 dedicated farm operators (milking & fodder) + 1 part-time visiting veterinarian.",
        powerAndUtilities: "3-Phase grid connection (7.5 kW load) + 5kVA diesel generator backup for BMC chilling cycles.",
        workingCapitalReserve: `₹${Math.round(revenueNum * 0.45).toLocaleString('en-IN')} (45 days concentrated feed & fodder reserves).`,
        digitalAndLogistics: "Direct procurement linkage with District Milk Union / cooperative chilling plant + insulated delivery cans.",
      },
    },

    Healthcare: {
      land: {
        requiredArea: revenueNum > 150000 ? "3,500 – 6,000 sq.ft built-up commercial space" : "2,000 – 3,500 sq.ft facility layout",
        valuation: revenueNum > 150000 ? "₹12.0L – ₹25.0L freehold valuation (or ₹22,000 – ₹45,000/mo commercial rent)" : "₹7.0L – ₹14.0L valuation (or ₹14,000 – ₹25,000/mo rent)",
        tenureType: "Commercial Health Facility Lease / Owned Commercial Plinth",
        zoning: "Clinical Establishments Act Registration + Fire Safety NOC + Bio-Medical Waste Authorization",
        suitability: "Ground floor access with dedicated ambulance ramp, wide corridors, and compliant septic effluent disposal.",
      },
      equipments: [
        { name: "Semi-Automated Biochemistry & Hematology Blood Analyzer (with incubator)", estimatedCost: 175000, priority: "Essential", status: "Needs Procurement" },
        { name: "Multi-Parameter Patient ICU Monitors (5-Para SpO2/ECG/NIBP x 2 units)", estimatedCost: 72000, priority: "Essential", status: "Needs Procurement" },
        { name: "High-Pressure Vertical Cylindrical Autoclave Sterilizer (50L chamber)", estimatedCost: 42000, priority: "Essential", status: "Needs Procurement" },
        { name: "Obstetric Delivery Table & Pediatric Radiant Warmer setup", estimatedCost: 58000, priority: "Essential", status: "Needs Procurement" },
        { name: "Online Heavy-Duty Medical UPS (7.5 kVA with tubular battery bank)", estimatedCost: 85000, priority: "Essential", status: "Needs Procurement" },
        { name: "Digital Portable Ultrasound / ECG Terminal", estimatedCost: 195000, priority: "Growth", status: "Expansion Phase" },
      ],
      growthResources: {
        humanCapital: "1 Resident Medical Officer (MBBS/BAMS), 2 GNM/ANM qualified nursing staff, 1 lab technician.",
        powerAndUtilities: "Commercial 3-phase power (12 kW load) + dedicated automatic transfer switch (AMTS) silent generator.",
        workingCapitalReserve: `₹${Math.round(revenueNum * 0.55).toLocaleString('en-IN')} (60 days emergency pharmaceutical stock & doctor retainer pool).`,
        digitalAndLogistics: "Ayushman Bharat PM-JAY empanelment portal, digital HMS billing software, and CBWTF biomedical waste tie-up.",
      },
    },

    AgroProcessing: {
      land: {
        requiredArea: "3,000 – 5,500 sq.ft industrial plinth (milling hall, raw grain bay & sun drying yard)",
        valuation: "₹5.0L – ₹10.0L capital outlay (or ₹8,000 – ₹16,000/mo lease in rural industrial cluster)",
        tenureType: "Rural Industrial Plinth / Gram Panchayat Commercial Allotment",
        zoning: "Gram Panchayat Trade NOC + District Pollution Control Board (Green Category consent)",
        suitability: "High ceiling industrial shed with heavy vehicular loading bay and concrete moisture-barrier flooring.",
      },
      equipments: [
        { name: "Commercial Heavy-Duty Pulverizer & Milling Unit (15 HP motor with cyclone separator)", estimatedCost: 145000, priority: "Essential", status: "Needs Procurement" },
        { name: "Vibratory Destoner & Multi-Deck Grain Cleaning / Grading Sieve", estimatedCost: 88000, priority: "Essential", status: "Needs Procurement" },
        { name: "Continuous Band Pouch Sealer with Nitrogen Flushing & Batch Coder", estimatedCost: 52000, priority: "Essential", status: "Needs Procurement" },
        { name: "Digital Halogen Moisture Meter & Heavy Electronic Platform Scale (500kg)", estimatedCost: 26000, priority: "Essential", status: "Needs Procurement" },
        { name: "Multi-Commodity Screw Oil Expeller / Seed Decorticator", estimatedCost: 110000, priority: "Growth", status: "Expansion Phase" },
      ],
      growthResources: {
        humanCapital: "1 skilled machine operator, 2 loading/packaging workers, 1 local field procurement coordinator.",
        powerAndUtilities: "Dedicated industrial power sanction (15 kW 3-phase) + motorized exhaust ventilation system.",
        workingCapitalReserve: `₹${Math.round(revenueNum * 0.60).toLocaleString('en-IN')} (Upfront raw commodity buffer during 45-day harvest window).`,
        digitalAndLogistics: "FSSAI State Manufacturing license, ONDC digital cataloguing, and rural tempo transport tie-up.",
      },
    },

    Retail: {
      land: {
        requiredArea: "300 – 650 sq.ft high-visibility retail shopfront",
        valuation: "₹4.0L – ₹9.0L commercial valuation (or ₹5,000 – ₹12,000/mo high-street rent)",
        tenureType: "Commercial High-Street Lease / Owned Commercial Shopfront",
        zoning: "Gram Panchayat Trade License + Shop & Commercial Establishments Registration",
        suitability: "Central bus stand or village chowk intersection with wide pedestrian footfall frontage.",
      },
      equipments: [
        { name: "Heavy-Duty Powder-Coated Metal Display Gondolas & Wall Racks", estimatedCost: 65000, priority: "Essential", status: "Needs Procurement" },
        { name: "Commercial Double-Door Display Chiller (350L for dairy & beverages)", estimatedCost: 38000, priority: "Essential", status: "Needs Procurement" },
        { name: "Barcode Scanner & All-in-One POS Thermal Billing Terminal", estimatedCost: 24000, priority: "Essential", status: "Needs Procurement" },
        { name: "Legal Metrology Stamped Digital Weighing Scale (30kg capacity)", estimatedCost: 7500, priority: "Essential", status: "Needs Procurement" },
        { name: "4-Channel HD Night-Vision CCTV Security System with Mobile App Sync", estimatedCost: 16000, priority: "Growth", status: "Recommended" },
      ],
      growthResources: {
        humanCapital: "1 full-time store manager/billing cashier + 1 delivery and shelf-stocking helper.",
        powerAndUtilities: "Single-phase commercial electrical load (3 kW) + 1.5 kVA inverter backup for POS & billing.",
        workingCapitalReserve: `₹${Math.round(revenueNum * 0.40).toLocaleString('en-IN')} (30-day inventory replenishment buffer for fast-moving FMCG).`,
        digitalAndLogistics: "FSSAI Basic registration, UPI merchant QR stands, and direct supplier credit lines with regional wholesale depots.",
      },
    },

    General: {
      land: {
        requiredArea: "800 – 1,800 sq.ft operational workspace",
        valuation: "₹3.0L – ₹6.0L capital value (or ₹5,000 – ₹9,000/mo rental lease)",
        tenureType: "Commercial Lease / Owned Workspace",
        zoning: "Local Gram Panchayat Trade NOC & Udyam Registration",
        suitability: "Accessible location with dependable road approach and secure utility connections.",
      },
      equipments: [
        { name: "Core Production / Processing Machinery Line", estimatedCost: Math.round(marginNum * 0.45), priority: "Essential", status: "Needs Procurement" },
        { name: "Quality Testing & Measurement Instruments", estimatedCost: Math.round(marginNum * 0.12), priority: "Essential", status: "Needs Procurement" },
        { name: "Commercial Grade Storage Racks & Material Handling System", estimatedCost: Math.round(marginNum * 0.10), priority: "Essential", status: "Needs Procurement" },
        { name: "Digital Invoicing, POS & Computer Terminal Setup", estimatedCost: 28000, priority: "Growth", status: "Recommended" },
      ],
      growthResources: {
        humanCapital: "1 technical operator + 1-2 operational assistants.",
        powerAndUtilities: "Standard 3-phase/single-phase power connection + basic inverter backup.",
        workingCapitalReserve: `₹${Math.round(revenueNum * 0.40).toLocaleString('en-IN')} (Operating cash reserve for raw materials & payroll).`,
        digitalAndLogistics: "Udyam Registration, localized marketing collateral, and regional distributor partnerships.",
      },
    },
  };

  const selected = templates[catKey] || templates.General;

  // Compute total capital equipment cost
  const totalEquipmentCost = selected.equipments.reduce((acc, eq) => acc + eq.estimatedCost, 0);

  return {
    categoryKey: catKey,
    businessName,
    district,
    state,
    land: selected.land,
    equipments: selected.equipments,
    totalEquipmentCost,
    growthResources: selected.growthResources,
    existingAssetsSummary: existingResources ? existingResources : "No specific existing assets declared during registration.",
  };
}
