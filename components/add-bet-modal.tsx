"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useNuggetContext } from "@/context/NuggetContext";

type AddBetModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddBetModal({ isOpen, onClose }: AddBetModalProps) {
  const { addBet, isLoading } = useNuggetContext();
  const [title, setTitle] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [odds1, setOdds1] = useState("1.50");
  const [odds2, setOdds2] = useState("2.10");

  const odds1Number = Number(odds1);
  const odds2Number = Number(odds2);

  const canCreate = useMemo(
    () =>
      title.trim().length > 0 &&
      option1.trim().length > 0 &&
      option2.trim().length > 0 &&
      odds1Number > 1 &&
      odds2Number > 1,
    [title, option1, option2, odds1Number, odds2Number],
  );

  const handleCreateBet = async () => {
    if (!canCreate) return;

    await addBet({
      title: title.trim(),
      option1: option1.trim(),
      option2: option2.trim(),
      odds1: odds1Number,
      odds2: odds2Number,
    });

    toast.success("Pari enregistré !");
    setTitle("");
    setOption1("");
    setOption2("");
    setOdds1("1.50");
    setOdds2("2.10");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 flex items-end justify-center bg-zinc-900/45 p-4 backdrop-blur-[2px] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/90 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Nouveau pari</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Titre du pari"
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/25"
              />
              <input
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                type="text"
                placeholder="Option 1"
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/25"
              />
              <input
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                type="text"
                placeholder="Option 2"
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/25"
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  Cote Option 1
                  <input
                    value={odds1}
                    onChange={(e) => setOdds1(e.target.value)}
                    type="number"
                    min={1.01}
                    step={0.01}
                    placeholder="1.50"
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm font-bold text-green-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/25"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  Cote Option 2
                  <input
                    value={odds2}
                    onChange={(e) => setOdds2(e.target.value)}
                    type="number"
                    min={1.01}
                    step={0.01}
                    placeholder="2.10"
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm font-bold text-green-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/25"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleCreateBet}
              disabled={!canCreate || isLoading}
              className="mt-5 w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-sm transition enabled:hover:bg-green-400 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? "Chargement..." : "Créer le pari"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
