/**
 * VentureRoot Risk & Analysis Engine
 * ====================================
 * Computes deep, multi-dimensional risk evaluations across 6 critical commercial angles:
 *  1. Market & Demand Risk
 *  2. Supply Chain & Input Cost Risk
 *  3. Operational & Human Capital Risk
 *  4. Statutory, Regulatory & Compliance Risk
 *  5. Financial & Cash Flow Risk
 *  6. Climate, Environmental & Seasonal Risk
 *
 * Grounded in the specific business category, scale, capital margin, and location attributes.
 */

// Sector-specific risk profiles across the 6 core commercial dimensions
const SECTOR_RISK_PROFILES = {
  Dairy: {
    market: {
      title: "Cooperative Price Cap & Private Under-Cutting",
      severity: "High",
      probability: "Medium",
      financialExposure: "8% – 14% gross margin squeeze",
      explanation: "District cooperative federations anchor local procurement rates. When unorganized private collectors undercut retail pricing or delay quality testing, local farmgate margins compress.",
      potentialImpact: "Suppressed realization per litre during flush season, slowing reinvestment into chilling and herd expansion.",
      mitigationAdvisory: "Diversify into higher-margin value-added dairy derivatives (paneer, curd, ghee) which offer 35-45% margins, and secure institutional direct-supply agreements with local sweet shops and canteens.",
    },
    supplyChain: {
      title: "Cattle Feed Inflation & Green Fodder Seasonality",
      severity: "High",
      probability: "High",
      financialExposure: "Up to 22% increase in monthly operating expenses",
      explanation: "Concentrated cattle feed (oil cakes, maize, de-oiled rice bran) exhibits high seasonal volatility. Summer fodder scarcity leads to milk yield drops of 15–25%.",
      potentialImpact: "Cost of production rises above ₹38/litre during lean dry months, eroding operating cash flow.",
      mitigationAdvisory: "Contract long-term silage pit arrangements with local fodder farmers, utilize Azolla cultivation for low-cost protein supplement, and procure feed wholesale during harvest troughs.",
    },
    operational: {
      title: "Cold Chain Breakdown & Microbial Spoilage",
      severity: "Critical",
      probability: "Medium",
      financialExposure: "Direct inventory write-off of up to 100% of unchilled batch volume",
      explanation: "Raw milk is highly perishable and must be chilled to below 4°C within 3 hours of milking. Rural 3-phase grid power outages of 4-6 hours pose severe spoilage risks.",
      potentialImpact: "High bacterial counts (sour milk) leading to rejection at collection points and total loss of morning consignment.",
      mitigationAdvisory: "Install a diesel generator or solar-hybrid inverter backup dedicated to the Bulk Milk Chiller (BMC), and implement rapid sub-zero cooling plates.",
    },
    regulatory: {
      title: "FSSAI Food Safety Compliance & Antibiotic Testing",
      severity: "Medium",
      probability: "Low",
      financialExposure: "Statutory fines up to ₹2,00,000 and temporary operational suspension",
      explanation: "Mandatory FSSAI registration and compliance with Food Safety and Standards (Contaminants, Toxins and Residues) Regulations concerning antibiotic and aflatoxin limits.",
      potentialImpact: "Consignment rejection by commercial dairy plants and legal compliance notices.",
      mitigationAdvisory: "Maintain strict animal health logs, observe withdrawal periods after veterinary antibiotic treatments, and secure FSSAI basic registration prior to commercial distribution.",
    },
    financial: {
      title: "Delayed Payment Cycles from Processing Dairies",
      severity: "High",
      probability: "High",
      financialExposure: "15 to 30 days working capital blockage (₹45,000–₹1,20,000)",
      explanation: "Institutional procurement agencies and private dairy plants typically settle dues on a bi-weekly or monthly cycle, while daily labor and cattle feed require immediate cash payouts.",
      potentialImpact: "Short-term liquidity crunch forcing the entrepreneur to resort to informal high-interest emergency borrowing.",
      mitigationAdvisory: "Maintain a minimum 45-day operational cash reserve (₹60,000–₹1,00,000) and establish a Kisan Credit Card (KCC) for animal husbandry with 7% concessional interest.",
    },
    environmental: {
      title: "Heat Stress & Vector-Borne Disease Outbreaks",
      severity: "Medium",
      probability: "Medium",
      financialExposure: "15–25% temporary drop in milk yield + veterinary emergency costs",
      explanation: "Severe summer temperatures (>40°C) induce thermal stress in high-yielding crossbred cattle, causing acute drop in lactation and increased susceptibility to mastitis and foot-and-mouth disease (FMD).",
      potentialImpact: "Substantial loss of daily milking volume and increased veterinary medication outlays.",
      mitigationAdvisory: "Design ventilated sheds with ceiling sprinklers, green shade nets, rubber flooring, and adhere strictly to the National Animal Disease Control Programme (NADCP) vaccination calendar.",
    },
  },

  Healthcare: {
    market: {
      title: "Patient Footfall Divergence to District Civil Hospital",
      severity: "High",
      probability: "Medium",
      financialExposure: "20%–35% initial OPD patient volume deficit",
      explanation: "District government hospitals and CHCs offer free consultations and PM-JAY coverage, setting a high price barrier for private consultations among agricultural families.",
      potentialImpact: "Lower than projected paid walk-in visits in the initial 4 months of clinic launch.",
      mitigationAdvisory: "Empanel with Ayushman Bharat PM-JAY and state health schemes, organize free weekly screening camps in surrounding gram panchayats, and offer all-inclusive package pricing.",
    },
    supplyChain: {
      title: "Emergency Drug & Surgical Consumable Stockouts",
      severity: "High",
      probability: "Medium",
      financialExposure: "Delayed critical procedures + lost pharmacy retail revenue",
      explanation: "Peripheral rural clinics face 24-48 hour delivery lead times from district pharmaceutical distributors for specialized injectable antibiotics, IV fluids, and surgical kits.",
      potentialImpact: "Inability to stabilize acute trauma or maternal emergencies, necessitating immediate outward transfers.",
      mitigationAdvisory: "Establish dual-vendor wholesale accounts with pharma distributors in the district headquarters and maintain a 30-day revolving buffer stock of essential lifesaving medicines.",
    },
    operational: {
      title: "Specialist Doctor & Night RMO Attrition",
      severity: "Critical",
      probability: "High",
      financialExposure: "30%–50% drop in inpatient admissions during doctor absences",
      explanation: "Attracting and retaining qualified MBBS/MD resident doctors and GNM nursing staff in rural and semi-urban talukas is difficult due to urban migration.",
      potentialImpact: "Closure of 24x7 emergency and inpatient night admissions, damaging community trust.",
      mitigationAdvisory: "Offer competitive profit-sharing incentives, provide furnished on-campus staff housing, and partner with visiting visiting specialists on a revenue-share model.",
    },
    regulatory: {
      title: "Clinical Establishments Act & Bio-Medical Waste (BMW) Clearance",
      severity: "Critical",
      probability: "Medium",
      financialExposure: "Closure notices + statutory penalties up to ₹5,00,000",
      explanation: "Mandatory compliance with State Clinical Establishments (Registration and Regulation) Act, Fire Safety NOC, and Bio-Medical Waste Management Rules.",
      potentialImpact: "Immediate operational stay order or cancellation of facility license.",
      mitigationAdvisory: "Engage a certified regional Common Bio-Medical Waste Treatment Facility (CBWTF) for daily waste collection and secure temporary provisional registration before patient intake.",
    },
    financial: {
      title: "High Initial Capex & Delayed TPA/Insurance Reimbursements",
      severity: "High",
      probability: "High",
      financialExposure: "60–90 days receivables lag on insurance claims (₹1.5L–₹4.0L locked)",
      explanation: "Medical diagnostic and OT setups demand heavy upfront capital. Furthermore, insurance TPAs and government cashless schemes routinely take 45-90 days to settle claim vouchers.",
      potentialImpact: "Severe working capital strain to meet monthly staff salaries and pharmaceutical distributor payments.",
      mitigationAdvisory: "Negotiate 60-day credit lines with medical equipment manufacturers and maintain a 3-month operating reserve funded through MUDRA/Stand-Up India institutional credit.",
    },
    environmental: {
      title: "Monsoon Power Outages & Medical Oxygen Backup",
      severity: "High",
      probability: "Medium",
      financialExposure: "Life-safety liability + equipment damage from voltage surges",
      explanation: "Monsoon storm grid breakdowns can sever electricity for 8-12 hours, placing ICU ventilators, infant warmers, and vaccine refrigerators at extreme risk.",
      potentialImpact: "Critical patient safety events and permanent cold-chain failure for expensive vaccines.",
      mitigationAdvisory: "Mandate an automatic transfer switch (AMTS) silent diesel generator capable of powering the entire critical wing, supplemented by heavy-duty online UPS systems.",
    },
  },

  AgroProcessing: {
    market: {
      title: "Wholesale APMC Market Price Undercutting & Broker Cartels",
      severity: "High",
      probability: "High",
      financialExposure: "10%–18% margin contraction on bulk grain/pulse sales",
      explanation: "Middlemen and established commission agents in APMC mandis frequently collude to depress clearing rates for unbranded processed commodities during peak harvest arrivals.",
      potentialImpact: "Forced selling below cost of production if working capital runs dry during peak milling season.",
      mitigationAdvisory: "Bypass wholesale middlemen: establish direct retail packaged supply to neighborhood kirana stores, self-help groups (SHGs), and register on ONDC / eNAM for direct merchant bidding.",
    },
    supplyChain: {
      title: "Seasonal Raw Material Crop Failure & Quality Fluctuations",
      severity: "Critical",
      probability: "Medium",
      financialExposure: "30%–45% surge in raw commodity procurement costs",
      explanation: "Agro-processing units rely heavily on local farm output. Unseasonal rains, pest attacks (e.g. bollworm, rust), or drought can decimate local crop yields within a 25km catchment.",
      potentialImpact: "Mill idling at 20% capacity utilization due to raw material unavailability.",
      mitigationAdvisory: "Form direct procurement MoUs with local Farmer Producer Organizations (FPOs) across 3 neighboring blocks to de-risk raw material availability.",
    },
    operational: {
      title: "Machinery Breakdown During Peak Milling Season",
      severity: "High",
      probability: "Medium",
      financialExposure: "₹15,000–₹35,000 daily revenue loss during 5-day downtime",
      explanation: "Heavy-duty pulverizers, destoners, and expellers run at 16-20 hours daily during post-harvest months. Sourcing mechanical spare parts in rural blocks causes prolonged downtime.",
      potentialImpact: "Client farmer diversion to competing mills and loss of key processing contracts.",
      mitigationAdvisory: "Keep essential replacement parts (belts, bearings, blades, sieves) on-site and schedule pre-season preventative maintenance overhauls.",
    },
    regulatory: {
      title: "FSSAI Mandatory Packaging & Agmark Grading Norms",
      severity: "Medium",
      probability: "Low",
      financialExposure: "Seizure of retail packaged stock + fine up to ₹1,00,000",
      explanation: "Food processing enterprises require FSSAI manufacturing licenses, nutritional labeling, batch number tracing, and legal metrology weights & measures verification.",
      potentialImpact: "Rejection of retail distribution batches by regional supermarket chains and government retail cooperatives.",
      mitigationAdvisory: "Obtain FSSAI State/Basic manufacturing license, adopt barcoded batch labels, and calibrate digital weighing scales through the Department of Legal Metrology.",
    },
    financial: {
      title: "Working Capital Lock-in During 60-Day Harvest Window",
      severity: "Critical",
      probability: "High",
      financialExposure: "Need for ₹2,00,000–₹5,00,000 upfront liquidity in single month",
      explanation: "80% of raw grains and oilseeds must be purchased and stockpiled during the 45-60 day post-harvest window when prices are lowest, requiring heavy immediate liquidity.",
      potentialImpact: "Missing low-cost raw material window, forcing off-season procurement at 30% higher market rates.",
      mitigationAdvisory: "Leverage PMEGP / PMFME 35% capital subsidy and apply for warehouse receipt financing (e-NWR) against stored grain inventory from regional rural banks (RRBs).",
    },
    environmental: {
      title: "Warehouse Moisture, Rodent Infestation & Aflatoxin Spoilage",
      severity: "High",
      probability: "High",
      financialExposure: "12%–20% post-harvest inventory loss from dampness/pests",
      explanation: "Improper rural warehouse storage during the monsoon leads to moisture absorption (>14% moisture content), encouraging Aspergillus fungal mold and aflatoxin contamination.",
      potentialImpact: "Total loss of grain grade quality, rendering inventory unfit for commercial human consumption.",
      mitigationAdvisory: "Construct raised concrete plinth warehouses with dunnage pallets, install mechanical grain moisture meters, and conduct scheduled phosphine fumigation.",
    },
  },

  Retail: {
    market: {
      title: "Quick-Commerce Expansion & Urban Chain Price Undercutting",
      severity: "High",
      probability: "Medium",
      financialExposure: "12%–20% customer footfall diversion for packaged branded goods",
      explanation: "Expansion of regional wholesale cash-and-carry stores and e-commerce delivery networks reduces margin on standard FMCG and branded packaged goods.",
      potentialImpact: "Compression of gross margin below 12%, making standalone storefront rent unviable.",
      mitigationAdvisory: "Focus on hyper-local credit trust, customized phone/WhatsApp doorstep ordering, and stocking high-margin regional fresh produce and unbranded staples.",
    },
    supplyChain: {
      title: "Distributor Minimum Order Quantities (MOQ) & Supply Delays",
      severity: "Medium",
      probability: "Medium",
      financialExposure: "5%–10% dead stock accumulation from forced bulk buying",
      explanation: "District FMCG distributors enforce high minimum order thresholds to service rural stores, tying up valuable working capital in slow-moving SKUs.",
      potentialImpact: "Capital locked in slow-moving goods leading to stockouts of daily high-velocity essentials.",
      mitigationAdvisory: "Form a joint procurement club with 3-4 neighboring village shopkeepers to pool wholesale orders, and track SKU inventory turns on a mobile POS.",
    },
    operational: {
      title: "Inventory Shrinkage, Shelf Damage & Expiry Losses",
      severity: "Medium",
      probability: "High",
      financialExposure: "3%–6% annual revenue erosion from product expiry and leakage",
      explanation: "Unmonitored expiry dates on packaged foods, personal care, and dairy items result in unsaleable stock if distributor returns policies are rigid.",
      potentialImpact: "Direct write-off against net profit margins.",
      mitigationAdvisory: "Implement First-In-First-Out (FIFO) shelf stocking, run promotional discounts on goods approaching 30-day expiry, and enforce strict distributor return terms.",
    },
    regulatory: {
      title: "Gram Panchayat Trade License & GST Compliance",
      severity: "Low",
      probability: "Low",
      financialExposure: "Penalties for operating without local commercial trade registration",
      explanation: "Local village councils mandate commercial trade permits, and annual turnover exceeding ₹40 lakhs requires mandatory GST registration and e-invoicing.",
      potentialImpact: "Disruption by local tax inspectors and inability to claim input tax credit (ITC).",
      mitigationAdvisory: "Obtain Gram Panchayat trade license and Udyam MSME certificate, and operate basic digital accounting software (Vyapar / Tally).",
    },
    financial: {
      title: "Uncollected Customer Khata Credit (Bad Debts)",
      severity: "High",
      probability: "High",
      financialExposure: "15%–25% of monthly gross revenue trapped in unpaid local credit",
      explanation: "Rural retail relies heavily on informal customer credit books (Khata) tied to agricultural harvest cycles. Crop failures or migration can lead to irreversible defaults.",
      potentialImpact: "Severe working capital freeze, preventing timely replenishment of store inventory.",
      mitigationAdvisory: "Cap individual customer credit at ₹2,500 with a strict 30-day settlement policy, incentivize immediate UPI cash payments with a 2% discount, and log credit on digital ledger apps.",
    },
    environmental: {
      title: "Pest Infestation & Monsoonal Ambient Humidity",
      severity: "Low",
      probability: "Medium",
      financialExposure: "Damage to paper packaging and dry food stocks",
      explanation: "High rural humidity and rodents can destroy dry rations, flour sacks, and packaged confectionery.",
      potentialImpact: "Loss of retail merchandise and hygiene compliance complaints.",
      mitigationAdvisory: "Install metal display shelving, keep food bags on elevated wooden pallets 6 inches off the floor, and maintain regular pest control barriers.",
    },
  },

  Default: {
    market: {
      title: "Local Market Price Competition & Demand Fluctuations",
      severity: "High",
      probability: "Medium",
      financialExposure: "10%–18% gross margin contraction",
      explanation: "Rural markets exhibit high price sensitivity. When competitors launch aggressive promotions, price wars can temporarily depress unit margins.",
      potentialImpact: "Slower customer acquisition and extended timeline to achieve target monthly sales volume.",
      mitigationAdvisory: "Focus on superior product freshness, transparent packaging, reliable local delivery, and building direct personal relationships with community elders and institutional buyers.",
    },
    supplyChain: {
      title: "Raw Material Price Volatility & Transport Bottlenecks",
      severity: "High",
      probability: "Medium",
      financialExposure: "10%–20% cost surge during supply constraints",
      explanation: "Dependency on single regional suppliers can cause sudden procurement halts and price inflation when transport or supply lines face disruption.",
      potentialImpact: "Temporary operational downtime and inability to fulfill customer orders on schedule.",
      mitigationAdvisory: "Establish active supply accounts with at least two alternative regional suppliers and maintain a 21-day emergency buffer stock of essential input materials.",
    },
    operational: {
      title: "Unscheduled Rural Power Interruptions & Machinery Downtime",
      severity: "Medium",
      probability: "High",
      financialExposure: "10%–15% operational efficiency loss",
      explanation: "Unannounced grid load shedding and voltage fluctuations in rural talukas can cause machinery damage and stall commercial production lines.",
      potentialImpact: "Delays in meeting daily production targets and increased machinery wear and tear.",
      mitigationAdvisory: "Install servo voltage stabilizers on heavy electrical equipment and maintain a dual fuel/inverter generator backup for essential operations.",
    },
    regulatory: {
      title: "Statutory Licensing & Environmental Local Permits",
      severity: "Medium",
      probability: "Low",
      financialExposure: "Compliance notices and administrative penalties",
      explanation: "Operating without timely local Panchayat trade licenses, Udyam registration, or sector-specific pollution/hygiene permits risks statutory intervention.",
      potentialImpact: "Temporary suspension of commercial activities and legal notices.",
      mitigationAdvisory: "Process Udyam MSME registration online (zero fee) and secure the Gram Panchayat trade permit before commercial launch.",
    },
    financial: {
      title: "Working Capital Cashflow Mismatch During Initial Launch",
      severity: "High",
      probability: "High",
      financialExposure: "Cashflow shortfall of ₹50,000–₹1,50,000 in months 1–4",
      explanation: "Micro-enterprises frequently incur unexpected launch expenses while receivables take 30-45 days to realize, creating a severe early cash crunch.",
      potentialImpact: "Inability to pay vendor invoices and staff wages on time during initial growth phase.",
      mitigationAdvisory: "Maintain at least 3 months of operating expenses in reserve and apply for MUDRA Shishu/Kishor working capital loans early in the planning process.",
    },
    environmental: {
      title: "Monsoon Seasonality & Severe Weather Road Disruptions",
      severity: "Medium",
      probability: "Medium",
      financialExposure: "Temporary reduction in customer footfall and delivery logistics",
      explanation: "Heavy monsoon downpours and waterlogging can obstruct interior village approach roads and reduce commercial logistics mobility.",
      potentialImpact: "Lower transport efficiency and delayed deliveries to peripheral buyers.",
      mitigationAdvisory: "Stock critical raw materials ahead of the heavy monsoon months and coordinate local deliveries via all-weather transit routes.",
    },
  },
};

