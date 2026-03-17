import { Coins } from "lucide-react";

type AppHeaderProps = {
  nuggets: number;
};

export function AppHeader({ nuggets }: AppHeaderProps) {
  return (
    <header className="sticky top-4 z-10 mb-6 rounded-2xl border border-amber-200/60 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-amber-700">NuggetBet</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Paris entre amis</h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-2 text-sm font-bold text-white shadow-sm">
          <Coins className="h-4 w-4" />
          <span>{nuggets} Nuggets</span>
        </div>
      </div>
    </header>
  );
}
