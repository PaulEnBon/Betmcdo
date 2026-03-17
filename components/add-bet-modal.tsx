import { useMemo, useState } from "react";
import { X } from "lucide-react";

type AddBetModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddBetModal({ isOpen, onClose }: AddBetModalProps) {
  const [title, setTitle] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");

  const canCreate = useMemo(
    () => title.trim().length > 0 && option1.trim().length > 0 && option2.trim().length > 0,
    [title, option1, option2],
  );

  const handleCreateBet = () => {
    if (!canCreate) return;
    setTitle("");
    setOption1("");
    setOption2("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-zinc-900/45 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-amber-100 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Nouveau pari</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Titre du pari"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
          <input
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            type="text"
            placeholder="Option 1"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
          <input
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            type="text"
            placeholder="Option 2"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <button
          onClick={handleCreateBet}
          disabled={!canCreate}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Créer le pari
        </button>
      </div>
    </div>
  );
}
