"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Flag, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useNuggetContext } from "@/context/NuggetContext";
import { Bet } from "@/types/bet";

type BetCardProps = {
  bet: Bet;
};

export function BetCard({ bet }: BetCardProps) {
  const { addToBetSlip, betSlipSelections, selectedOptions, resolveBet, deleteBet, currentUser, isLoading } =
    useNuggetContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const selected = selectedOptions[bet.id];
  const selectedInSlip = betSlipSelections.find((item) => item.betId === bet.id)?.optionId;
  const canDelete = bet.creatorId === currentUser.id;

  const handleSelectOdd = (optionId: string, label: string) => {
    if (bet.status !== "active") {
      toast.error("Ce pari est déjà terminé.");
      return;
    }

    const action = addToBetSlip(bet.id, optionId);

    if (action === "removed") {
      toast.info(`Retiré du combiné: ${label}`);
      return;
    }

    if (action === "replaced") {
      toast.success(`Sélection mise à jour: ${label}`);
      return;
    }

    if (action === "added") {
      toast.success(`Ajouté au combiné: ${label}`);
    }
  };

  const handleResolve = async (winningOptionId: string, winningLabel: string) => {
    const result = await resolveBet(bet.id, winningOptionId);

    if (!result.ok) {
      toast.error("Pari déjà résolu.");
      return;
    }

    if (result.payout > 0) {
      toast.success(`Pari résolu: ${winningLabel}. Gain: ${result.payout.toFixed(2)} Nuggets`);
      return;
    }

    toast.success(`Pari résolu: ${winningLabel}`);
  };

  const handleDeleteBet = async () => {
    const deleted = await deleteBet(bet.id);
    if (!deleted) {
      toast.error("Suppression impossible.");
      return;
    }

    setIsDeleteDialogOpen(false);
    toast.success("Pari supprimé avec succès.");
  };

  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-lg shadow-black/30">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold leading-snug text-white sm:text-base">{bet.title}</h2>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              bet.status === "active" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"
            }`}
          >
            {bet.status === "active" ? "En cours" : "Terminé"}
          </span>

          {canDelete && (
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
              className="rounded-lg border border-red-500/40 bg-red-500/10 p-1.5 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              aria-label="Supprimer le pari"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
        <Users className="h-3.5 w-3.5" />
        <span>{bet.participants.join(" • ")}</span>
      </div>

      <div className="space-y-2">
        {bet.options.map((option) => {
          const isSelected = selected === option.id || selectedInSlip === option.id;
          const isWinning = bet.status === "resolved" && bet.winningOptionId === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleSelectOdd(option.id, option.label)}
              disabled={isLoading}
              whileTap={{ scale: 0.985 }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
                isSelected
                  ? "border-green-400 bg-green-500/10 shadow-md shadow-green-500/20"
                  : "border-slate-600 bg-slate-700 hover:border-green-500/70 hover:bg-slate-600"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                <p className="text-xs text-slate-400">Cagnotte: {option.pot.toFixed(2)} 🪙</p>
              </div>
              <div className="flex items-center gap-2">
                {isWinning && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                <span className="text-lg font-extrabold text-green-400">{option.odds.toFixed(2)}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {bet.status === "active" ? (
        <div className="mt-3 flex gap-2">
          {bet.options.map((option) => (
            <button
              key={`resolve-${option.id}`}
              onClick={() => handleResolve(option.id, option.label)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-green-500 hover:text-green-300"
            >
              <Flag className="h-3.5 w-3.5" />
              Résoudre {option.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-green-400">
          Option gagnante: {bet.options.find((option) => option.id === bet.winningOptionId)?.label ?? "-"}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
        {bet.options.map((option) => (
          <p key={`recap-${option.id}`}>
            {option.label}: <span className="font-bold text-slate-200">{option.pot.toFixed(2)} 🪙</span>
          </p>
        ))}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Supprimer ce pari ?"
        description="Es-tu sûr de vouloir supprimer ce pari ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isLoading={isLoading}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteBet}
      />
    </article>
  );
}
