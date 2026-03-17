"use client";

import { AnimatePresence, motion } from "framer-motion";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="text-base font-extrabold text-slate-100">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{description}</p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="rounded-xl bg-red-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {isLoading ? "Chargement..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
