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
  };
}

export const DEMO_PRESETS: DemoBusinessPreset[] = [
  {
    id: "rural-venture",
    label: "🌾 Rural Business Scenario",
    tagline: "Practical rural enterprise presets",

    // 1. INPUT SET FOR CREATE BUSINESS:
    // Small Mustard Oil & Spice Processing Unit in Niphad, Nashik
    wizard: {
      categoryQuery: "Food",
      name: "Gramin Mustard Oil & Spice Mill",
      description:
        "Small-scale mustard oil extraction and spice grinding unit serving nearby village households and local shops.",
      state: "Maharashtra",
      district: "Nashik",
      block: "Niphad",
      village: "Pimpalgaon Baswant",

      // Modest personal savings available for starting the business
      availableMargin: 30000,

      // Realistic initial monthly revenue target for a very small unit
      expectedRevenue: 75000,

      existingResources:
        "Small family-owned workspace with electricity connection, basic weighing scale, storage shelves and simple packaging tools.",

      lat: 20.1764,
      lon: 74.0504,
    },

    // 2. INPUT SET FOR ANALYSE PAGE:
    // Small Dairy Collection & Value Addition Business in Anand, Gujarat
    analysis: {
      businessName: "Surabhi Rural Dairy Collection Unit",
      category: "Dairy",
      businessModel: "Small Local Dairy Collection Business",

      state: "Gujarat",
      district: "Anand",
      subdistrict: "Petlad",
      village: "Boriavi",
      locationLabel: "Boriavi, Petlad, Anand, Gujarat",
      centerCoords: [22.5645, 72.9289],

      // Modest personal contribution
      availableMargin: 40000,

      // Small starting project requiring external financing
      projectCost: 90000,

      landType: "Family-owned Small Premises",

      // Small village-level starting scale
      targetScale: "50–80 Liters per day milk collection",

      // Initial operating buffer
      workingCapital: 20000,

      salesChannel: "Nearby Village Households and Local Dairy Shops",
    },
  },
];