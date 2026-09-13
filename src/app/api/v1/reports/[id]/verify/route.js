import { authenticate } from "@/middlewares/auth.middleware";
import { handleError } from "@/utils/error-handler";
import { findReportByIdAndUserId } from "@/repositories/report.repository";
import { successResponse } from "@/utils/api-response";

const RAG_SERVICE_URL =
  process.env.RAG_SERVICE_URL || "http://127.0.0.1:8004";

/**
 * POST /api/v1/reports/[id]/verify
 *
 * 1. Authenticates the user via Bearer token.
 * 2. Loads the report + business from the database.
 * 3. Forwards ML predictions to the RAG verification service.
 * 4. Returns the Gemini verification result with RAG citations.
 */
export async function POST(request, { params }) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────
    const { user } = await authenticate(request);
    const { id: reportId } = await params;

    // ── 2. Load report from DB ───────────────────────────────────────
    const report = await findReportByIdAndUserId({
      reportId,
      userId: user.id,
    });

    if (!report) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    // ── 3. Build business context from the report's related data ─────
    const business = report?.business || {};
    const feasibility = report?.feasibilityData || {};
    const financialData = report?.financialData || {};
    const capital = financialData?.capital || {};
    const operations = financialData?.operations || {};
    const opp = feasibility?.opportunity || {};
    const market = feasibility?.market || {};

    const investmentAmount =
      Number(business.availableMargin || 0) > 0
        ? Number(business.availableMargin) * 4
        : Number(capital.totalProjectCost || 0) ||
          Number(business.expectedRevenue || 0) * 2;

    const businessContext = {
      businessName:
        business.name ||
        report?.title ||
        "Business",
      category:
        business.category?.name ||
        business.categoryId ||
        "Enterprise",
      location: [
        business.location?.village,
        business.location?.block,
        business.location?.district,
        business.location?.state,
      ]
        .filter(Boolean)
        .join(", ") || "India",
      investment: investmentAmount,
      margin: Number(business.availableMargin || 0),
      expectedRevenue: Number(business.expectedRevenue || 0),
      description: business.description || "",
    };

    const mlPredictions = {
      market_potential_score:
        market?.confidence?.score ||
        opp?.confidence?.score ||
        75,
      opportunity_level:
        opp?.level || opp?.tier || "MEDIUM",
      viability_score:
        feasibility?.competition?.confidence?.score || 78,
      recommended_scheme:
        capital?.subsidyScheme || "PMEGP",
      estimated_subsidy_amount:
        capital?.subsidyAmount ||
        Math.round(investmentAmount * 0.25),
      estimated_loan_amount:
        capital?.termLoan ||
        Math.round(investmentAmount * 0.75),
      break_even_months: operations?.breakEvenMonths || 6,
      monthly_revenue_projection:
        operations?.expectedRevenue ||
        business.expectedRevenue ||
        0,
      monthly_profit_projection: operations?.monthlyProfit || 0,
      dscr: operations?.dscr || 1.85,
      top_risk:
        (feasibility?.risks || [])[0]?.title ||
        "Market penetration risk",
    };

    // ── 4. Call RAG Verification Service ────────────────────────────
    let verificationData;

    try {
      const ragRes = await fetch(`${RAG_SERVICE_URL}/api/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_context: businessContext,
          ml_predictions: mlPredictions,
          top_k: 5,
          report_id: reportId,
        }),
        signal: AbortSignal.timeout(60000), // 60s for Render cold starts
      });

      if (!ragRes.ok) {
        const errText = await ragRes.text();
        throw new Error(`RAG service returned ${ragRes.status}: ${errText}`);
      }

      verificationData = await ragRes.json();
    } catch (ragError) {
      // ── 5. Graceful fallback when RAG service is unavailable ───────
      console.warn("[Verify] RAG service unreachable:", ragError.message);
      return Response.json(
        {
          error: `RAG service unavailable: ${ragError.message}`,
          hint: `Ensure the Python RAG service is running at ${RAG_SERVICE_URL} (locally: uvicorn api.main:app --port 8004)`,
          service_url: RAG_SERVICE_URL,
        },
        { status: 503 }
      );
    }

    return successResponse({
      reportId,
      ...verificationData,
    });
  } catch (error) {
    return handleError(error);
  }
}
