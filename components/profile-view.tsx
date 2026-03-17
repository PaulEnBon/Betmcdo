import { ChartNoAxesCombined, CircleCheck, CircleX, Clock3, Wallet } from "lucide-react";
import { WagerWithContext } from "@/types/bet";

type ProfileViewProps = {
  wagers: WagerWithContext[];
};

export function ProfileView({ wagers }: ProfileViewProps) {
  const won = wagers.filter((w) => w.status === "won");
  const lost = wagers.filter((w) => w.status === "lost");
  const pending = wagers.filter((w) => w.status === "pending");

  const totalWon = won.reduce((acc, w) => acc + w.potential_payout - w.amount, 0);
  const settledCount = won.length + lost.length;
  const winrate = settledCount > 0 ? (won.length / settledCount) * 100 : 0;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Nuggets gagnés</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xl font-extrabold text-green-400">
            <Wallet className="h-5 w-5" />
            {totalWon.toFixed(2)}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Winrate</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xl font-extrabold text-amber-300">
            <ChartNoAxesCombined className="h-5 w-5" />
            {winrate.toFixed(1)}%
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Total wagers: {wagers.length}</span>
          <span>En attente: {pending.length}</span>
        </div>

        <div className="space-y-2">
          {wagers.map((wager) => (
            <div
              key={wager.id}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{wager.bet_title}</p>
                  <p className="text-xs text-slate-400">{wager.option_title}</p>
                </div>
                <StatusBadge status={wager.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Mise: {wager.amount.toFixed(2)} 🪙</span>
                <span>Gain potentiel: {wager.potential_payout.toFixed(2)} 🪙</span>
              </div>
            </div>
          ))}

          {wagers.length === 0 && (
            <p className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-4 text-center text-sm text-slate-400">
              Aucun wager pour le moment.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}

function StatusBadge({ status }: { status: WagerWithContext["status"] }) {
  if (status === "won") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-1 text-xs font-bold text-green-400">
        <CircleCheck className="h-3.5 w-3.5" />
        Gagné
      </span>
    );
  }

  if (status === "lost") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-xs font-bold text-red-300">
        <CircleX className="h-3.5 w-3.5" />
        Perdu
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-1 text-xs font-bold text-slate-300">
      <Clock3 className="h-3.5 w-3.5" />
      En attente
    </span>
  );
}
