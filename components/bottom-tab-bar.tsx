import { Home, Trophy } from "lucide-react";

type Tab = "bets" | "leaderboard";

type BottomTabBarProps = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

export function BottomTabBar({ activeTab, onChange }: BottomTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-amber-200/60 bg-white/90 px-4 pb-5 pt-2 backdrop-blur-xl sm:max-w-xl lg:max-w-2xl">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-amber-50 p-1.5">
        <button
          onClick={() => onChange("bets")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "bets"
              ? "bg-white text-amber-700 shadow"
              : "text-zinc-500 hover:text-amber-700"
          }`}
        >
          <Home className="h-4 w-4" />
          Paris
        </button>

        <button
          onClick={() => onChange("leaderboard")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "leaderboard"
              ? "bg-white text-amber-700 shadow"
              : "text-zinc-500 hover:text-amber-700"
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
