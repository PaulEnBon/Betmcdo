import { Coins, Menu } from "lucide-react";
import { UserRow } from "@/types/bet";

type AppHeaderProps = {
  user: UserRow;
  isLoading?: boolean;
  onOpenMenu: () => void;
};

export function AppHeader({ user, isLoading = false, onOpenMenu }: AppHeaderProps) {
  return (
    <header className="sticky top-4 z-10 mb-6 rounded-2xl border border-slate-700 bg-slate-800/90 p-4 shadow-lg shadow-black/35 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onOpenMenu}
          className="rounded-xl border border-slate-600 bg-slate-700 p-2 text-slate-200 transition hover:border-green-500 hover:text-green-400"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-green-400">NuggetBet</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Paris entre amis</h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-2 text-sm font-extrabold text-slate-950 shadow-sm">
          <Coins className="h-4 w-4" />
          <span>{isLoading ? "..." : user.nuggets_balance.toFixed(2)} Nuggets</span>
        </div>
      </div>
    </header>
  );
}
