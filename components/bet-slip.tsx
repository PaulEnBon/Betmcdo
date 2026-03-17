"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ReceiptText, X } from "lucide-react";
import { toast } from "sonner";
import { useNuggetContext } from "@/context/NuggetContext";

export function BetSlip() {
  const { betSlipSelections, placeBet, clearBetSlip, removeFromBetSlip, isLoading } = useNuggetContext();
  const [amount, setAmount] = useState("50");

  const amountNumber = Number(amount);
  const combinedOdds = useMemo(
    () => betSlipSelections.reduce((acc, selection) => acc * selection.odds, 1),
    [betSlipSelections],
  );

  const potentialGain = useMemo(() => {
    if (betSlipSelections.length === 0 || Number.isNaN(amountNumber) || amountNumber <= 0) return 0;
    return amountNumber * combinedOdds;
  }, [amountNumber, betSlipSelections.length, combinedOdds]);

  const handlePlaceBet = async () => {
    if (betSlipSelections.length === 0) return;

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      toast.error("Montant invalide.");
      return;
    }

    const result = await placeBet(amountNumber);

    if (!result.ok) {
      if (result.reason === "INSUFFICIENT_FUNDS") {
        toast.error("Pas assez de Nuggets 😭");
      } else {
        toast.error("Sélection manquante.");
      }
      return;
    }

    toast.success(`Pari placé ! Gain potentiel: ${potentialGain.toFixed(2)} Nuggets`);
  };

  return (
    <AnimatePresence>
      {betSlipSelections.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-md px-4 sm:max-w-xl lg:max-w-2xl"
        >
          <div className="rounded-2xl border border-slate-700 bg-slate-800/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <ReceiptText className="h-4 w-4 text-green-400" />
                Combiné ({betSlipSelections.length})
              </div>
              <button
                onClick={clearBetSlip}
                disabled={isLoading}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                aria-label="Fermer le panier"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              {betSlipSelections.map((selection) => (
                <div
                  key={`${selection.betId}-${selection.optionId}`}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-2 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{selection.optionLabel}</p>
                    <p className="text-xs font-extrabold text-green-400">Cote {selection.odds.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromBetSlip(selection.betId)}
                    disabled={isLoading}
                    className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
                    aria-label="Retirer la sélection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                Mise (Nuggets)
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-bold text-slate-100 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/25"
                />
              </label>

              <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                <p className="text-xs text-slate-400">Cote totale</p>
                <p className="mt-1 text-lg font-extrabold text-green-400">{combinedOdds.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
              <p className="text-xs text-slate-400">Gain potentiel</p>
                <p className="mt-1 text-lg font-extrabold text-green-400">{potentialGain.toFixed(2)} 🪙</p>
            </div>

            <button
              onClick={handlePlaceBet}
              disabled={isLoading}
              className="mt-4 w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-green-400 active:scale-[0.99]"
            >
              {isLoading ? "Chargement..." : "Placer le pari"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
