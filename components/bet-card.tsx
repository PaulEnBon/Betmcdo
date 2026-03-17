import { Users } from "lucide-react";
import { Bet } from "@/types/bet";

type BetCardProps = {
  bet: Bet;
};

export function BetCard({ bet }: BetCardProps) {
  return (
    <article className="group rounded-3xl border border-amber-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <h2 className="mb-3 text-base font-semibold leading-snug text-zinc-900">{bet.title}</h2>

      <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        <Users className="h-3.5 w-3.5" />
        <span>{bet.participants.join(" • ")}</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button className="active:scale-[0.98] rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          <p className="text-sm font-semibold text-zinc-900">{bet.optionA.label}</p>
          <p className="mt-1 text-xs font-medium text-amber-700">Cagnotte: {bet.optionA.pot} 🪙</p>
        </button>

        <button className="active:scale-[0.98] rounded-2xl border border-orange-200 bg-orange-50 p-3 text-left transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
          <p className="text-sm font-semibold text-zinc-900">{bet.optionB.label}</p>
          <p className="mt-1 text-xs font-medium text-orange-700">Cagnotte: {bet.optionB.pot} 🪙</p>
        </button>
      </div>
    </article>
  );
}
