"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, MapPin, X, Check } from "lucide-react";

export interface InvalidLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  details?: string;
}

export const InvalidLocationModal: React.FC<InvalidLocationModalProps> = ({
  isOpen,
  onClose,
  title = "Valid Indian Location Required",
  message = "Please enter a valid location inside India. Locations outside India or random text (such as 'xyz') cannot be accepted.",
  details,
}) => {
  const okButtonRef = useRef<HTMLButtonElement>(null);

  // Focus OK button when modal opens & handle Escape key
  useEffect(() => {
    if (isOpen) {
      okButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" || e.key === "Enter") {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invalid-location-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close 'X' button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Badge */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center text-amber-600 shadow-inner">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1E6702] border-2 border-white flex items-center justify-center shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h3
          id="invalid-location-title"
          className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2"
        >
          {title}
        </h3>

        {/* Main message */}
        <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
          {message}
        </p>

        {/* Specific Reason / Highlight Card if available */}
        {details && (
          <div className="w-full bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 mb-5 text-left flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
            <p className="font-sans text-[12px] font-semibold text-amber-900 leading-snug">
              {details}
            </p>
          </div>
        )}

        {/* Action Button: OK button */}
        <div className="w-full pt-1">
          <button
            ref={okButtonRef}
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-[#1E6702] hover:bg-[#165002] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6702] focus:ring-offset-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
