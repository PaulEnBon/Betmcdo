import { Crown, Medal } from "lucide-react";
import { UserRow } from "@/types/bet";

type LeaderboardProps = {
  users: UserRow[];
};

export function Leaderboard({ users }: LeaderboardProps) {
  const leaders = [...users].sort((a, b) => b.nuggets_balance - a.nuggets_balance);

  return (
    <section className="space-y-3">
      {leaders.map((user, index) => (
        <article
          key={user.id}
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
              <p className="text-sm font-semibold text-slate-100">#{index + 1} {user.username}</p>
              <p className="text-xs text-slate-400">Niveau Nugget Master</p>
            </div>
          </div>
          <p className="rounded-full bg-green-500 px-3 py-1 text-sm font-extrabold text-slate-950">
            {user.nuggets_balance.toFixed(2)} 🪙
          </p>
        </article>
      ))}
    </section>
  );
}
