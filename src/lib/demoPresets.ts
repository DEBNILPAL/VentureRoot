export interface DemoBusinessPreset {
  id: string;
  label: string;
  tagline: string;
  // Wizard creation values (Used exclusively on Create Business page)
  wizard: {
    categoryQuery: string;
    name: string;
    description: string;
    state: string;
    district: string;
    block: string;
    village: string;
    availableMargin: number;
    expectedRevenue: number;
    existingResources: string;
    lat: number;
    lon: number;
  };
  // Analysis page values (Used exclusively on Market Analysis page - completely distinct sector & location)
  analysis: {
    businessName: string;
    category: string;
    businessModel: string;
    state: string;
    district: string;
    subdistrict: string;
    village: string;
    locationLabel: string;
    centerCoords: [number, number];
    availableMargin: number;
    projectCost: number;
    landType: string;
    targetScale: string;
    workingCapital: number;
    salesChannel: string;
    facilityType?: string;
    bedCapacity?: string;
    medicalSpecialties?: string;
  };
}

export const DEMO_PRESETS: DemoBusinessPreset[] = [
  {
    id: "rural-venture",
    label: "🌾 Rural Business Scenario",
    tagline: "Practical rural enterprise presets",
    // 1. INPUT SET FOR CREATE BUSINESS: Mustard & Spice Mill in Niphad, Nashik
    wizard: {
      categoryQuery: "Agro",
      name: "Gramin Mustard Oil & Spice Mill",
      description: "Small cold-press mustard oil expeller and local spice packaging unit for village markets.",
      state: "Maharashtra",
      district: "Nashik",
      block: "Niphad",
      village: "Pimpalgaon Baswant",
      availableMargin: 80000,
      expectedRevenue: 350000,
      existingResources: "Small 400 sq ft workspace shed, single phase power meter, 1 manual weighing scale.",
      lat: 20.1764,
      lon: 74.0504,
    },
    // 2. INPUT SET FOR ANALYSE PAGE (DIFFERENT VENTURE & LOCATION): Dairy Chilling & Value Addition in Anand, Gujarat
    analysis: {
      businessName: "Surabhi Rural Dairy & Chilling Unit",
      category: "Dairy & Animal Husbandry",
      businessModel: "Co-operative & Farmer Producer Model (FPO)",
      state: "Gujarat",
      district: "Anand",
      subdistrict: "Petlad",
      village: "Boriavi",
      locationLabel: "Boriavi, Petlad, Anand, Gujarat",
      centerCoords: [22.5645, 72.9289],
      availableMargin: 120000,
      projectCost: 650000,
      landType: "Owned Land / Premises",
      targetScale: "500 Liters / day Bulk Milk Chilling & Paneer Unit",
      workingCapital: 90000,
      salesChannel: "Regional Wholesalers & Distributors",
    },
  },
];
