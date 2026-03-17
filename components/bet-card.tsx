"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { useNuggetContext } from "@/context/NuggetContext";
import { Bet } from "@/types/bet";

type BetCardProps = {
  bet: Bet;
};

export function BetCard({ bet }: BetCardProps) {
  const { placeBet, selectedOptions } = useNuggetContext();
  const [successPulse, setSuccessPulse] = useState<"optionA" | "optionB" | null>(null);

  const selected = selectedOptions[bet.id];

  const handlePlaceBet = (optionId: "optionA" | "optionB", label: string) => {
    const result = placeBet(bet.id, optionId, 50);

    if (!result.ok) {
      toast.error("Pas assez de Nuggets 😭");
      return;
    }

    setSuccessPulse(optionId);
    setTimeout(() => setSuccessPulse(null), 320);
    toast.success(`Vous avez parié sur ${label} !`);
  };

  return (
    <article className="group rounded-2xl border border-amber-100 bg-white p-4 shadow-lg shadow-amber-100/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <h2 className="mb-3 text-base font-semibold leading-snug text-zinc-900">{bet.title}</h2>

      <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        <Users className="h-3.5 w-3.5" />
        <span>{bet.participants.join(" • ")}</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <motion.button
          onClick={() => handlePlaceBet("optionA", bet.optionA.label)}
          whileTap={{ scale: 0.98 }}
          animate={successPulse === "optionA" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          className={`rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 ${
            selected === "optionA"
              ? "border-amber-400 bg-amber-100/80 shadow-md shadow-amber-300/40 ring-2 ring-amber-300"
              : "border-amber-200 bg-amber-50 hover:bg-amber-100 focus-visible:ring-amber-400"
          }`}
        >
          <p className="text-sm font-semibold text-zinc-900">{bet.optionA.label}</p>
          <p className="mt-1 text-xs font-medium text-amber-700">Cagnotte: {bet.optionA.pot} 🪙</p>
        </motion.button>

        <motion.button
          onClick={() => handlePlaceBet("optionB", bet.optionB.label)}
          whileTap={{ scale: 0.98 }}
          animate={successPulse === "optionB" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          className={`rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 ${
            selected === "optionB"
              ? "border-amber-400 bg-amber-100/80 shadow-md shadow-amber-300/40 ring-2 ring-amber-300"
              : "border-orange-200 bg-orange-50 hover:bg-orange-100 focus-visible:ring-orange-400"
          }`}
        >
          <p className="text-sm font-semibold text-zinc-900">{bet.optionB.label}</p>
          <p className="mt-1 text-xs font-medium text-orange-700">Cagnotte: {bet.optionB.pot} 🪙</p>
        </motion.button>
      </div>
    </article>
  );
}
