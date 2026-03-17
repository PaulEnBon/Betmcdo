import { Crown, Medal } from "lucide-react";

const leaders = [
  { name: "Lina", nuggets: 980 },
  { name: "Thomas", nuggets: 840 },
  { name: "Sarah", nuggets: 710 },
  { name: "Max", nuggets: 620 },
  { name: "Inès", nuggets: 540 },
];

export function Leaderboard() {
  return (
    <section className="space-y-3">
      {leaders.map((user, index) => (
        <article
          key={user.name}
          className="flex items-center justify-between rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 shadow-lg shadow-amber-100/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              {index === 0 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">#{index + 1} {user.name}</p>
              <p className="text-xs text-zinc-500">Niveau Nugget Master</p>
            </div>
          </div>
          <p className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-sm font-bold text-white">
            {user.nuggets} 🪙
          </p>
        </article>
      ))}
    </section>
  );
}
