import { Home, Trophy } from "lucide-react";

type Tab = "bets" | "leaderboard";

type BottomTabBarProps = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

export function BottomTabBar({ activeTab, onChange }: BottomTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-slate-700 bg-slate-900/90 px-4 pb-5 pt-2 backdrop-blur-xl sm:max-w-xl lg:max-w-2xl">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-800 p-1.5">
        <button
          onClick={() => onChange("bets")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "bets"
              ? "bg-slate-700 text-green-400 shadow"
              : "text-slate-400 hover:text-green-400"
          }`}
        >
          <Home className="h-4 w-4" />
          Paris
        </button>

        <button
          onClick={() => onChange("leaderboard")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "leaderboard"
              ? "bg-slate-700 text-green-400 shadow"
              : "text-slate-400 hover:text-green-400"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Classement
        </button>
      </div>
    </nav>
  );
}

export type { Tab };
