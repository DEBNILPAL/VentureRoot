"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { deleteBusinessCompletely } from "@/lib/data/businesses";

interface DeleteBusinessModalProps {
  isOpen: boolean;
  businessId: string;
  businessName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteBusinessModal({
  isOpen,
  businessId,
  businessName,
  onClose,
  onDeleted,
}: DeleteBusinessModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteBusinessCompletely(businessId);
      setIsDeleting(false);
      onDeleted?.();
      onClose();
    } catch (err: any) {
      setIsDeleting(false);
      setErrorMessage(err?.message || "Failed to delete venture. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-venture-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-inner">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-6">
            <h2 id="delete-venture-title" className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              Delete Venture?
            </h2>
            <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Permanent action · Cannot be undone</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-150 rounded-xl p-3.5">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900 font-bold break-words">{businessName}</strong>?
          <p className="mt-1 text-slate-500 text-xs">
            This will cleanly erase this venture from the database, along with all its financial calculations, feasibility intelligence, and local competitor records.
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Yes, Delete Venture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