/**
 * Maps a business category to the closest sector risk profile
 */
function resolveSectorKey(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("milk") || cat.includes("dairy") || cat.includes("ghee") || cat.includes("cattle")) return "Dairy";
  if (cat.includes("health") || cat.includes("hospital") || cat.includes("clinic") || cat.includes("doctor") || cat.includes("nurs")) return "Healthcare";
  if (cat.includes("food") || cat.includes("process") || cat.includes("grain") || cat.includes("flour") || cat.includes("milling") || cat.includes("dal") || cat.includes("oil")) return "AgroProcessing";
  if (cat.includes("retail") || cat.includes("kirana") || cat.includes("store") || cat.includes("shop") || cat.includes("mart")) return "Retail";
  return "Default";
}

/**
 * Generates an authoritative, multi-angle risk evaluation tailored to the user's business.
 *
 * @param {Object} params
 * @param {string} params.category - Business category
 * @param {string} params.businessName - Business name
 * @param {string} params.locationName - District/village name
 * @param {number} params.availableMargin - Own promoter equity
 * @param {number} params.expectedRevenue - Target monthly revenue
 * @returns {Array<Object>} Comprehensive risk items across all 6 dimensions
 */
export function generateMultiAngleRiskAnalysis({
  category = "Agro-Processing",
  businessName = "Your Venture",
  locationName = "Target Location",
  availableMargin = 100000,
  expectedRevenue = 50000,
}) {
  const sectorKey = resolveSectorKey(category);
  const profile = SECTOR_RISK_PROFILES[sectorKey] || SECTOR_RISK_PROFILES.Default;

  const angles = [
    { key: "market", categoryName: "Market & Demand", icon: "TrendingDown" },
    { key: "supplyChain", categoryName: "Supply Chain & Input Costs", icon: "Truck" },
    { key: "operational", categoryName: "Operational & Human Capital", icon: "Wrench" },
    { key: "regulatory", categoryName: "Statutory & Regulatory", icon: "FileText" },
    { key: "financial", categoryName: "Financial & Cash Flow", icon: "DollarSign" },
    { key: "environmental", categoryName: "Climate & Seasonal", icon: "CloudRain" },
  ];

  let riskId = 1;

  return angles.map((angle) => {
    const data = profile[angle.key];
    const marginAmount = Number(availableMargin) || 100000;
    const revenueAmount = Number(expectedRevenue) || 50000;

    return {
      id: `risk-angle-${riskId++}`,
      title: data.title,
      category: angle.categoryName,
      angle: angle.key,
      severity: data.severity,
      probability: data.probability,
      financialExposure: data.financialExposure,
      explanation: `${data.explanation} (Contextualized for ${businessName} in ${locationName}).`,
      potentialImpact: `${data.potentialImpact} Based on your targeted monthly revenue of ₹${revenueAmount.toLocaleString('en-IN')}.`,
      mitigationAdvisory: `${data.mitigationAdvisory} Your available margin of ₹${marginAmount.toLocaleString('en-IN')} should allocate a dedicated reserve for this contingency.`,
      evidence: [
        {
          type: "RISK_ANALYSIS",
          label: `${angle.categoryName} Assessment`,
          source: "VentureRoot Multi-Angle Enterprise Risk Engine",
          date: new Date().toLocaleDateString("en-IN"),
          value: `${data.severity} Severity (${data.probability} Probability)`,
        },
      ],
    };
  });
}
