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
          className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 shadow-lg shadow-black/25"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                index === 0 ? "bg-amber-300/20 text-amber-300" : "bg-slate-700 text-slate-300"
              }`}
            >
              {index === 0 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">#{index + 1} {user.name}</p>
              <p className="text-xs text-slate-400">Niveau Nugget Master</p>
            </div>
          </div>
          <p className="rounded-full bg-green-500 px-3 py-1 text-sm font-extrabold text-slate-950">
            {user.nuggets} 🪙
          </p>
        </article>
      ))}
    </section>
  );
}
