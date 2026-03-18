"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Flag, Lock, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useNuggetContext } from "@/context/NuggetContext";
import { BetWithOptions } from "@/types/bet";

type BetCardProps = {
  bet: BetWithOptions;
};

export function BetCard({ bet }: BetCardProps) {
  const {
    addToBetSlip,
    betSlipSelections,
    selectedOptions,
    resolveBet,
    closeBet,
    deleteBet,
    currentUser,
    isLoading,
    isBetting,
  } = useNuggetContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const selected = selectedOptions[bet.id];
  const selectedInSlip = betSlipSelections.find((item) => item.bet_id === bet.id)?.option_id;
  const isCreator = bet.creator_id === currentUser.id;

  const handleSelectOdd = (optionId: string, label: string) => {
    if (bet.status !== "open") {
      toast.error("Les mises sont bloquées pour ce pari.");
      return;
    }

    const action = addToBetSlip(bet.id, optionId);

    if (action === "removed") return toast.info(`Retiré du panier: ${label}`);
    if (action === "replaced") return toast.success(`Sélection mise à jour: ${label}`);
    if (action === "added") return toast.success(`Ajouté au panier: ${label}`);
  };

  const handleCloseBet = async () => {
    const ok = await closeBet(bet.id);
    if (ok) toast.success("Mises bloquées. Événement en cours...");
  };

  const handleResolve = async (winningOptionId: string, winningLabel: string) => {
    const result = await resolveBet(bet.id, winningOptionId);

    if (!result.ok) {
      toast.error("Pari déjà résolu.");
      return;
    }

    if (result.payout > 0) {
      toast.success(`Pari résolu: ${winningLabel}. Gains distribués (${result.payout.toFixed(2)} 🪙)`);
      return;
    }

    toast.success(`Pari résolu: ${winningLabel}`);
  };

  const handleDeleteBet = async () => {
    const deleted = await deleteBet(bet.id);
    if (!deleted) return toast.error("Suppression impossible.");

    setIsDeleteDialogOpen(false);
    toast.success("Pari supprimé avec succès.");
  };

  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-lg shadow-black/30">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold leading-snug text-white sm:text-base">{bet.title}</h2>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              bet.status === "open"
                ? "bg-green-500/20 text-green-400"
                : bet.status === "closed"
                  ? "bg-amber-400/20 text-amber-300"
                  : "bg-slate-700 text-slate-300"
            }`}
          >
            {bet.status === "open" ? "Ouvert" : bet.status === "closed" ? "Fermé" : "Résolu"}
          </span>

          {isCreator && (
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

      <p className="mb-3 text-xs text-slate-400">{bet.description}</p>

      <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
        <Users className="h-3.5 w-3.5" />
        <span>Créé par {bet.creator_id}</span>
      </div>

      {bet.status === "closed" && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300">
          <Lock className="h-4 w-4" />
          Événement en cours... les mises sont bloquées.
        </div>
      )}

      <div className="space-y-2">
        {(bet.options || []).map((option) => {
          const isSelected = selected === option.id || selectedInSlip === option.id;
          const isWinning = bet.status === "resolved" && bet.winning_option_id === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleSelectOdd(option.id, option.title)}
              disabled={isLoading || isBetting || bet.status !== "open"}
              whileTap={{ scale: 0.985 }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? "border-green-400 bg-green-500/10 shadow-md shadow-green-500/20"
                  : "border-slate-600 bg-slate-700 hover:border-green-500/70 hover:bg-slate-600"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{option.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {isWinning && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                <span className="text-lg font-extrabold text-green-400">{option.odds.toFixed(2)}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {isCreator && bet.status === "open" && (
        <div className="mt-3">
          <button
            onClick={handleCloseBet}
            disabled={isLoading}
            className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-400/20 disabled:opacity-50"
          >
            Bloquer les mises
          </button>
        </div>
      )}

      {isCreator && bet.status !== "resolved" && (
        <div className="mt-3 flex gap-2">
          {
          (bet.options || []).map((option) => (
            <button
              key={`resolve-${option.id}`}
              onClick={() => handleResolve(option.id, option.title)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-green-500 hover:text-green-300 disabled:opacity-50"
            >
              <Flag className="h-3.5 w-3.5" />
              Résoudre {option.title}
            </button>
          ))}
        </div>
      )}

      {bet.status === "resolved" && (
        <p className="mt-3 text-xs font-semibold text-green-400">
          Option gagnante: {bet.options.find((option) => option.id === bet.winning_option_id)?.title ?? "-"}
        </p>
      )}

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
