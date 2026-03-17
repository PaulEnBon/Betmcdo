import { Plus } from "lucide-react";

type FloatingAddButtonProps = {
  onClick: () => void;
};

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-20 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-slate-950 shadow-lg shadow-green-500/40 transition hover:bg-green-400 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400/40"
      aria-label="Créer un pari"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}
