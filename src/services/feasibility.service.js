import fs from "fs";
import path from "path";
import {
  loadFeasibilityData,
} from "@/services/feasibility-data.service";

import {
  predictFeasibility,
} from "@/integrations/feasibility-ml.client";

import {
  mapMlPredictionToFeasibility,
} from "@/utils/feasibility.mapper";

import {
  fetchCompetitorsByRadius,
} from "@/services/competitor-radar.service";

import * as financeClient from "@/integrations/finance.client";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";

// In-memory cache for fast sub-millisecond retrieval
const feasibilityMemoryCache = new Map();

// Persistent on-disk directory for enterprise predictability
const PERSISTENCE_DIR = path.resolve(process.cwd(), "src/data/persisted_feasibility");

function ensurePersistenceDir() {
  if (!fs.existsSync(PERSISTENCE_DIR)) {
    try {
      fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
    } catch (_) {}
  }
}

function getPersistedFeasibility(businessId) {
  try {
    ensurePersistenceDir();
    const filePath = path.join(PERSISTENCE_DIR, `${businessId}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[feasibility.service] Error reading persisted file:", err?.message);
  }
  return null;
}

function savePersistedFeasibility(businessId, payload) {
  try {
    ensurePersistenceDir();
    const filePath = path.join(PERSISTENCE_DIR, `${businessId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.warn("[feasibility.service] Error saving persisted file:", err?.message);
  }
}

/**
 * GET /feasibility/:businessId
 *
 * Priority 1: Always load authoritative business + profile from PostgreSQL Database.
 * Priority 2: Execute live ML microservices pipeline (Model 1, Model 2, Model 3),
 *             live competitor radar, and Python finance engine.
 * Priority 3: When ML models or services respond, their outputs take top priority
 *             and are persisted for permanent consistency.
 * Priority 4: If ML services are temporarily offline or timing out, retrieve the
 *             stored venture prediction (or authoritative Census/APMC mapper) so
 *             the user never experiences random flips or generic mocks.
 */
export async function getFeasibilityContext({
  userId,
  businessId,
}) {
  // 1. FIRST PRIORITY: Always query PostgreSQL database for live, authoritative business & profile
  const data = await loadFeasibilityData({
    userId,
    businessId,
  });

  const cacheKey = `${userId}:${businessId}`;

  const rawLoc = data.business?.location;
  const resolved = resolveCoordinatesForLocation(rawLoc);
  const lat = resolved.lat;
  const lon = resolved.lon;
  const category = data.business?.category?.name || data.business?.category || "Agro-Enterprise";
  const district = rawLoc?.district?.name || rawLoc?.district || "Local District";
  const state = rawLoc?.state?.name || rawLoc?.state || "India";
  const availableMargin = Number(data.business?.availableMargin || data.profile?.availableCapital || 150000);
  const calcProjectCost = availableMargin / 0.1;

  // 2. FIRST PRIORITY: Attempt live ML models pipeline, Competitor Radar & Finance calculation
  const [mlSettled, radarSettled, calcResSettled, schemeResSettled] = await Promise.allSettled([
    predictFeasibility({
      business: data.business,
      profile: data.profile,
    }),
    (lat && lon)
      ? fetchCompetitorsByRadius({
          lat: Number(lat),
          lon: Number(lon),
          category,
          district,
          state,
        })
      : Promise.resolve(null),
    financeClient.calculateFinance({
      availableMargin,
      businessCategory: category,
      state,
      proposedProjectCost: calcProjectCost,
    }),
    financeClient.routeScheme({ projectCost: calcProjectCost }),
  ]);

  let mlResult = mlSettled.status === "fulfilled" ? mlSettled.value : null;
  let mlStatus = mlResult ? "SUCCESS" : "ML_ERROR";
  let mlError = mlSettled.status === "rejected" ? (mlSettled.reason?.message || "ML pipeline offline") : null;

  // 3. If live ML models produced a result, use it directly (top priority)
  let feasibilityData = null;
  if (mlResult) {
    feasibilityData = mapMlPredictionToFeasibility(mlResult, data.business);
  } else {
    // If ML is offline, check if we previously stored a verified prediction for this venture
    const existingPersisted = getPersistedFeasibility(businessId);
    if (existingPersisted && existingPersisted.feasibility) {
      feasibilityData = existingPersisted.feasibility;
      mlStatus = existingPersisted.mlStatus || "PERSISTED";
    } else {
      // Otherwise, map using authoritative Census 2011 district density & APMC sector benchmarks
      feasibilityData = mapMlPredictionToFeasibility(
        {
          model1: null,
          model2: null,
          model3: null,
          census: null,
          location: data.business?.location,
          businessCategory: category,
        },
        data.business
      );
    }
  }

  // 4. Attach Competitor Radar
  const competitorRadar = radarSettled.status === "fulfilled" ? radarSettled.value : null;
  if (competitorRadar && feasibilityData) {
    feasibilityData.competitorRadar = competitorRadar;
  }

  // 5. Attach Finance Calculation
  const calculation = calcResSettled.status === "fulfilled" ? calcResSettled.value : null;
  const scheme = schemeResSettled.status === "fulfilled" ? schemeResSettled.value : null;
  let financeData = null;
  if (calculation || scheme) {
    financeData = {
      calculation,
      scheme,
    };
    if (feasibilityData) {
      feasibilityData.finance = financeData;
    }
  }

  const resultPayload = {
    businessId,
    business: data.business,
    profile: data.profile,
    mlStatus,
    mlError,
    feasibility: feasibilityData,
    competitorRadar: competitorRadar || feasibilityData?.competitorRadar,
    finance: financeData || feasibilityData?.finance,
  };

  // 6. Persist on disk and in memory so venture evaluation remains permanently stable
  savePersistedFeasibility(businessId, resultPayload);
  feasibilityMemoryCache.set(cacheKey, resultPayload);

  return resultPayload;
}

/**
 * POST /feasibility/:businessId/generate
 */
export async function generateFeasibility({
  userId,
  businessId,
}) {
  const data = await loadFeasibilityData({
    userId,
    businessId,
  });

  const prediction = await predictFeasibility({
    business: data.business,
    profile: data.profile,
  });

  const feasibility = mapMlPredictionToFeasibility(prediction, data.business);

  try {
    const rawLoc = data.business?.location;
    const resolved = resolveCoordinatesForLocation(rawLoc);
    const lat = resolved.lat;
    const lon = resolved.lon;
    const category = data.business?.category?.name || data.business?.category || "Agro-Enterprise";
    const district = rawLoc?.district?.name || rawLoc?.district || "Local District";
    const state = rawLoc?.state?.name || rawLoc?.state || "India";

    if (lat && lon && feasibility) {
      feasibility.competitorRadar = await fetchCompetitorsByRadius({
        lat: Number(lat),
        lon: Number(lon),
        category,
        district,
        state,
      });
    }
  } catch (err) {
    console.warn("[feasibility.service] Competitor radar warning in generateFeasibility:", err?.message);
  }

  return feasibility;
}