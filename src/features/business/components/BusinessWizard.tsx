"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormSchema, BusinessFormValues } from "../schemas/businessSchema";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Info, Bookmark, ArrowRight, ArrowLeft, Sprout, Leaf, MapPin, Sparkles, Lock } from "lucide-react";
import { businessApi } from "../api/businessApi";
import dynamic from "next/dynamic";
import { LocationAutocompleteInput, SelectedLocation } from "@/components/ui/LocationAutocompleteInput";
import { StateAutocompleteInput } from "@/components/ui/StateAutocompleteInput";
import { CascadingLocationFields } from "@/components/ui/CascadingLocationFields";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";
import { getUserScopeKey } from "@/lib/data/businesses";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";
import { getDynamicBusinessResources, formatResourceSuggestionsAsText } from "@/services/business-resources.service";
import { InvalidLocationModal } from "@/components/ui/InvalidLocationModal";
import { validateBusinessLocationInIndia } from "@/lib/data/indiaLocations";
import { DEMO_PRESETS } from "@/lib/demoPresets";

const DynamicRadiusMap = dynamic(() => import("@/components/maps/RadiusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
      Loading OpenStreetMap Preview...
    </div>
  ),
});

const WIZARD_STEPS = [
  { id: 1, label: "Business Category", subtitle: "Choose your sector" },
  { id: 2, label: "Location Setup", subtitle: "Set your business location" },
  { id: 3, label: "Capital Required", subtitle: "Enter investment details" },
  { id: 4, label: "Existing Resources", subtitle: "Add available assets" },
  { id: 5, label: "Operations", subtitle: "Define production plan" },
  { id: 6, label: "Analyze & Submit", subtitle: "Review and submit" },
];

interface BusinessWizardProps {
  businessId?: string;
}

