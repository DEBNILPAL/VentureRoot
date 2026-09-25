import {
  createBusiness,
  findBusinessesByUserId,
  findBusinessByIdAndUserId,
  updateBusinessByIdAndUserId,
  deleteBusinessByIdAndUserId,
} from "@/repositories/business.repository";

import {
  findBusinessCategoryById,
  findBusinessCategoryByIdOrSlug,
  createOrGetBusinessCategory,
} from "@/repositories/business-category.repository";

import {
  findLocationByHierarchy,
  findOrCreateLocationByHierarchy,
  findLocationWithParents,
} from "@/repositories/location.repository";

import {
  BadRequestError,
  NotFoundError,
} from "@/errors/http-error";

import {
  buildLocationResponse,
} from "@/utils/location.mapper";

import {
  mapBusinessCategory,
} from "@/utils/business.mapper";

async function mapBusinessResponse(business) {
  const fullLocation =
    await findLocationWithParents(
      business.locationId
    );

  return {
    id: business.id,

    category:
      mapBusinessCategory(
        business.category
      ),

    location:
      buildLocationResponse(
        fullLocation
      ),

    name: business.name,

    description:
      business.description,

    availableMargin:
      Number(
        business.availableMargin
      ),

    existingResources:
      business.existingResources,

    expectedRevenue:
      Number(
        business.expectedRevenue
      ),

    status:
      business.status,

    createdAt:
      business.createdAt,

    updatedAt:
      business.updatedAt,
  };
}


async function validateCategory(categoryId) {
  let category =
    await findBusinessCategoryByIdOrSlug(
      categoryId
    );

  if (!category) {
    category = await createOrGetBusinessCategory({
      name: categoryId,
      slug: categoryId,
    });
  }

  if (!category.isActive) {
    throw new BadRequestError(
      "Business category is inactive"
    );
  }

  return category;
}


async function resolveLocation(data) {
  const lat = data.latitude ?? data.lat;
  const lon = data.longitude ?? data.lon;

  let location =
    await findLocationByHierarchy({
      state: data.state,
      district: data.district,
      block: data.block,
      village: data.village,
    });

  if (!location) {
    location = await findOrCreateLocationByHierarchy({
      state: data.state,
      district: data.district,
      block: data.block,
      village: data.village,
      latitude: lat,
      longitude: lon,
    });
  } else if (lat != null && lon != null && (location.latitude === null || location.longitude === null)) {
    location = await findOrCreateLocationByHierarchy({
      state: data.state,
      district: data.district,
      block: data.block,
      village: data.village,
      latitude: lat,
      longitude: lon,
    });
  }

  if (!location) {
    throw new BadRequestError(
      "Invalid location hierarchy"
    );
  }

  return location;
}


export async function createMyBusiness(
  user,
  data
) {
  const category = await validateCategory(
    data.categoryId
  );

  const location =
    await resolveLocation(data);

  const fallbackName = `${category.name} Enterprise (${data.district || data.state || "Rural"})`;

  const business =
    await createBusiness({
      userId: user.id,

      categoryId:
        category.id,

      locationId:
        location.id,

      name:
        data.name?.trim() || fallbackName,

      description:
        data.description?.trim() || `${category.name} business based in ${data.district ? `${data.district}, ` : ""}${data.state}`,

      availableMargin:
        data.availableMargin,

      existingResources:
        data.existingResources ?? null,

      expectedRevenue:
        data.expectedRevenue,
    });

  return mapBusinessResponse(business);
}


export async function getMyBusinesses(
  user,
  query = {}
) {
  const page =
    Math.max(
      1,
      Number.parseInt(query.page, 10) || 1
    );

  const limit =
    Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(query.limit, 10) || 10
      )
    );

  const search =
    typeof query.search === "string"
      ? query.search.trim()
      : undefined;

  const sortBy =
    typeof query.sortBy === "string"
      ? query.sortBy
      : "createdAt";

  const sortOrder =
    query.sortOrder === "asc"
      ? "asc"
      : "desc";

  const {
    businesses,
    total,
  } = await findBusinessesByUserId({
    userId: user.id,

    page,
    limit,

    status: query.status,
    categoryId: query.categoryId,

    search,

    sortBy,
    sortOrder,
  });

  const mappedBusinesses =
    await Promise.all(
      businesses.map(
        mapBusinessResponse
      )
    );

  const totalPages =
    Math.ceil(total / limit);

  return {
    businesses: mappedBusinesses,

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
}

export async function getMyBusinessById(
  user,
  businessId
) {
  const business =
    await findBusinessByIdAndUserId({
      businessId,
      userId: user.id,
    });

  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }

  return mapBusinessResponse(business);
}


export async function updateMyBusiness(
  user,
  businessId,
  data
) {
  const existingBusiness = await findBusinessByIdAndUserId({
    businessId,
    userId: user.id,
  });

  if (!existingBusiness) {
    throw new NotFoundError("Business not found");
  }

  const targetCategoryId = data.categoryId || existingBusiness.categoryId;
  if (data.categoryId) {
    await validateCategory(data.categoryId);
  }

  let locationId = existingBusiness.locationId;
  const hasLocationUpdate =
    data.state !== undefined ||
    data.district !== undefined ||
    data.block !== undefined ||
    data.village !== undefined ||
    data.lat !== undefined ||
    data.latitude !== undefined;

  if (hasLocationUpdate) {
    let existingLocMap = {};
    try {
      const existingFullLoc = await findLocationWithParents(existingBusiness.locationId);
      if (existingFullLoc) {
        existingLocMap = buildLocationResponse(existingFullLoc);
      }
    } catch (_) {}

    const mergedLocationData = {
      state: data.state || existingLocMap.state || "Gujarat",
      district: data.district || existingLocMap.district || "Anand",
      block: data.block !== undefined ? data.block : existingLocMap.block,
      village: data.village !== undefined ? data.village : existingLocMap.village,
      lat: data.lat ?? data.latitude ?? existingLocMap.lat,
      lon: data.lon ?? data.longitude ?? existingLocMap.lon,
    };

    const location = await resolveLocation(mergedLocationData);
    locationId = location.id;
  }

  const updateData = {
    categoryId: targetCategoryId,
    locationId,
    name: data.name !== undefined ? (data.name || null) : existingBusiness.name,
    description: data.description !== undefined ? (data.description || null) : existingBusiness.description,
    availableMargin: data.availableMargin !== undefined ? Number(data.availableMargin) : existingBusiness.availableMargin,
    existingResources: data.existingResources !== undefined ? (data.existingResources || null) : existingBusiness.existingResources,
    expectedRevenue: data.expectedRevenue !== undefined ? Number(data.expectedRevenue) : existingBusiness.expectedRevenue,
  };

  const business = await updateBusinessByIdAndUserId({
    businessId,
    userId: user.id,
    data: updateData,
  });

  if (!business) {
    throw new NotFoundError("Business not found");
  }

  return mapBusinessResponse(business);
}


export async function deleteMyBusiness(
  user,
  businessId
) {
  const business =
    await deleteBusinessByIdAndUserId({
      businessId,
      userId: user.id,
    });

  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }

  return {
    id: business.id,
  };
}