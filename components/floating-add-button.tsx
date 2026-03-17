import { Plus } from "lucide-react";

type FloatingAddButtonProps = {
  onClick: () => void;
};

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-20 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-300/60 transition hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
      aria-label="Créer un pari"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}
