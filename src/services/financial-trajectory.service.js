/**
 * VentureRoot Dynamic Financial Trajectory Engine
 * ==================================================
 * Replaces static financial projections with realistic, mathematically-grounded
 * econometric modeling of monthly revenue, operating costs, and net margins/losses:
 *
 *  - Launch Drag (Months 1–2): Low capacity utilization (30–45%), initial marketing/commissioning
 *    expenses, leading to realistic early-stage operating losses.
 *  - Break-Even Phase (Months 3–4): Sales momentum expanding, unit economics improving,
 *    cash flow transitioning from negative to positive.
 *  - Scaled Phase (Months 5–6+): Steady-state capacity utilization and sustainable margins.
 *  - Two scenarios: "Realistic Base Case" and "Conservative / High-Risk Scenario" (extended losses).
 *  - Cost breakdown donut chart dynamically calibrated to the project's scale.
 */

export function calculateFinancialTrajectory({
  expectedMonthlyRevenue = 50000,
  availableMargin = 100000,
  category = "Enterprise",
  scenario = "base", // 'base' | 'conservative'
}) {
  const targetRev = Math.max(15000, Number(expectedMonthlyRevenue) || 50000);
  const margin = Math.max(25000, Number(availableMargin) || 100000);
  const cat = (category || "").toLowerCase();

  // Category cost structure benchmarks (COGS, fixed overhead, labor)
  let cogsPct = 0.55; // 55% Cost of Goods Sold / Raw Material
  let fixedOpex = Math.round(targetRev * 0.22); // Rent, electricity, basic labor
  let launchSetupDrag = Math.round(margin * 0.08); // Initial launch friction

  if (cat.includes("dairy") || cat.includes("milk")) {
    cogsPct = 0.60; // Feed and raw milk procurement is ~60%
    fixedOpex = Math.round(targetRev * 0.20);
  } else if (cat.includes("health") || cat.includes("hospital") || cat.includes("clinic")) {
    cogsPct = 0.35; // Drugs & medical consumables ~35%
    fixedOpex = Math.round(targetRev * 0.40); // Higher fixed doctor retainer & nurse payroll
  } else if (cat.includes("retail") || cat.includes("store")) {
    cogsPct = 0.75; // Retail goods purchase ~75%
    fixedOpex = Math.round(targetRev * 0.15);
  } else if (cat.includes("food") || cat.includes("process") || cat.includes("milling")) {
    cogsPct = 0.62;
    fixedOpex = Math.round(targetRev * 0.20);
  }

  // Monthly capacity utilization curves
  // Base case vs Conservative case
  const isConservative = scenario === "conservative";

  const capacityFactors = isConservative
    ? [0.25, 0.35, 0.48, 0.60, 0.72, 0.82] // Slower ramp-up
    : [0.35, 0.50, 0.68, 0.82, 0.95, 1.08]; // Realistic standard ramp-up

  const months = ["M1", "M2", "M3", "M4", "M5", "M6"];
  const trajectory = [];
  let breakEvenMonth = null;
  let totalRevenue6M = 0;
  let totalCost6M = 0;

  months.forEach((m, idx) => {
    const factor = capacityFactors[idx];
    const revenue = Math.round(targetRev * factor);
    
    // Monthly variable cost = revenue * cogsPct
    const variableCost = Math.round(revenue * cogsPct);
    
    // Additional initial drag in Month 1 and 2
    const initialDrag = idx === 0 ? launchSetupDrag : idx === 1 ? Math.round(launchSetupDrag * 0.4) : 0;
    
    // Total monthly cost
    const totalCost = variableCost + fixedOpex + initialDrag;
    
    // Net profit or loss (can be negative!)
    const netProfit = revenue - totalCost;

    if (netProfit >= 0 && breakEvenMonth === null) {
      breakEvenMonth = m;
    }

    totalRevenue6M += revenue;
    totalCost6M += totalCost;

    trajectory.push({
      month: m,
      monthLabel: `Month ${idx + 1}`,
      revenue,
      costs: totalCost,
      netProfit,
      isLoss: netProfit < 0,
      utilizationPct: Math.round(factor * 100),
    });
  });

  // Calculate dynamic Cost Breakdown (Capex & Launch Opex) sized to project outlay
  const totalProjectOutlay = Math.round(margin * 3.5); // Margin is ~28% equity, rest loan
  
  const costBreakdown = [
    {
      name: "Core Machinery & Equipment",
      value: Math.round(totalProjectOutlay * 0.46),
      fill: "#1E6702",
      pct: "46%",
    },
    {
      name: "Raw Material & Inventory Buffer",
      value: Math.round(totalProjectOutlay * 0.22),
      fill: "#D97706",
      pct: "22%",
    },
    {
      name: "Land / Shed Fitout & Civil Works",
      value: Math.round(totalProjectOutlay * 0.16),
      fill: "#3B82F6",
      pct: "16%",
    },
    {
      name: "Working Capital Reserve & Opex",
      value: Math.round(totalProjectOutlay * 0.11),
      fill: "#8B5CF6",
      pct: "11%",
    },
    {
      name: "Statutory Permits & Contingency",
      value: Math.round(totalProjectOutlay * 0.05),
      fill: "#64748B",
      pct: "5%",
    },
  ];

  const totalCostLakhs = (totalProjectOutlay / 100000).toFixed(2);
  const m1Rev = trajectory[0].revenue;
  const m6Rev = trajectory[5].revenue;
  const growthPct = Math.round(((m6Rev - m1Rev) / m1Rev) * 100);

  return {
    trajectory,
    breakEvenMonth: breakEvenMonth || "Month 6+",
    totalProjectOutlay,
    totalCostLakhs: `₹${totalCostLakhs}L`,
    costBreakdown,
    summary: {
      m1Revenue: m1Rev,
      m6Revenue: m6Rev,
      growthPct,
      isInitialLossExpected: trajectory[0].netProfit < 0,
      m1Loss: trajectory[0].netProfit < 0 ? Math.abs(trajectory[0].netProfit) : 0,
      m6Profit: trajectory[5].netProfit,
      scenario: isConservative ? "Conservative / High-Friction Scenario" : "Realistic Base Case Trajectory",
    },
  };
}
