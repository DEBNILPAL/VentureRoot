"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapPin,
  Check,
  ChevronDown,
  AlertCircle,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  ALL_INDIAN_STATES,
  INDIA_DISTRICTS_BY_STATE,
  isValidIndianState,
  normalizeStateName,
  getDistrictsForState,
  validateDistrictForState,
  getPopularBlocksForDistrict,
  validateLocalityText,
  cleanLocationStr,
  IndianState,
} from "@/lib/data/indiaLocations";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";

export interface CascadingLocationValues {
  state: string;
  district: string;
  block?: string;
  village?: string;
  lat?: number;
  lon?: number;
  formatted?: string;
}

export interface CascadingLocationFieldsProps {
  stateValue?: string;
  districtValue?: string;
  blockValue?: string;
  villageValue?: string;
  onStateChange?: (val: string) => void;
  onDistrictChange?: (val: string) => void;
  onBlockChange?: (val: string) => void;
  onVillageChange?: (val: string) => void;
  onLocationResolved?: (loc: CascadingLocationValues) => void;
  stateError?: string;
  districtError?: string;
  blockError?: string;
  villageError?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
  disabled?: boolean;
}

export const CascadingLocationFields: React.FC<CascadingLocationFieldsProps> = ({
  stateValue = "",
  districtValue = "",
  blockValue = "",
  villageValue = "",
  onStateChange,
  onDistrictChange,
  onBlockChange,
  onVillageChange,
  onLocationResolved,
  stateError,
  districtError,
  blockError,
  villageError,
  required = true,
  className = "",
  inputClassName = "",
  compact = false,
  disabled = false,
}) => {
  // Internal state buffers for responsive typing
  const [internalState, setInternalState] = useState(stateValue);
  const [internalDistrict, setInternalDistrict] = useState(districtValue);
  const [internalBlock, setInternalBlock] = useState(blockValue);
  const [internalVillage, setInternalVillage] = useState(villageValue);

  // Dropdown open states
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isVillageOpen, setIsVillageOpen] = useState(false);

  // Dynamic village / OSM suggestions
  const [villageSuggestions, setVillageSuggestions] = useState<any[]>([]);
  const [isSearchingVillage, setIsSearchingVillage] = useState(false);

  // Validation errors
  const [localDistrictError, setLocalDistrictError] = useState<string | null>(null);
  const [localBlockError, setLocalBlockError] = useState<string | null>(null);
  const [localVillageError, setLocalVillageError] = useState<string | null>(null);

  // Refs for clicking outside
  const stateRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const villageRef = useRef<HTMLDivElement>(null);

  // Sync with incoming external values (e.g. from AutoFill or React Hook Form reset)
  useEffect(() => {
    setInternalState(stateValue || "");
  }, [stateValue]);

  useEffect(() => {
    setInternalDistrict(districtValue || "");
  }, [districtValue]);

  useEffect(() => {
    setInternalBlock(blockValue || "");
  }, [blockValue]);

  useEffect(() => {
    setInternalVillage(villageValue || "");
  }, [villageValue]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (stateRef.current && !stateRef.current.contains(target)) setIsStateOpen(false);
      if (districtRef.current && !districtRef.current.contains(target)) setIsDistrictOpen(false);
      if (blockRef.current && !blockRef.current.contains(target)) setIsBlockOpen(false);
      if (villageRef.current && !villageRef.current.contains(target)) setIsVillageOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Canonical state resolution
  const canonicalState = useMemo(() => {
    return normalizeStateName(internalState);
  }, [internalState]);

  const isStateValid = Boolean(canonicalState);

  // Districts list for the currently selected state
  const availableDistricts = useMemo(() => {
    if (!canonicalState) return [];
    return getDistrictsForState(canonicalState);
  }, [canonicalState]);

  // Filtered districts based on user search
  const filteredDistricts = useMemo(() => {
    if (!availableDistricts.length) return [];
    const query = cleanLocationStr(internalDistrict);
    if (!query) return availableDistricts;
    return availableDistricts.filter((d) => cleanLocationStr(d).includes(query));
  }, [availableDistricts, internalDistrict]);

  // District validation
  const districtValidation = useMemo(() => {
    if (!isStateValid || !internalDistrict.trim()) {
      return { valid: false };
    }
    return validateDistrictForState(canonicalState, internalDistrict);
  }, [canonicalState, isStateValid, internalDistrict]);

  const isDistrictValid = districtValidation.valid;

  // Known talukas for district
  const popularTalukas = useMemo(() => {
    if (!canonicalState || !isDistrictValid) return [];
    return getPopularBlocksForDistrict(canonicalState, internalDistrict);
  }, [canonicalState, isDistrictValid, internalDistrict]);

  // Filtered blocks based on user typing
  const filteredBlocks = useMemo(() => {
    const query = cleanLocationStr(internalBlock);
    if (!query) return popularTalukas;
    return popularTalukas.filter((b) => cleanLocationStr(b).includes(query));
  }, [popularTalukas, internalBlock]);

  // Block is valid if not empty and passes basic sanity check
  const isBlockValid = useMemo(() => {
    if (!internalBlock.trim()) return false;
    const check = validateLocalityText(internalBlock, "Block / Taluka");
    return check.valid;
  }, [internalBlock]);

  // Village validation
  const isVillageValid = useMemo(() => {
    if (!internalVillage.trim()) return false;
    const check = validateLocalityText(internalVillage, "Village / Town");
    return check.valid;
  }, [internalVillage]);

  // Cascade Locking States
  const isDistrictLocked = disabled || !isStateValid;
  const isBlockLocked = disabled || !isDistrictValid;
  const isVillageLocked = disabled || !isBlockValid;

  // Filtered states for state dropdown
  const filteredStates = useMemo(() => {
    const clean = cleanLocationStr(internalState);
    if (!clean) return ALL_INDIAN_STATES;
    return ALL_INDIAN_STATES.filter(
      (s) =>
        cleanLocationStr(s.name).includes(clean) ||
        cleanLocationStr(s.code) === clean ||
        s.aliases?.some((a) => cleanLocationStr(a).includes(clean))
    );
  }, [internalState]);

  // Live OSM search for Village / Town when block and district are set
  useEffect(() => {
    const clean = internalVillage.trim();
    if (isVillageLocked || clean.length < 2) {
      setVillageSuggestions([]);
      return;
    }

    // Check if obvious nonsense like 'abc', 'xyz', '123'
    const sanityCheck = validateLocalityText(clean, "Village / Town");
    if (!sanityCheck.valid) {
      setLocalVillageError(sanityCheck.errorMessage || "Invalid village name.");
      setVillageSuggestions([]);
      return;
    } else {
      setLocalVillageError(null);
    }

    setIsSearchingVillage(true);
    const timer = setTimeout(() => {
      const searchTarget = `${clean}, ${internalDistrict}, ${canonicalState || internalState}`;
      fetch(`/api/v1/locations/search?q=${encodeURIComponent(searchTarget)}&limit=6`)
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((json) => {
          const locs = json?.data?.locations || json?.locations || [];
          setVillageSuggestions(locs);
          setIsSearchingVillage(false);
        })
        .catch(() => {
          setIsSearchingVillage(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [internalVillage, internalDistrict, canonicalState, internalState, isVillageLocked]);

  // State selection handler
  const handleSelectState = (stateItem: IndianState) => {
    setInternalState(stateItem.name);
    setIsStateOpen(false);

    // Cascade Reset: clear district, block, and village when state changes
    setInternalDistrict("");
    setInternalBlock("");
    setInternalVillage("");
    setLocalDistrictError(null);
    setLocalBlockError(null);
    setLocalVillageError(null);

    if (onStateChange) onStateChange(stateItem.name);
    if (onDistrictChange) onDistrictChange("");
    if (onBlockChange) onBlockChange("");
    if (onVillageChange) onVillageChange("");

    emitResolvedCoordinates(stateItem.name, "", "", "");
  };

  const handleStateInputChange = (val: string) => {
    setInternalState(val);
    setIsStateOpen(true);

    const norm = normalizeStateName(val);
    if (onStateChange) onStateChange(val);

    // If state is cleared or completely changed to invalid, reset children
    if (!norm) {
      if (internalDistrict) {
        setInternalDistrict("");
        if (onDistrictChange) onDistrictChange("");
      }
      if (internalBlock) {
        setInternalBlock("");
        if (onBlockChange) onBlockChange("");
      }
      if (internalVillage) {
        setInternalVillage("");
        if (onVillageChange) onVillageChange("");
      }
    }
  };

  // District selection handler
  const handleSelectDistrict = (districtName: string) => {
    setInternalDistrict(districtName);
    setIsDistrictOpen(false);
    setLocalDistrictError(null);

    // Cascade Reset: clear block and village when district changes
    setInternalBlock("");
    setInternalVillage("");
    setLocalBlockError(null);
    setLocalVillageError(null);

    if (onDistrictChange) onDistrictChange(districtName);
    if (onBlockChange) onBlockChange("");
    if (onVillageChange) onVillageChange("");

    emitResolvedCoordinates(canonicalState || internalState, districtName, "", "");
  };

  const handleDistrictInputChange = (val: string) => {
    setInternalDistrict(val);
    setIsDistrictOpen(true);

    if (onDistrictChange) onDistrictChange(val);

    // Check validity on the fly
    if (val.trim().length >= 3 && canonicalState) {
      const res = validateDistrictForState(canonicalState, val);
      if (!res.valid) {
        setLocalDistrictError(res.errorMessage || `Invalid district for ${canonicalState}.`);
      } else {
        setLocalDistrictError(null);
      }
    } else {
      setLocalDistrictError(null);
    }
  };

  const handleDistrictBlur = () => {
    if (!internalDistrict.trim()) return;
    if (canonicalState) {
      const res = validateDistrictForState(canonicalState, internalDistrict);
      if (!res.valid) {
        setLocalDistrictError(res.errorMessage || `Invalid district for ${canonicalState}.`);
      } else if (res.canonicalDistrict) {
        setInternalDistrict(res.canonicalDistrict);
        setLocalDistrictError(null);
        if (onDistrictChange) onDistrictChange(res.canonicalDistrict);
        emitResolvedCoordinates(canonicalState, res.canonicalDistrict, internalBlock, internalVillage);
      }
    }
  };

  // Block selection handler
  const handleSelectBlock = (blockName: string) => {
    setInternalBlock(blockName);
    setIsBlockOpen(false);
    setLocalBlockError(null);

    // Cascade Reset: clear village when block changes
    setInternalVillage("");
    setLocalVillageError(null);

    if (onBlockChange) onBlockChange(blockName);
    if (onVillageChange) onVillageChange("");

    emitResolvedCoordinates(canonicalState || internalState, internalDistrict, blockName, "");
  };

  const handleBlockInputChange = (val: string) => {
    setInternalBlock(val);
    setIsBlockOpen(true);

    if (onBlockChange) onBlockChange(val);

    const check = validateLocalityText(val, "Block / Taluka");
    if (!check.valid && val.trim().length > 0) {
      setLocalBlockError(check.errorMessage || "Invalid block or taluka name.");
    } else {
      setLocalBlockError(null);
    }
  };

  const handleBlockBlur = () => {
    if (!internalBlock.trim()) return;
    const check = validateLocalityText(internalBlock, "Block / Taluka");
    if (!check.valid) {
      setLocalBlockError(check.errorMessage || "Invalid block name.");
    } else {
      setLocalBlockError(null);
      emitResolvedCoordinates(canonicalState || internalState, internalDistrict, internalBlock, internalVillage);
    }
  };

  // Village selection handler
  const handleSelectVillageSuggestion = (item: any) => {
    const d = item.data || {};
    const villageName = d.village || item.name || internalVillage;
    setInternalVillage(villageName);
    setIsVillageOpen(false);
    setLocalVillageError(null);

    if (onVillageChange) onVillageChange(villageName);

    const lat = d.latitude ?? item.latitude ?? item.lat;
    const lon = d.longitude ?? item.longitude ?? item.lon;

    if (onLocationResolved && lat && lon) {
      onLocationResolved({
        state: canonicalState || internalState,
        district: internalDistrict,
        block: internalBlock || d.block,
        village: villageName,
        lat: Number(lat),
        lon: Number(lon),
        formatted: item.label || `${villageName}, ${internalDistrict}, ${canonicalState || internalState}`,
      });
    } else {
      emitResolvedCoordinates(canonicalState || internalState, internalDistrict, internalBlock, villageName);
    }
  };

  const handleVillageInputChange = (val: string) => {
    setInternalVillage(val);
    setIsVillageOpen(true);

    if (onVillageChange) onVillageChange(val);

    const check = validateLocalityText(val, "Village / Town");
    if (!check.valid && val.trim().length > 0) {
      setLocalVillageError(check.errorMessage || "Invalid village or town name.");
    } else {
      setLocalVillageError(null);
    }
  };

  const handleVillageBlur = () => {
    if (!internalVillage.trim()) return;
    const check = validateLocalityText(internalVillage, "Village / Town");
    if (!check.valid) {
      setLocalVillageError(check.errorMessage || "Invalid village name.");
    } else {
      setLocalVillageError(null);
      emitResolvedCoordinates(canonicalState || internalState, internalDistrict, internalBlock, internalVillage);
    }
  };

  const emitResolvedCoordinates = (
    s: string,
    d: string,
    b: string,
    v: string
  ) => {
    if (!onLocationResolved) return;
    const resolved = resolveCoordinatesForLocation({
      state: s,
      district: d,
      block: b,
      village: v,
    });
    onLocationResolved({
      state: s,
      district: d,
      block: b,
      village: v,
      lat: resolved.lat,
      lon: resolved.lon,
      formatted: resolved.label,
    });
  };

  const effectiveDistrictError = localDistrictError || districtError;
  const effectiveBlockError = localBlockError || blockError;
  const effectiveVillageError = localVillageError || villageError;

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 1. STATE INPUT */}
        <div ref={stateRef} className="relative flex flex-col gap-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            State / Union Territory {required && <span className="text-red-500">*</span>}
          </label>

          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={internalState}
              onChange={(e) => handleStateInputChange(e.target.value)}
              onFocus={() => setIsStateOpen(true)}
              placeholder="Type state name (e.g. Maharashtra, Gujarat, Punjab)..."
              disabled={disabled}
              autoComplete="off"
              className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all pr-10 shadow-xs ${
                stateError
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : isStateValid
                  ? "border-emerald-300 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
                  : "border-slate-200 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
              } ${inputClassName}`}
            />
            <div className="absolute right-3 flex items-center gap-1 pointer-events-none text-slate-400">
              <ChevronDown className={`w-4 h-4 transition-transform ${isStateOpen ? "rotate-180 text-[#1E6702]" : ""}`} />
            </div>
          </div>

          {stateError && (
            <p className="flex items-center gap-1 text-red-500 text-xs font-medium mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {stateError}
            </p>
          )}

          {/* State Dropdown */}
          {isStateOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-56 overflow-y-auto animate-in fade-in duration-150">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Select State / UT</span>
                <span className="text-[10px] text-emerald-700 font-bold lowercase">
                  {filteredStates.length} options
                </span>
              </div>
              <div className="py-1">
                {filteredStates.length > 0 ? (
                  filteredStates.map((item) => {
                    const isSelected = canonicalState === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectState(item)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs sm:text-sm transition-colors ${
                          isSelected ? "bg-emerald-50 text-[#1E6702] font-bold" : "text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-[#1E6702]" : "text-slate-400"}`} />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.type === "Union Territory" ? "UT" : item.code}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3.5 py-3 text-center text-xs text-slate-500">
                    No Indian state matching &quot;{internalState}&quot;.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. DISTRICT INPUT */}
        <div ref={districtRef} className="relative flex flex-col gap-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            District / Cluster {required && <span className="text-red-500">*</span>}
          </label>

          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={internalDistrict}
              onChange={(e) => handleDistrictInputChange(e.target.value)}
              onFocus={() => {
                if (!isDistrictLocked) setIsDistrictOpen(true);
              }}
              onBlur={handleDistrictBlur}
              placeholder={
                isDistrictLocked
                  ? "Select a state first..."
                  : `Type or select a district of ${canonicalState}...`
              }
              disabled={isDistrictLocked}
              autoComplete="off"
              className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all pr-10 shadow-xs ${
                isDistrictLocked
                  ? "bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed placeholder:text-slate-400"
                  : effectiveDistrictError
                  ? "bg-red-50/20 border-red-400 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : isDistrictValid
                  ? "bg-white border-emerald-300 text-slate-900 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
                  : "bg-white border-slate-200 text-slate-900 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
              } ${inputClassName}`}
            />
            <div className="absolute right-3 flex items-center gap-1 pointer-events-none text-slate-400">
              <ChevronDown className={`w-4 h-4 transition-transform ${isDistrictOpen ? "rotate-180 text-[#1E6702]" : "text-slate-400"}`} />
            </div>
          </div>

          {/* District Error */}
          {effectiveDistrictError && !isDistrictLocked && (
            <p className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mt-1 bg-red-50 p-2 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{effectiveDistrictError}</span>
            </p>
          )}

          {/* District Dropdown - strictly limited to selected state */}
          {isDistrictOpen && !isDistrictLocked && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-56 overflow-y-auto animate-in fade-in duration-150">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Districts of {canonicalState}</span>
                <span className="text-[10px] text-emerald-700 font-bold lowercase">
                  {filteredDistricts.length} available
                </span>
              </div>
              <div className="py-1">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((d) => {
                    const isSelected = cleanLocationStr(internalDistrict) === cleanLocationStr(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelectDistrict(d)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs sm:text-sm transition-colors ${
                          isSelected ? "bg-emerald-50 text-[#1E6702] font-bold" : "text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{d}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#1E6702]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3.5 py-3 text-center text-xs text-red-600 font-medium">
                    No district in {canonicalState} matching &quot;{internalDistrict}&quot;.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. BLOCK / TALUKA INPUT */}
        <div ref={blockRef} className="relative flex flex-col gap-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Block / Taluka
          </label>

          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={internalBlock}
              onChange={(e) => handleBlockInputChange(e.target.value)}
              onFocus={() => {
                if (!isBlockLocked && popularTalukas.length > 0) setIsBlockOpen(true);
              }}
              onBlur={handleBlockBlur}
              placeholder={
                isBlockLocked
                  ? "Select a district first..."
                  : popularTalukas.length > 0
                  ? `e.g. ${popularTalukas.slice(0, 2).join(", ")}...`
                  : "Type taluka or sub-district name..."
              }
              disabled={isBlockLocked}
              autoComplete="off"
              className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all shadow-xs ${
                isBlockLocked
                  ? "bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed placeholder:text-slate-400"
                  : effectiveBlockError
                  ? "bg-red-50/20 border-red-400 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : isBlockValid
                  ? "bg-white border-emerald-300 text-slate-900 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
                  : "bg-white border-slate-200 text-slate-900 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
              } ${inputClassName}`}
            />
          </div>

          {effectiveBlockError && !isBlockLocked && (
            <p className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mt-1 bg-red-50 p-2 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{effectiveBlockError}</span>
            </p>
          )}

          {/* Block Suggestions Dropdown */}
          {isBlockOpen && !isBlockLocked && filteredBlocks.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto animate-in fade-in duration-150">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Popular Talukas in {internalDistrict}</span>
              </div>
              <div className="py-1">
                {filteredBlocks.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleSelectBlock(b)}
                    className="w-full text-left px-3.5 py-2 text-xs sm:text-sm text-slate-800 hover:bg-emerald-50 hover:text-[#1E6702] transition-colors flex items-center justify-between"
                  >
                    <span>{b}</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. VILLAGE / TOWN INPUT */}
        <div ref={villageRef} className="relative flex flex-col gap-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Village / Town
          </label>


          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={internalVillage}
              onChange={(e) => handleVillageInputChange(e.target.value)}
              onFocus={() => {
                if (!isVillageLocked) setIsVillageOpen(true);
              }}
              onBlur={handleVillageBlur}
              placeholder={
                isVillageLocked
                  ? "Enter block / taluka first..."
                  : "Type village name or local town..."
              }
              disabled={isVillageLocked}
              autoComplete="off"
              className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all pr-10 shadow-xs ${
                isVillageLocked
                  ? "bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed placeholder:text-slate-400"
                  : effectiveVillageError
                  ? "bg-red-50/20 border-red-400 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : isVillageValid
                  ? "bg-white border-emerald-300 text-slate-900 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
                  : "bg-white border-slate-200 text-slate-900 focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10"
              } ${inputClassName}`}
            />
            <div className="absolute right-3 flex items-center gap-1 pointer-events-none text-slate-400">
              {isSearchingVillage ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#1E6702]" />
              ) : !isVillageLocked ? (
                <Search className="w-4 h-4 text-slate-400" />
              ) : null}
            </div>
          </div>

          {effectiveVillageError && !isVillageLocked && (
            <p className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mt-1 bg-red-50 p-2 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{effectiveVillageError}</span>
            </p>
          )}

          {/* Dynamic Village / Locality Suggestions Dropdown */}
          {isVillageOpen && !isVillageLocked && villageSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-52 overflow-y-auto animate-in fade-in duration-150">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Verified Localities in {internalDistrict}</span>
                <span className="text-[10px] text-emerald-700 font-bold lowercase">
                  {villageSuggestions.length} found
                </span>
              </div>
              <div className="py-1">
                {villageSuggestions.map((item, idx) => {
                  const d = item.data || {};
                  const placeName = d.village || item.name || item.label;
                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleSelectVillageSuggestion(item)}
                      className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 hover:bg-emerald-50 hover:text-[#1E6702] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900 truncate">{placeName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {item.type || "Village"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

