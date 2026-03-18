"use client";

import { useState } from "react";
import { useNugget } from "@/context/NuggetContext";
import { toast } from "sonner";

interface AddBetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBetModal({ isOpen, onClose }: AddBetModalProps) {
  const { addBet } = useNugget();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !option1 || !option2) {
      toast.error("Veuillez remplir le titre et les deux options.");
      return;
    }

    setIsSubmitting(true);
    try {
      // On formate les options comme Supabase l'attend (Titre + Cote par défaut)
      const formattedOptions = [
        { title: option1, odds: 2.0 },
        { title: option2, odds: 2.0 },
      ];

      await addBet({
        title,
        description,
        options: formattedOptions,
      });

      // Réinitialisation du formulaire
      setTitle("");
      setDescription("");
      setOption1("");
      setOption2("");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Créer un nouveau pari</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Titre de l'événement</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Thomas va-t-il arriver en retard ?" 
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Option 1</label>
            <input 
              type="text" 
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              placeholder="Ex: Oui, comme toujours" 
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Option 2</label>
            <input 
              type="text" 
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              placeholder="Ex: Non, miracle !" 
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-400 transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création..." : "Lancer le pari"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}