export const BusinessWizard = ({ businessId }: BusinessWizardProps = {}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [invalidLocationModal, setInvalidLocationModal] = useState<{
    isOpen: boolean;
    message?: string;
    details?: string;
  }>({ isOpen: false });
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const router = useRouter();

  const isEditMode = Boolean(businessId);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);
  const [existingName, setExistingName] = useState<string>("");
  const [existingBiz, setExistingBiz] = useState<any>(null);

  useEffect(() => {
    businessApi
      .getCategories()
      .then((res: any) => {
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCategories(list);
        }
      })
      .catch(() => {
        // Fallback to defaults if endpoint unreachable
      });
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    mode: "onTouched",
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      state: "",
      district: "",
      block: "",
      village: "",
      availableMargin: 0,
      existingResources: "",
      expectedRevenue: 0,
    },
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([18.5204, 73.8567]);
  const [locationLabel, setLocationLabel] = useState<string>("Pune, Maharashtra");

  // Load existing business data when in edit mode
  useEffect(() => {
    if (!businessId) return;

    let isMounted = true;
    const loadBusinessData = async () => {
      setIsLoadingExisting(true);
      let foundBiz: any = null;

      // 1. Check local cache
      if (typeof window !== "undefined") {
        const cacheKey = `ventureroot_businesses_${getUserScopeKey()}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const list = JSON.parse(cached);
            if (Array.isArray(list)) {
              foundBiz = list.find((b: any) => b.id === businessId);
            }
          } catch (_) {}
        }
      }

      // 2. Fetch from backend API
      try {
        const res: any = await businessApi.get(businessId);
        const fetched = res?.data?.business || res?.data?.data?.business || res?.data || res?.business;
        if (fetched) {
          foundBiz = { ...(foundBiz || {}), ...fetched };
        }
      } catch (err) {
        console.warn("Could not fetch business from API, using cached data if available:", err);
      }

      if (!isMounted || !foundBiz) {
        if (isMounted) setIsLoadingExisting(false);
        return;
      }

      setExistingBiz(foundBiz);

      if (foundBiz.name) {
        setExistingName(foundBiz.name);
      }

      const catVal = foundBiz.categoryId || foundBiz.category?.id || (typeof foundBiz.category === "string" ? foundBiz.category : "");
      let resolvedCatId = catVal;
      if (categories.length > 0) {
        const matched = categories.find(
          (c) =>
            c.id === catVal ||
            c.slug?.toLowerCase() === catVal.toLowerCase() ||
            c.name?.toLowerCase() === catVal.toLowerCase()
        );
        if (matched) resolvedCatId = matched.id;
      }

      const st = foundBiz.location?.state || foundBiz.state || "";
      const dt = foundBiz.location?.district || foundBiz.district || "";
      const bk = foundBiz.location?.block || foundBiz.location?.subdistrict || foundBiz.block || "";
      const vl = foundBiz.location?.village || foundBiz.village || "";
      const margin = Number(foundBiz.capital?.availableMargin ?? foundBiz.availableMargin ?? 0);
      const rev = Number(foundBiz.operations?.expectedRevenue ?? foundBiz.expectedRevenue ?? 0);
      const resrc = foundBiz.resources?.existingResources ?? foundBiz.existingResources ?? "";

      const lat = Number(foundBiz.location?.lat ?? foundBiz.location?.latitude ?? foundBiz.latitude ?? 18.5204);
      const lon = Number(foundBiz.location?.lon ?? foundBiz.location?.longitude ?? foundBiz.longitude ?? 73.8567);

      reset({
        categoryId: resolvedCatId || "",
        name: foundBiz.name || "",
        description: foundBiz.description || "",
        state: st,
        district: dt,
        block: bk,
        village: vl,
        availableMargin: margin,
        existingResources: resrc,
        expectedRevenue: rev,
      });

      if (lat && lon && (lat !== 18.5204 || lon !== 73.8567)) {
        setMapCenter([lat, lon]);
      }
      const label = foundBiz.location?.formatted || [vl, bk, dt, st].filter(Boolean).join(", ");
      if (label) setLocationLabel(label);

      setIsLoadingExisting(false);
    };

    loadBusinessData();

    return () => {
      isMounted = false;
    };
  }, [businessId, categories, reset]);

  const handleLocationSelect = (loc: SelectedLocation) => {
    setValue("state", loc.state, { shouldValidate: true });
    setValue("district", loc.district, { shouldValidate: true });
    if (loc.block) setValue("block", loc.block, { shouldValidate: true });
    if (loc.village) setValue("village", loc.village, { shouldValidate: true });
    if (loc.lat && loc.lon) {
      setMapCenter([loc.lat, loc.lon]);
    }
    setLocationLabel(loc.label);
  };

  const formValues = watch();

  const getCategoryName = (catId?: string) => {
    if (!catId) return "-";
    const matched = categories.find(
      (c) =>
        c.id === catId ||
        c.slug?.toLowerCase() === catId.toLowerCase() ||
        c.name?.toLowerCase() === catId.toLowerCase()
    );
    if (matched?.name) return matched.name;
    // If it's a slug or readable key
    if (!catId.includes("-") || catId.length < 20) {
      return catId.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return "Enterprise";
  };

  const selectedCategoryName = getCategoryName(formValues.categoryId);

  // Synchronously auto-resolve coordinates whenever user types or selects state/district/block/village
  useEffect(() => {
    if (!formValues.district && !formValues.state) return;
    const resolved = resolveCoordinatesForLocation({
      state: formValues.state,
      district: formValues.district,
      block: formValues.block,
      village: formValues.village,
    });
    const isIndiaDefault = Math.abs(resolved.lat - 20.5937) < 0.005 && Math.abs(resolved.lon - 78.9629) < 0.005;
    if (!isIndiaDefault) {
      setMapCenter([resolved.lat, resolved.lon]);
      const formatted = [formValues.village, formValues.block, formValues.district, formValues.state].filter(Boolean).join(", ");
      setLocationLabel(formatted || resolved.label);
    }
  }, [formValues.district, formValues.state, formValues.block, formValues.village]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["categoryId"];
    if (currentStep === 2) fieldsToValidate = ["state", "district", "block", "village"];
    if (currentStep === 3) fieldsToValidate = ["availableMargin"];
    if (currentStep === 4) fieldsToValidate = ["existingResources"];
    if (currentStep === 5) fieldsToValidate = ["expectedRevenue"];

    if (currentStep === 2) {
      const locValidation = validateBusinessLocationInIndia({
        state: formValues.state,
        district: formValues.district,
        block: formValues.block,
        village: formValues.village,
        lat: mapCenter[0],
        lon: mapCenter[1],
        searchTerm: locationLabel,
      });

      if (!locValidation.valid) {
        await trigger(["state", "district", "block", "village"]);
        setInvalidLocationModal({
          isOpen: true,
          message: "Please enter a valid location inside India.",
          details: locValidation.reason || "Locations outside India or random text (such as 'xyz') cannot be accepted.",
        });
        return;
      }
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (!isStepValid) {
      if (currentStep === 2) {
        const firstError = errors.state?.message || errors.district?.message || errors.block?.message || errors.village?.message;
        setInvalidLocationModal({
          isOpen: true,
          message: "Please enter a valid location inside India.",
          details: firstError || "Please select an official Indian State and District from the dropdown.",
        });
      }
      return;
    }

    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: BusinessFormValues) => {
    const locValidation = validateBusinessLocationInIndia({
      state: data.state,
      district: data.district,
      block: data.block,
      village: data.village,
      lat: mapCenter[0],
      lon: mapCenter[1],
    });

    if (!locValidation.valid) {
      setCurrentStep(2);
      setInvalidLocationModal({
        isOpen: true,
        message: "Please enter a valid location inside India.",
        details: locValidation.reason || "Locations outside India or random text (such as 'xyz') cannot be accepted.",
      });
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);
    try {
      if (isEditMode && businessId) {
        // Edit mode: strictly update under the existing businessId (ID cannot be modified)
        const resolvedName = (data as any).name || existingName || existingBiz?.name || "Business Venture";
        const resolvedDescription = (data as any).description !== undefined ? (data as any).description : existingBiz?.description;

        const payload = {
          categoryId: data.categoryId || existingBiz?.categoryId,
          state: data.state || existingBiz?.location?.state,
          district: data.district || existingBiz?.location?.district,
          block: data.block !== undefined ? data.block : existingBiz?.location?.block,
          village: data.village !== undefined ? data.village : existingBiz?.location?.village,
          availableMargin: Number(data.availableMargin ?? existingBiz?.availableMargin ?? 0),
          existingResources: data.existingResources !== undefined ? data.existingResources : existingBiz?.existingResources,
          expectedRevenue: Number(data.expectedRevenue ?? existingBiz?.expectedRevenue ?? 0),
          name: resolvedName,
          description: resolvedDescription,
          latitude: mapCenter[0],
          longitude: mapCenter[1],
          lat: mapCenter[0],
          lon: mapCenter[1],
        };

        try {
          await businessApi.update(businessId, payload as any);
        } catch (apiErr: any) {
          console.warn("Backend API business update warning:", apiErr);
        }

        const finalLoc = resolveCoordinatesForLocation({
          state: payload.state,
          district: payload.district,
          block: payload.block,
          village: payload.village,
          lat: mapCenter[0],
          lon: mapCenter[1],
        });

        if (typeof window !== "undefined") {
          const cacheKey = `ventureroot_businesses_${getUserScopeKey()}`;
          let existingList: any[] = [];
          try {
            existingList = JSON.parse(localStorage.getItem(cacheKey) || "[]");
          } catch (_) {}

          const updatedList = existingList.map((biz: any) => {
            if (biz.id === businessId) {
              const catDisplayName = getCategoryName(payload.categoryId) || biz.category;
              return {
                ...existingBiz,
                ...biz,
                id: businessId, // Business ID strictly preserved and locked
                name: payload.name,
                description: payload.description,
                category: catDisplayName,
                categoryId: payload.categoryId,
                location: {
                  ...(biz.location || existingBiz?.location || {}),
                  state: payload.state || "",
                  district: payload.district || "",
                  block: payload.block || payload.district || "",
                  village: payload.village || payload.block || payload.district || "",
                  subdistrict: payload.block || payload.district || "",
                  lat: finalLoc.lat,
                  lon: finalLoc.lon,
                  latitude: finalLoc.lat,
                  longitude: finalLoc.lon,
                  formatted: finalLoc.label || [payload.village, payload.block, payload.district, payload.state].filter(Boolean).join(", "),
                },
                availableMargin: Number(payload.availableMargin),
                expectedRevenue: Number(payload.expectedRevenue),
                existingResources: payload.existingResources || "",
                capital: {
                  ...(existingBiz?.capital || {}),
                  ...(biz.capital || {}),
                  availableMargin: Number(payload.availableMargin),
                },
                operations: {
                  ...(existingBiz?.operations || {}),
                  ...(biz.operations || {}),
                  expectedRevenue: Number(payload.expectedRevenue),
                },
                resources: {
                  ...(existingBiz?.resources || {}),
                  ...(biz.resources || {}),
                  existingResources: payload.existingResources || "",
                },
                updatedAt: new Date().toISOString(),
              };
            }
            return biz;
          });

          localStorage.setItem(cacheKey, JSON.stringify(updatedList));
          window.dispatchEvent(new Event("business-updated"));
        }

        router.push(`/business/${businessId}`);
        return;
      }

      let createdBusiness: any = null;
      try {
        const payload = {
          ...data,
          latitude: mapCenter[0],
          longitude: mapCenter[1],
          lat: mapCenter[0],
          lon: mapCenter[1],
        };
        const res: any = await businessApi.create(payload as any);
        createdBusiness = res?.data?.business || res?.data?.data?.business || res?.business || res?.data;
      } catch (apiErr: any) {
        console.warn("Backend API business creation warning:", apiErr);
      }

      // Strictly resolve coordinates from user input location
      const finalLoc = resolveCoordinatesForLocation({
        state: data.state,
        district: data.district,
        block: data.block,
        village: data.village,
        lat: mapCenter[0],
        lon: mapCenter[1],
      });

      // Generate normalized venture object
      const fallbackId = `biz_${Date.now().toString(36)}`;
      const categoryDisplayName = getCategoryName(data.categoryId);
      const businessDisplayName =
        (data as any).name ||
        createdBusiness?.name ||
        `${categoryDisplayName} Venture`;

      const resolvedBiz = {
        id: createdBusiness?.id || fallbackId,
        name: businessDisplayName,
        category: categoryDisplayName,
        categoryId: data.categoryId,
        location: {
          state: data.state || "",
          district: data.district || "",
          block: data.block || data.district || "",
          village: data.village || data.block || data.district || "",
          subdistrict: data.block || data.district || "",
          lat: finalLoc.lat,
          lon: finalLoc.lon,
          latitude: finalLoc.lat,
          longitude: finalLoc.lon,
          formatted: finalLoc.label || [data.village, data.block, data.district, data.state].filter(Boolean).join(", "),
        },
        availableMargin: Number(data.availableMargin) || 150000,
        expectedRevenue: Number(data.expectedRevenue) || 120000,
        existingResources: data.existingResources || "Infrastructure and operational assets",
        description: (data as any).description || `Registered enterprise in ${[data.village, data.block, data.district, data.state].filter(Boolean).join(", ") || "Target Location"}.`,
        status: "Active / Verified",
        createdAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        const cacheKey = `ventureroot_businesses_${getUserScopeKey()}`;
        let existing: any[] = [];
        try {
          existing = JSON.parse(localStorage.getItem(cacheKey) || "[]");
        } catch (_) {}
        const updated = [resolvedBiz, ...existing.filter((b: any) => b.id !== resolvedBiz.id && b.name !== resolvedBiz.name)];
        localStorage.setItem(cacheKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("business-updated"));
      }

      const businessIdToRoute = createdBusiness?.id || resolvedBiz.id;
      if (businessIdToRoute) {
        router.push(`/business/${businessIdToRoute}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Business creation error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create business. Please check your inputs.";
      setGlobalError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = Math.round((currentStep / 6) * 100);

  if (isLoadingExisting) {
    return (
      <div className="w-full min-h-[380px] bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
        <PrismFluxLoader size={38} speed={4} />
        <p className="text-sm font-semibold text-slate-600">Loading business details for editing...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      
      <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col mb-20 transition-all duration-300">
        
        {/* Dark Header */}
        <div className="w-full bg-gradient-to-r from-[#173809] to-[#1E6702] px-5 py-6 sm:px-10 sm:py-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center text-white">
          <div className="z-10 mb-4 md:mb-0">
            <h1 className="font-heading text-[24px] sm:text-[32px] font-bold text-white tracking-tight leading-tight">
              {isEditMode ? "Edit Enterprise Details" : "Start a New Enterprise"}
            </h1>
            <p className="font-sans text-[13px] sm:text-[14px] text-emerald-100/80 font-medium mt-0.5">
              {isEditMode
                ? "Update your enterprise parameters, location, and capital"
                : "Complete the 6 steps to get started"}
            </p>
            {isEditMode && businessId && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 mt-3">
                <Lock className="w-3.5 h-3.5 opacity-80" />
                <span>Enterprise ID: <strong className="font-mono">{businessId}</strong> (Locked)</span>
              </div>
            )}
          </div>
          
          <div className="z-10 hidden md:flex flex-col md:items-end opacity-90 border-l-2 border-white/10 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-7 h-7 text-emerald-300" />
              <span className="font-heading italic text-[25px] text-white">Ideas grow brighter here</span>
            </div>
            <p className="font-sans text-[11px] tracking-wider text-emerald-200/70 uppercase font-bold">Rural Ideas. Real Opportunities.</p>
          </div>
        </div>

        {globalError && (
          <div className="mx-4 sm:mx-10 mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="font-sans text-[14px] font-medium text-red-700">{globalError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6 lg:gap-10">

          {/* MOBILE COMPACT STEPPER (Hidden on Desktop) */}
          <div className="lg:hidden w-full bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 shadow-xs">
            {isEditMode ? (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Jump to Section to Edit:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {WIZARD_STEPS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentStep(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        currentStep === s.id
                          ? "bg-[#1E6702] text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s.id}. {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 text-slate-700 flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                        title="Previous Step"
                        aria-label="Previous Step"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-xs font-bold text-[#1E6702] uppercase tracking-wider">
                      Step {currentStep} of 6
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">
                    {WIZARD_STEPS[currentStep - 1].label}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#81cc87] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* DESKTOP SIDEBAR: Stepper (Hidden on Mobile) */}
          <div className="hidden lg:block w-[300px] shrink-0">
            <div className="bg-slate-50/80 rounded-2xl sm:rounded-3xl p-6 md:p-8 flex flex-col relative h-full border border-slate-200/70">
              
              {/* Vertical connecting line */}
              <div className="absolute left-[51px] md:left-[59px] top-[60px] bottom-[160px] w-0.5 bg-gray-200 z-0"></div>
              
              <div className="flex flex-col gap-8">
                {WIZARD_STEPS.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const isClickable = isEditMode || isCompleted;
                  
                  return (
                    <div 
                      key={step.id} 
                      onClick={() => {
                        if (isClickable) {
                          setCurrentStep(step.id);
                        }
                      }}
                      className={`flex items-start gap-5 relative z-10 transition-all ${
                        isClickable ? "cursor-pointer hover:opacity-85 active:scale-98" : ""
                      }`}
                      title={isEditMode ? `Edit ${step.label}` : isCompleted ? `Go back to ${step.label}` : undefined}
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isActive ? 'bg-[#81cc87] border-[#81cc87] text-[#f9faeb] shadow-md' : 
                          isEditMode || isCompleted ? 'bg-white border-[#81cc87] text-[#81cc87]' : 
                          'bg-white border-gray-300 text-gray-400'}
                      `}>
                        <span className="font-sans text-[14px] font-bold">
                          {isCompleted && !isEditMode ? <Check className="w-5 h-5" /> : step.id}
                        </span>
                      </div>
                      <div className="flex flex-col pt-1">
                        <span className={`font-sans text-[14px] font-bold transition-colors duration-300
                          ${isActive ? 'text-[#173809]' : isClickable ? 'text-slate-700 hover:text-[#1E6702]' : 'text-slate-400'}
                        `}>
                          {step.label}
                        </span>
                        <span className={`font-sans text-[12px] font-medium transition-colors duration-300
                          ${isActive ? 'text-gray-600' : 'text-gray-400'}
                        `}>
                          {step.subtitle}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Footer Banner */}
              <div className="mt-auto pt-12">
                <div className="bg-[#f9faeb] p-4 rounded-2xl flex items-start gap-3 border border-[#81cc87]/10">
                  <Leaf className="w-5 h-5 text-[#1E6702] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-sans text-[14px] font-bold text-[#81cc87]">Building stronger</span>
                    <span className="font-sans text-[14px] font-bold text-[#81cc87] mb-1">rural businesses</span>
                    <span className="font-sans text-[12px] text-[#81cc87]/70 font-medium">One idea at a time.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Content Area */}
          <div className="w-full flex-1 flex flex-col bg-white rounded-3xl p-6 md:p-8">
            
            {/* Top Navigation Row: Back Arrow Button Above */}
            {currentStep > 1 && (
              <div className="mb-4 flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#1E6702] border border-slate-200 hover:border-[#1E6702]/40 transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Previous Step"
                  aria-label="Previous Step"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full mb-10">
               <div className="flex justify-between font-sans text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                 <span>Progress</span>
                 <span>{progressPercentage}%</span>
               </div>
               <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-[#1E6702] transition-all duration-500 ease-out rounded-full"
                   style={{ width: `${progressPercentage}%` }}
                 ></div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-heading text-[22px] sm:text-[25px] font-bold text-[#1a202c]">
                    {WIZARD_STEPS[currentStep - 1].label}
                  </h2>
                  {isEditMode && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E6702] text-[11px] font-bold border border-emerald-200">
                      Editable Section
                    </span>
                  )}
                </div>
                <p className="font-sans text-[13px] sm:text-[14px] text-gray-500 font-medium mt-0.5">
                  {WIZARD_STEPS[currentStep - 1].subtitle}
                </p>
              </div>

              {/* Try Demo Input Button on White Space with Deep Pink & Blue Contrast */}
              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    const preset = DEMO_PRESETS[0];
                    const w = preset.wizard;
                    const matchedCat =
                      categories.find((c) =>
                        c.name.toLowerCase().includes("food") ||
                        c.slug.toLowerCase().includes("food")
                      ) ||
                      categories.find((c) =>
                        c.name.toLowerCase().includes(w.categoryQuery.toLowerCase()) ||
                        c.slug.toLowerCase().includes(w.categoryQuery.toLowerCase())
                      );

                    if (matchedCat) {
                      setValue("categoryId", matchedCat.id, { shouldValidate: true });
                    } else {
                      setValue("categoryId", "food-processing", { shouldValidate: true });
                    }
                    setValue("name", w.name, { shouldValidate: true });
                    setValue("description", w.description, { shouldValidate: true });
                    setValue("state", w.state, { shouldValidate: true });
                    setValue("district", w.district, { shouldValidate: true });
                    setValue("block", w.block, { shouldValidate: true });
                    setValue("village", w.village, { shouldValidate: true });
                    setValue("availableMargin", w.availableMargin, { shouldValidate: true });
                    setValue("expectedRevenue", w.expectedRevenue, { shouldValidate: true });
                    setValue("existingResources", w.existingResources, { shouldValidate: true });

                    setMapCenter([w.lat, w.lon]);
                    setLocationLabel(`${w.village}, ${w.block}, ${w.district}, ${w.state}`);
                    // Keep on Step 1 so user can see and click next next naturally
                    setCurrentStep(1);
                  }}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#be185d] to-[#1d4ed8] hover:from-[#9d174d] hover:to-[#1e40af] text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-pink-400/30"
                  title="Fill form with sample business inputs"
                >
                  Try Demo Input
                </button>
              )}

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleSubmit(onSubmit)()}
                  disabled={isSubmitting}
                  className="self-start sm:self-auto px-5 py-2.5 bg-[#1E6702] hover:bg-[#155201] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
              
              <div className="flex-1">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block font-sans text-[14px] font-bold text-gray-800 mb-2">
                        Enterprise Name
                      </label>
                      <input
                        {...register("name")}
                        type="text"
                        placeholder="e.g. Anand Dairy Farm, Rural Bio-Fertilizer..."
                        className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-sans text-[14px] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[14px] font-bold text-gray-800 mb-2">{t("business.wizard.cat")}</label>
                      <select
                        {...register("categoryId")}
                        className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-sans text-[14px] font-medium"
                      >
                        <option value="">{t("business.wizard.selectCat")}</option>
                        {categories.length > 0 ? (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="dairy">Dairy</option>
                            <option value="retail">Retail</option>
                            <option value="tailoring">Tailoring</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="food-processing">Food Processing</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="services">Services</option>
                            <option value="handicrafts">Handicrafts</option>
                          </>
                        )}
                      </select>
                      {errors.categoryId && <p className="text-red-500 font-sans text-[12px] mt-2 font-medium">{errors.categoryId.message}</p>}
                    </div>

                    <div>
                      <label className="block font-sans text-[14px] font-bold text-gray-800 mb-2">
                        Enterprise Description & Scope
                      </label>
                      <textarea
                        {...register("description")}
                        rows={3}
                        placeholder="Brief summary of your venture's operational activities..."
                        className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-sans text-[14px] font-medium resize-none"
                      />
                    </div>

                    <div className="bg-emerald-50/70 rounded-xl p-4 flex gap-3 items-start border border-emerald-200/60">
                      <Info className="w-5 h-5 text-[#1E6702] shrink-0 mt-0.5" />
                      <p className="font-sans text-[14px] text-emerald-950 font-medium leading-relaxed">
                        Choose the category and title that matches your business activity.<br/>
                        Existing operational and financial metrics will remain linked to this enterprise.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    
                    {/* Instant Location Autocomplete Input */}
                    <div className="bg-[#f0f9ed] border border-emerald-200/80 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#1E6702]" />
                        <h3 className="text-sm font-bold text-slate-800">
                          Quick Location Search (Auto-Fill)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">
                        Type the initial letters of your village, taluka, or district to search across all India census locations and OpenStreetMap.
                      </p>
                      <LocationAutocompleteInput
                        placeholder="Search by location name (e.g. Pune, Anand, Khed, Wagholi)..."
                        onSelect={handleLocationSelect}
                        onInvalidSearch={(query) => {
                          setInvalidLocationModal({
                            isOpen: true,
                            message: "Please enter a valid location inside India.",
                            details: `"${query}" is not recognized as a valid location in India. Locations outside India or random text (such as 'xyz') cannot be accepted.`,
                          });
                        }}
                      />
                    </div>

                    {/* Manual / Verified Cascading Location Fields */}
                    <CascadingLocationFields
                      stateValue={formValues.state}
                      districtValue={formValues.district}
                      blockValue={formValues.block}
                      villageValue={formValues.village}
                      onStateChange={(val) => {
                        setValue("state", val, { shouldValidate: true });
                        setValue("district", "");
                        setValue("block", "");
                        setValue("village", "");
                      }}
                      onDistrictChange={(val) => {
                        setValue("district", val, { shouldValidate: true });
                        setValue("block", "");
                        setValue("village", "");
                      }}
                      onBlockChange={(val) => setValue("block", val, { shouldValidate: true })}
                      onVillageChange={(val) => setValue("village", val, { shouldValidate: true })}
                      onLocationResolved={(loc) => {
                        if (loc.lat && loc.lon) {
                          setMapCenter([loc.lat, loc.lon]);
                        }
                        if (loc.formatted) {
                          setLocationLabel(loc.formatted);
                        }
                      }}
                      stateError={errors.state?.message}
                      districtError={errors.district?.message}
                      blockError={errors.block?.message}
                      villageError={errors.village?.message}
                    />


                    {/* OpenStreetMap Interactive Preview Pin */}
                    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#1E6702]" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            OpenStreetMap Location Pin & 5km Catchment
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {locationLabel}
                        </span>
                      </div>
                      <div className="h-56 w-full relative">
                        <DynamicRadiusMap
                          center={mapCenter}
                          radiusInKm={5}
                          businessName="Proposed Business Location"
                          locationLabel={locationLabel}
                          onReload={() => {
                            const loc = resolveCoordinatesForLocation({
                              state: formValues.state,
                              district: formValues.district,
                              block: formValues.block,
                              village: formValues.village,
                            });
                            if (loc && !isNaN(loc.lat) && !isNaN(loc.lon)) {
                              setMapCenter([loc.lat, loc.lon]);
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50/70 rounded-xl p-4 flex gap-3 items-start border border-emerald-200/60">
                      <Info className="w-5 h-5 text-[#1E6702] shrink-0 mt-0.5" />
                      <p className="font-sans text-[14px] text-emerald-950 font-medium leading-relaxed">
                        Location data is critical to discovering local grants, finding localized competitors, and understanding the surrounding demographic market.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block font-sans text-[14px] font-bold text-gray-800 mb-2">{t("business.wizard.availMargin")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                        <input
                          {...register("availableMargin", { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full rounded-xl border border-gray-200 p-4 pl-8 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-sans text-[14px] font-medium"
                        />
                      </div>
                      {errors.availableMargin && <p className="text-red-500 font-sans text-[12px] mt-2 font-medium">{errors.availableMargin.message}</p>}
                    </div>

                    <div className="bg-emerald-50/70 rounded-xl p-4 flex gap-3 items-start border border-emerald-200/60">
                      <Info className="w-5 h-5 text-[#1E6702] shrink-0 mt-0.5" />
                      <p className="font-sans text-[14px] text-emerald-950 font-medium leading-relaxed">
                        State exactly how much capital you currently have on hand. We will use this to calculate loan requirements and match you with subsidies.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <label className="block font-sans text-[14px] font-bold text-gray-800">
                          {t("business.wizard.resources")}
                        </label>
                      </div>
                      <textarea
                        {...register("existingResources")}
                        rows={4}
                        placeholder="e.g., Small 400 sq ft workspace shed, power meter, weighing scale..."
                        className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-sans text-[14px] font-medium resize-none"
                      ></textarea>
                      {errors.existingResources && <p className="text-red-500 font-sans text-[12px] mt-2 font-medium">{errors.existingResources.message}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block font-sans text-[14px] font-bold text-gray-800 mb-2">{t("business.wizard.revenue")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                        <input
                          {...register("expectedRevenue", { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full rounded-xl border border-gray-200 p-4 pl-8 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-sans text-[14px] font-medium"
                        />
                      </div>
                      {errors.expectedRevenue && <p className="text-red-500 font-sans text-[12px] mt-2 font-medium">{errors.expectedRevenue.message}</p>}
                    </div>
                    
                    <div className="bg-emerald-50/70 rounded-xl p-4 flex gap-3 items-start border border-emerald-200/60">
                      <Info className="w-5 h-5 text-[#1E6702] shrink-0 mt-0.5" />
                      <p className="font-sans text-[14px] text-emerald-950 font-medium leading-relaxed">
                        Provide a realistic estimate of monthly revenue based on your planned production capacity.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 6 */}
                {currentStep === 6 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                          <dt className="font-sans text-[12px] text-gray-500 font-medium mb-1">{t("business.wizard.cat")}</dt>
                          <dd className="font-sans text-[18px] font-bold text-gray-900">{selectedCategoryName}</dd>
                        </div>
                        <div>
                          <dt className="font-sans text-[12px] text-gray-500 font-medium mb-1">Location</dt>
                          <dd className="font-sans text-[18px] font-bold text-gray-900 capitalize">
                            {[formValues.village, formValues.block, formValues.district, formValues.state].filter(Boolean).join(", ") || "-"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-sans text-[12px] text-gray-500 font-medium mb-1">{t("business.wizard.availMargin")}</dt>
                          <dd className="font-sans text-[20px] font-bold text-[#1E6702]">₹{new Intl.NumberFormat('en-IN').format(formValues.availableMargin || 0)}</dd>
                        </div>
                        <div>
                          <dt className="font-sans text-[12px] text-gray-500 font-medium mb-1">{t("business.wizard.revenue")}</dt>
                          <dd className="font-sans text-[20px] font-bold text-[#1E6702]">₹{new Intl.NumberFormat('en-IN').format(formValues.expectedRevenue || 0)} <span className="font-sans text-[14px] text-gray-500 font-medium">/mo</span></dd>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-gray-200">
                          <dt className="font-sans text-[12px] text-gray-500 font-medium mb-2">{t("business.wizard.resources")}</dt>
                          {formValues.existingResources && formValues.existingResources.trim() ? (
                            <dd className="font-sans text-[14px] font-semibold text-gray-800 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">{formValues.existingResources}</dd>
                          ) : (
                            <dd className="font-sans text-[13px] font-semibold text-emerald-900 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span>Auto-Suggested by AI: Industry benchmark equipment & facility requirements tailored to {selectedCategoryName}</span>
                              <span className="text-[11px] font-bold text-[#1E6702] bg-white px-2.5 py-1 rounded-md border border-emerald-200 shrink-0 shadow-2xs">Auto-Planned</span>
                            </dd>
                          )}
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-8 mt-12 gap-4 border-t border-gray-100">
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                      className="w-12 h-12 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#1E6702] hover:border-[#1E6702]/40 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs shrink-0"
                      title="Previous step"
                      aria-label="Previous step"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors font-sans text-[14px] font-semibold flex items-center justify-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" /> Save & Continue Later
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                  {isEditMode && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#1E6702] hover:bg-[#155201] text-white shadow-md shadow-[#1E6702]/25 transition-all font-sans text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  )}

                  {currentStep < 6 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`w-full sm:w-auto px-7 py-3.5 rounded-xl ${
                        isEditMode
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : "bg-[#1E6702] hover:bg-[#155201] text-white shadow-md shadow-[#1E6702]/20"
                      } transition-all font-sans text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      <span>{isEditMode ? "Next Section" : "Next Step"}</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : !isEditMode ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1E6702] hover:bg-[#155201] text-white shadow-md shadow-[#1E6702]/20 transition-all font-sans text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none min-w-[200px] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Analyze & Submit <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>

      <InvalidLocationModal
        isOpen={invalidLocationModal.isOpen}
        onClose={() => setInvalidLocationModal({ isOpen: false })}
        title="Valid Indian Location Required"
        message={invalidLocationModal.message}
        details={invalidLocationModal.details}
      />
    </div>
  );
};

