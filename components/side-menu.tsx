"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, Home, LogOut, ScrollText, Trophy, UserCircle2, X } from "lucide-react";
import { User } from "@/types/bet";

type SideMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
};

const links = [
  { label: "Accueil", icon: Home },
  { label: "Mon Historique", icon: History },
  { label: "Classement", icon: Trophy },
  { label: "Règles du jeu", icon: ScrollText },
];

export function SideMenu({ isOpen, onClose, user }: SideMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed left-0 top-0 z-50 h-full w-[85%] max-w-sm border-r border-slate-700 bg-slate-900 p-4 shadow-2xl"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <UserCircle2 className="h-12 w-12 text-green-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                  <p className="text-xs font-extrabold text-amber-300">{user.nuggets.toFixed(2)} Nuggets</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                aria-label="Fermer le menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-2">
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl bg-slate-800 px-3 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-green-400"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button className="absolute bottom-4 left-4 right-4 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/15">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
